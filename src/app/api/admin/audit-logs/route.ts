import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    await TenantService.requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const search = searchParams.get("search") || "";

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const logs = await prisma.auditLog.findMany({
      where: {
        ...dateFilter,
        ...(search
          ? {
              OR: [
                { action: { contains: search } },
                { entity: { contains: search } },
                { metadata: { contains: search } },
                { business: { name: { contains: search } } },
                { user: { name: { contains: search } } },
                { user: { loginId: { contains: search } } },
              ],
            }
          : {}),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { name: true, code: true } },
        user: { select: { name: true, loginId: true } },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs." }, { status: 500 });
  }
}
