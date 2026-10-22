import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { POSService } from "@/services/pos.service";
import { AuditService } from "@/services/audit.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const branchParam = searchParams.get("branchId");

    const targetBranchId = branchId ? branchId : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          saleDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const sales = await prisma.sale.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        ...(status ? { status } : {}),
        ...dateFilter,
        ...(search
          ? {
              OR: [
                { invoiceNumber: { contains: search } },
                { customer: { name: { contains: search } } },
                { customer: { phone: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        cashier: { select: { name: true, loginId: true } },
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { saleDate: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, sales, activeBranchId: targetBranchId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sales." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canProcessRefunds");
    const body = await req.json();
    const { saleId, reason, items } = body;

    if (!saleId || !reason || !items || items.length === 0) {
      return NextResponse.json({ error: "Sale ID, reason, and return items are required." }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ error: "Active branch context required." }, { status: 400 });
    }

    const returnRecord = await POSService.processReturn({
      saleId,
      businessId,
      branchId,
      processedById: userId,
      reason,
      items,
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SALE_REFUNDED",
      entity: "Sale",
      entityId: saleId,
      metadata: { returnNumber: returnRecord.returnNumber, refundAmount: returnRecord.refundAmount, reason },
    });

    return NextResponse.json({ success: true, message: "Refund processed, customer credit adjusted, and stock restored.", returnRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process refund." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canProcessRefunds");
    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("id") || searchParams.get("saleId");
    const reason = searchParams.get("reason") || "Mistaken entry voided";

    if (!saleId) {
      return NextResponse.json({ error: "Sale ID is required to void invoice." }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ error: "Active branch context required." }, { status: 400 });
    }

    const voidedSale = await POSService.voidSale({
      saleId,
      businessId,
      branchId,
      userId,
      reason,
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SALE_VOIDED",
      entity: "Sale",
      entityId: saleId,
      metadata: { invoiceNumber: voidedSale.invoiceNumber, total: voidedSale.total, reason },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${voidedSale.invoiceNumber} voided. Stock returned to branch inventory and customer credit adjusted.`,
      sale: voidedSale,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to void sale invoice." }, { status: 500 });
  }
}

