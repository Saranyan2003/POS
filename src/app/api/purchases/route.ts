import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const branchParam = searchParams.get("branchId");

    const targetBranchId = branchId ? branchId : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          purchaseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const purchases = await prisma.purchase.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        ...dateFilter,
        ...(search
          ? {
              OR: [
                { invoiceNumber: { contains: search } },
                { supplier: { name: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, purchases, activeBranchId: targetBranchId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch purchases." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManagePurchases");

    if (!branchId) {
      return NextResponse.json({ error: "Active branch required for receiving purchases." }, { status: 400 });
    }

    const body = await req.json();
    const { supplierId, invoiceNumber, items, tax = 0, discount = 0, paidAmount = 0 } = body;

    if (!supplierId || !invoiceNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Supplier, invoice number, and at least one item are required." },
        { status: 400 }
      );
    }

    // Verify supplier belongs to business
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });
    if (!supplier) {
      return NextResponse.json({ error: "Selected supplier does not exist in this business." }, { status: 400 });
    }

    // Validate item inputs
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json({ error: "Each purchase item must have a valid product and quantity > 0." }, { status: 400 });
      }
      if (typeof item.unitCost !== "number" || item.unitCost < 0) {
        return NextResponse.json({ error: "Unit cost cannot be negative." }, { status: 400 });
      }
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // Verify all products belong to business
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, businessId, isActive: true },
      });
      if (dbProducts.length !== productIds.length) {
        throw new Error("One or more products in the delivery are invalid or inactive.");
      }

      let subtotal = 0;
      for (const item of items) {
        subtotal += parseFloat(item.quantity) * parseFloat(item.unitCost);
      }
      const parsedTax = Math.max(0, parseFloat(tax || 0));
      const parsedDiscount = Math.max(0, parseFloat(discount || 0));
      const total = Math.max(0, subtotal + parsedTax - parsedDiscount);
      const parsedPaid = Math.max(0, parseFloat(paidAmount || 0));

      // 1. Create Purchase Record
      const createdPurchase = await tx.purchase.create({
        data: {
          businessId,
          branchId,
          supplierId,
          invoiceNumber: invoiceNumber.trim(),
          subtotal,
          tax: parsedTax,
          discount: parsedDiscount,
          total,
          paidAmount: Math.min(total, parsedPaid),
          isCompleted: true,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: parseFloat(i.quantity),
              unitCost: parseFloat(i.unitCost),
              totalCost: parseFloat(i.quantity) * parseFloat(i.unitCost),
            })),
          },
        },
      });

      // 2. Update supplier payables (outstanding balance) for unpaid amount
      const unpaidBalance = Math.max(0, total - parsedPaid);
      if (unpaidBalance > 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            outstandingBalance: { increment: unpaidBalance },
          },
        });
      }

      // 3. Increase branch stock and log inward movements
      for (const item of items) {
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId,
              productId: item.productId,
            },
          },
        });

        const currentQty = inv?.quantity ?? 0;
        const newQty = currentQty + parseFloat(item.quantity);

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty },
          });
        } else {
          await tx.inventory.create({
            data: {
              branchId,
              productId: item.productId,
              quantity: newQty,
            },
          });
        }

        // Record inward stock movement
        await tx.inventoryMovement.create({
          data: {
            branchId,
            productId: item.productId,
            type: "PURCHASE_INWARD",
            quantity: parseFloat(item.quantity),
            balanceAfter: newQty,
            referenceId: createdPurchase.id,
            notes: `Inward delivery from ${supplier.name} (Inv #${invoiceNumber})`,
          },
        });
      }

      return createdPurchase;
    });

    await AuditService.log({
      businessId,
      userId,
      action: "PURCHASE_RECORDED",
      entity: "Purchase",
      entityId: purchase.id,
      metadata: { invoiceNumber, supplierName: supplier.name, total: purchase.total },
    });

    return NextResponse.json({ success: true, message: "Purchase order inward processed and inventory restocked!", purchase });
  } catch (error: any) {
    console.error("Purchase creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to process purchase order." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManagePurchases");
    const { searchParams } = new URL(req.url);
    const purchaseId = searchParams.get("id") || searchParams.get("purchaseId");

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID is required." }, { status: 400 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: { id: purchaseId, businessId },
      include: {
        items: true,
        supplier: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase order not found or unauthorized." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Deduct the inward stock quantities from branch inventory
      for (const item of purchase.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: purchase.branchId || branchId!,
              productId: item.productId,
            },
          },
        });

        const currentQty = inv?.quantity ?? 0;
        const newQty = Math.max(0, currentQty - item.quantity);

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            branchId: purchase.branchId || branchId!,
            productId: item.productId,
            type: "PURCHASE_CANCELLED",
            quantity: -item.quantity,
            balanceAfter: newQty,
            referenceId: purchase.id,
            notes: `Mistaken Inward Order #${purchase.invoiceNumber} deleted and stock deducted.`,
          },
        });
      }

      // 2. Deduct unpaid balance from supplier outstanding balance
      const unpaidBalance = Math.max(0, purchase.total - purchase.paidAmount);
      if (unpaidBalance > 0 && purchase.supplierId) {
        const supplier = await tx.supplier.findUnique({ where: { id: purchase.supplierId } });
        if (supplier) {
          const newOutstanding = Math.max(0, supplier.outstandingBalance - unpaidBalance);
          await tx.supplier.update({
            where: { id: purchase.supplierId },
            data: { outstandingBalance: newOutstanding },
          });
        }
      }

      // 3. Delete purchase items and purchase record
      await tx.purchaseItem.deleteMany({ where: { purchaseId: purchase.id } });
      await tx.purchase.delete({ where: { id: purchase.id } });
    });

    await AuditService.log({
      businessId,
      userId,
      action: "PURCHASE_DELETED",
      entity: "Purchase",
      entityId: purchase.id,
      metadata: { invoiceNumber: purchase.invoiceNumber, supplierName: purchase.supplier?.name, total: purchase.total },
    });

    return NextResponse.json({
      success: true,
      message: `Mistaken delivery order #${purchase.invoiceNumber} removed. Inventory deducted and supplier balance adjusted.`,
    });
  } catch (error: any) {
    console.error("Purchase deletion error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove purchase order." }, { status: 500 });
  }
}

