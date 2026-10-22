import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";

export async function GET() {
  try {
    await TenantService.requireSuperAdmin();

    const totalBusinesses = await prisma.business.count();
    const activeBusinesses = await prisma.business.count({ where: { status: "ACTIVE" } });
    const trialBusinesses = await prisma.business.count({ where: { status: "TRIAL" } });
    const suspendedBusinesses = await prisma.business.count({ where: { status: "SUSPENDED" } });
    const totalUsers = await prisma.user.count({ where: { platformRole: "USER" } });
    const totalSales = await prisma.sale.count();

    // Calculate MRR from active subscriptions
    const activeSubs = await prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIAL"] } },
      include: { plan: true },
    });

    const mrrLkr = activeSubs.reduce((sum, s) => {
      if (s.status === "ACTIVE") {
        return sum + (s.plan.monthlyPriceLkr || 0);
      }
      return sum;
    }, 0);

    const recentBusinesses = await prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalBusinesses,
        activeBusinesses,
        trialBusinesses,
        suspendedBusinesses,
        totalUsers,
        totalSales,
        mrrLkr,
      },
      recentBusinesses,
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load platform analytics." }, { status: 500 });
  }
}
