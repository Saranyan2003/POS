import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { branchId, businessId } = await TenantService.requireTenantContext();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || "";
    const type = searchParams.get("type") || "";
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        ...(branchId ? { branchId } : { branch: { businessId } }),
        ...(productId ? { productId } : {}),
        ...(type ? { type } : {}),
        ...dateFilter,
      },
      include: {
        product: { select: { name: true, sku: true, barcode: true, unit: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, movements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch inventory movements." }, { status: 500 });
  }
}
