export type BusinessRole = "BUSINESS_OWNER" | "MANAGER" | "CASHIER" | "INVENTORY_MANAGER";
export type PlatformRole = "SUPER_ADMIN" | "USER";

export interface UserSessionContext {
  userId: string;
  loginId: string;
  name: string;
  platformRole: PlatformRole;
  businessId?: string;
  branchId?: string;
  businessRole?: BusinessRole;
  businessName?: string;
  businessType?: string;
  isTemporaryPassword?: boolean;
}

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    canManageBusinesses: true,
    canManageSubscriptions: true,
    canViewPlatformAnalytics: true,
    canViewAllAuditLogs: true,
  },
  BUSINESS_OWNER: {
    canAccessPOS: true,
    canManageProducts: true,
    canManageInventory: true,
    canManagePurchases: true,
    canManageSuppliers: true,
    canManageCustomers: true,
    canManageExpenses: true,
    canManageStaff: true,
    canManageBranches: true,
    canViewReports: true,
    canManageSettings: true,
    canManageSubscription: true,
    canProcessRefunds: true,
    canViewProfitEstimates: true,
  },
  MANAGER: {
    canAccessPOS: true,
    canManageProducts: true,
    canManageInventory: true,
    canManagePurchases: true,
    canManageSuppliers: true,
    canManageCustomers: true,
    canManageExpenses: false,
    canManageStaff: false,
    canManageBranches: false,
    canViewReports: true,
    canManageSettings: false,
    canManageSubscription: false,
    canProcessRefunds: true,
    canViewProfitEstimates: false,
  },
  INVENTORY_MANAGER: {
    canAccessPOS: false,
    canManageProducts: true,
    canManageInventory: true,
    canManagePurchases: true,
    canManageSuppliers: true,
    canManageCustomers: false,
    canManageExpenses: false,
    canManageStaff: false,
    canManageBranches: false,
    canViewReports: false,
    canManageSettings: false,
    canManageSubscription: false,
    canProcessRefunds: false,
    canViewProfitEstimates: false,
  },
  CASHIER: {
    canAccessPOS: true,
    canManageProducts: false,
    canManageInventory: false,
    canManagePurchases: false,
    canManageSuppliers: false,
    canManageCustomers: true,
    canManageExpenses: false,
    canManageStaff: false,
    canManageBranches: false,
    canViewReports: false,
    canManageSettings: false,
    canManageSubscription: false,
    canProcessRefunds: false, // Requires owner or manager override
    canViewProfitEstimates: false,
  },
} as const;

export function hasPermission(
  role: BusinessRole | undefined,
  permission: keyof typeof ROLE_PERMISSIONS.BUSINESS_OWNER
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return !!permissions[permission as keyof typeof permissions];
}
