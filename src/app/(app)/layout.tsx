"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Package,
  Boxes,
  Truck,
  Users,
  Building,
  DollarSign,
  BarChart3,
  UserCheck,
  GitBranch,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { Ticket2GrowLogo } from "@/components/brand/Ticket2GrowLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  show: boolean;
  highlight?: boolean;
  badge?: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

export default function TenantAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchSession = async () => {
    try {
      const data = await safeFetchJson("/api/auth/me");
      if (!data || !data.authenticated) {
        router.push("/login");
      } else if (data.user?.isTemporaryPassword) {
        router.push("/change-password");
      } else if (data.user?.platformRole === "SUPER_ADMIN" && !data.user?.businessId) {
        router.push("/admin/dashboard");
      } else {
        setSessionData(data);
        setLoading(false);
      }
    } catch {
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleBranchSwitch = async (branchId: string) => {
    await fetch("/api/branches", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    fetchSession();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest">
            Loading POS...
          </span>
        </div>
      </div>
    );
  }

  const role = sessionData?.user?.businessRole;
  const isOwner = role === "BUSINESS_OWNER";
  const isCashier = role === "CASHIER";

  const navGroups: NavGroup[] = [
    {
      category: "Billing & Sales",
      items: [
        { label: "POS Terminal", href: "/pos", icon: ShoppingBag, show: true, highlight: true, badge: "F2" },
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: !isCashier },
        { label: "Sales & Receipts", href: "/sales", icon: Receipt, show: true },
      ],
    },
    {
      category: "Inventory & Items",
      items: [
        { label: "Products & Menu", href: "/products", icon: Package, show: !isCashier },
        { label: "Stock Inventory", href: "/inventory", icon: Boxes, show: !isCashier },
        { label: "Supplier Purchases", href: "/purchases", icon: Truck, show: !isCashier },
      ],
    },
    {
      category: "Accounts & Khata",
      items: [
        { label: "Customer Khata", href: "/customers", icon: Users, show: true },
        { label: "Suppliers Directory", href: "/suppliers", icon: Building, show: !isCashier },
        { label: "Expenses", href: "/expenses", icon: DollarSign, show: isOwner },
        { label: "Reports & Profit", href: "/reports", icon: BarChart3, show: isOwner || role === "MANAGER" },
      ],
    },
    {
      category: "Settings",
      items: [
        { label: "Staff Logins", href: "/staff", icon: UserCheck, show: isOwner },
        { label: "Store Branches", href: "/branches", icon: GitBranch, show: isOwner },
        { label: "Subscription", href: "/subscription", icon: CreditCard, show: isOwner },
        { label: "Store Settings", href: "/settings", icon: Settings, show: isOwner },
      ],
    },
  ];

  const activeBranch =
    sessionData?.branches?.find((b: any) => b.id === sessionData?.user?.branchId) ||
    sessionData?.branches?.[0];

  return (
    <div className="min-h-screen bg-marble-luxury text-neutral-900 flex flex-col md:flex-row font-sans selection:bg-emerald-600 selection:text-white">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-emerald-950/10 p-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-neutral-950 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-900/20">
            <Store className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h2 className="text-xs font-black text-neutral-950 truncate max-w-[180px]">
              {sessionData?.user?.businessName || "My Store"}
            </h2>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              {sessionData?.user?.businessType || "Retail"} • {sessionData?.user?.loginId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="px-3.5 py-1.5 btn-emerald-solid rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-700 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Collapsible & Compact) */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex ${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        } bg-white/95 backdrop-blur-xl border-r border-emerald-950/10 flex-col shrink-0 z-30 md:static fixed inset-y-0 left-0 w-64 shadow-xl md:shadow-none transition-all duration-200`}
      >
        {/* Business Brand Header */}
        <div className="p-4 border-b border-emerald-950/10 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-neutral-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/25 ring-1 ring-emerald-500/30 shrink-0">
                <Store className="w-5 h-5 text-emerald-100" />
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <span className="font-black text-sm tracking-tight text-neutral-950 block truncate">
                    {sessionData?.user?.businessName || "My Store"}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase truncate">
                    {sessionData?.user?.businessType || "Retail"} • Ticket2Grow
                  </span>
                </div>
              )}
            </div>

            {/* Collapse Toggle for Desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 text-neutral-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Branch Switcher (when expanded) */}
          {!sidebarCollapsed && sessionData?.branches && sessionData.branches.length > 1 && isOwner && (
            <div className="mt-3 pt-2.5 border-t border-emerald-950/10">
              <select
                value={activeBranch?.id || ""}
                onChange={(e) => handleBranchSwitch(e.target.value)}
                className="w-full bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 rounded-xl py-1.5 px-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer font-bold transition-all"
              >
                {sessionData.branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav className="p-3 space-y-5 flex-1 overflow-y-auto scrollbar-none">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-emerald-800/60">
                    {group.category}
                  </div>
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  if (item.highlight) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        title={item.label}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all mb-2 shadow-sm ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-500"
                            : "bg-neutral-950 text-white hover:bg-emerald-950 hover:text-emerald-100 hover:border-emerald-500/40 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && item.badge && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500 text-neutral-950 font-black uppercase shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={item.label}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-800/25 font-black"
                          : "text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-700/70"}`} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Profile & Logout Bottom Footer */}
        <div className="p-3 border-t border-emerald-950/10 bg-marble-subtle">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="overflow-hidden">
                <p className="text-xs font-black text-neutral-950 truncate">{sessionData?.user?.name}</p>
                <p className="text-[10px] text-emerald-700 font-mono font-bold">{sessionData?.user?.loginId}</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                {sessionData?.user?.businessRole}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-neutral-900 hover:text-emerald-800 text-xs font-bold rounded-xl border border-emerald-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-marble-luxury p-3 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
