import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let entitlements = null;
  let branches: any[] = [];

  if (session.businessId) {
    try {
      entitlements = await SubscriptionService.getBusinessEntitlements(session.businessId);
      branches = await prisma.branch.findMany({
        where: { businessId: session.businessId, isActive: true },
        select: { id: true, name: true, code: true, isDefault: true },
      });
    } catch (e) {
      console.error("Error fetching business entitlements:", e);
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      loginId: session.loginId,
      name: session.name,
      platformRole: session.platformRole,
      businessId: session.businessId,
      branchId: session.branchId,
      businessRole: session.businessRole,
      businessName: session.businessName,
      businessType: session.businessType,
      isTemporaryPassword: session.isTemporaryPassword,
      business: session.businessId
        ? {
            id: session.businessId,
            name: session.businessName,
            businessType: session.businessType,
          }
        : null,
    },
    branches,
    entitlements,
  });
}
