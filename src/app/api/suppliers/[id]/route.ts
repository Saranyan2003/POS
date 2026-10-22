import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
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

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        products: {
          where: { businessId, isActive: true },
          select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true, unit: true },
        },
        purchases: {
          where: {
            businessId,
            ...(targetBranchId ? { branchId: targetBranchId } : {}),
            ...dateFilter,
          },
          include: {
            branch: { select: { id: true, name: true, code: true } },
            items: { include: { product: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier || supplier.businessId !== businessId) {
      return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, supplier, activeBranchId: targetBranchId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch supplier." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageSuppliers");
    const { id } = await params;
    const body = await req.json();

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier || supplier.businessId !== businessId) {
      return NextResponse.json({ error: "Supplier vendor record not found." }, { status: 404 });
    }

    // Action: Record Vendor Bill Payment / Settlement
    if (body.action === "RECORD_PAYMENT") {
      const paymentAmount = parseFloat(body.amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return NextResponse.json({ error: "Valid payment amount greater than 0 is required." }, { status: 400 });
      }

      if (supplier.outstandingBalance <= 0) {
        return NextResponse.json(
          { error: "This supplier currently has no outstanding payable balance (Rs. 0.00)." },
          { status: 400 }
        );
      }

      if (paymentAmount > supplier.outstandingBalance) {
        return NextResponse.json(
          {
            error: `Payment amount (Rs. ${paymentAmount.toFixed(2)}) cannot exceed outstanding payable balance (Rs. ${supplier.outstandingBalance.toFixed(2)}).`,
          },
          { status: 400 }
        );
      }

      const newBalance = Math.max(0, supplier.outstandingBalance - paymentAmount);

      const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: {
          outstandingBalance: newBalance,
        },
      });

      await AuditService.log({
        businessId,
        userId,
        action: "SUPPLIER_PAYMENT_RECORDED",
        entity: "Supplier",
        entityId: supplier.id,
        metadata: {
          supplierName: supplier.name,
          paymentAmount,
          method: body.paymentMethod || "BANK_TRANSFER",
          reference: body.reference || "",
          previousBalance: supplier.outstandingBalance,
          newBalance,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payment of Rs. ${paymentAmount.toLocaleString()} recorded to ${supplier.name}! Remaining payable: Rs. ${newBalance.toFixed(2)}`,
        supplier: updatedSupplier,
      });
    }

    // Action: Update Supplier Profile
    const { name, contactPerson, phone, email, address, notes } = body;

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        contactPerson: contactPerson !== undefined ? (contactPerson ? contactPerson.trim() : null) : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        address: address !== undefined ? (address ? address.trim() : null) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SUPPLIER_UPDATED",
      entity: "Supplier",
      entityId: supplier.id,
      metadata: { name: updatedSupplier.name, phone: updatedSupplier.phone },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier details updated successfully!",
      supplier: updatedSupplier,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update supplier." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageSuppliers");
    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier || supplier.businessId !== businessId) {
      return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
    }

    if (supplier.outstandingBalance > 0) {
      return NextResponse.json(
        { error: `Cannot remove supplier with an outstanding payable debt balance of Rs. ${supplier.outstandingBalance.toFixed(2)}. Settle payables first.` },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SUPPLIER_DELETED",
      entity: "Supplier",
      entityId: id,
      metadata: { name: supplier.name, phone: supplier.phone },
    });

    return NextResponse.json({
      success: true,
      message: `Supplier ${supplier.name} removed successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove supplier." }, { status: 500 });
  }
}

