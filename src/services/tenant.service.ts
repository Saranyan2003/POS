import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BusinessRole, hasPermission, ROLE_PERMISSIONS } from "@/lib/permissions";

export class TenantService {
  /**
   * Enforces server-side tenant isolation and returns authorized context
   */
  static async requireTenantContext(requiredPermission?: keyof typeof ROLE_PERMISSIONS.BUSINESS_OWNER) {
    const session = await getSession();

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    if (session.isTemporaryPassword) {
      throw new Error("PASSWORD_CHANGE_REQUIRED");
    }

    if (!session.businessId) {
      throw new Error("NO_ACTIVE_BUSINESS");
    }

    // Verify business exists and is not suspended
    const business = await prisma.business.findUnique({
      where: { id: session.businessId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!business) {
      throw new Error("BUSINESS_NOT_FOUND");
    }

    const latestSub = business.subscriptions[0];
    const isTrial = business.status === "TRIAL" || latestSub?.status === "TRIAL";
    const isExpiredTrial = isTrial && latestSub?.trialEndDate && new Date() > new Date(latestSub.trialEndDate);

    // Automatically suspend account if trial period has finished
    if (isExpiredTrial) {
      await prisma.business.update({
        where: { id: business.id },
        data: { status: "SUSPENDED" },
      });

      if (latestSub) {
        await prisma.subscription.update({
          where: { id: latestSub.id },
          data: { status: "SUSPENDED" },
        });
      }

      throw new Error("BUSINESS_SUSPENDED");
    }

    if (business.status === "SUSPENDED") {
      throw new Error("BUSINESS_SUSPENDED");
    }

    // Check permission if specified
    if (requiredPermission && session.businessRole) {
      const allowed = hasPermission(session.businessRole, requiredPermission);
      if (!allowed) {
        throw new Error("FORBIDDEN_PERMISSION_DENIED");
      }
    }

    return {
      session,
      businessId: session.businessId,
      branchId: session.branchId,
      role: session.businessRole as BusinessRole,
      userId: session.userId,
      business,
    };
  }

  /**
   * Enforces Super Admin access
   */
  static async requireSuperAdmin() {
    const session = await getSession();

    if (!session || session.platformRole !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN_SUPER_ADMIN_REQUIRED");
    }

    return { session, userId: session.userId };
  }
}
