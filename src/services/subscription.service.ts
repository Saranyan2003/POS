import { prisma } from "@/lib/db";

export interface PlanLimits {
  maxProducts: number;
  maxEmployees: number;
  maxBranches: number;
  maxMonthlyInvoices: number;
  hasAdvancedReports: boolean;
  hasBarcodePrinting: boolean;
  hasMultiBranch: boolean;
  hasWhatsAppAlerts: boolean;
}

export class SubscriptionService {
  /**
   * Retrieves the active plan limits and usage status for a business
   */
  static async getBusinessEntitlements(businessId: string): Promise<{
    status: string;
    isTrial: boolean;
    trialDaysRemaining: number;
    planName: string;
    limits: PlanLimits;
    currentUsage: {
      productsCount: number;
      employeesCount: number;
      branchesCount: number;
      monthlyInvoicesCount: number;
    };
  }> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            products: { where: { isActive: true } },
            userBusinesses: true,
            branches: { where: { isActive: true } },
          },
        },
      },
    });

    if (!business) {
      throw new Error("Business not found");
    }

    const currentSubscription = business.subscriptions[0];
    const plan = currentSubscription?.plan;

    // No limitations - all features and resources unlimited
    const limits: PlanLimits = {
      maxProducts: 999999,
      maxEmployees: 999999,
      maxBranches: 999999,
      maxMonthlyInvoices: 999999,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    };

    // Calculate monthly invoices in the current calendar month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyInvoicesCount = await prisma.sale.count({
      where: {
        businessId,
        createdAt: { gte: startOfMonth },
      },
    });

    let trialDaysRemaining = 0;
    const isTrial = currentSubscription?.status === "TRIAL" || business.status === "TRIAL";
    if (isTrial && currentSubscription?.trialEndDate) {
      const now = new Date();
      const end = new Date(currentSubscription.trialEndDate);
      const diffMs = end.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      status: currentSubscription?.status || business.status,
      isTrial,
      trialDaysRemaining,
      planName: plan?.name || "All-in-One Unlimited",
      limits,
      currentUsage: {
        productsCount: business._count.products,
        employeesCount: business._count.userBusinesses,
        branchesCount: business._count.branches,
        monthlyInvoicesCount,
      },
    };
  }

  /**
   * Checks if adding products is allowed - Always allowed with no limitations
   */
  static async checkCanAddProduct(_businessId: string): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  /**
   * Checks if adding staff is allowed - Always allowed with no limitations
   */
  static async checkCanAddEmployee(_businessId: string): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  /**
   * Checks if adding branch is allowed - Always allowed with no limitations
   */
  static async checkCanAddBranch(_businessId: string): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }
}
