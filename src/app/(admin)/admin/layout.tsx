"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  Building2,
  CreditCard,
  ShieldAlert,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { Ticket2GrowLogo } from "@/components/brand/Ticket2GrowLogo";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson("/api/auth/me")
      .then((data) => {
        if (!data || data.user?.platformRole !== "SUPER_ADMIN") {
          router.push("/login");
        } else {
          setAdminUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest">
            Loading Admin Console...
          </span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Tenants & Businesses", href: "/admin/businesses", icon: Building2 },
    { label: "Subscription Plans", href: "/admin/plans", icon: CreditCard },
    { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-marble-luxury text-neutral-900 flex selection:bg-emerald-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white/95 backdrop-blur-xl border-r border-emerald-950/10 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-emerald-950/10 flex items-center justify-between bg-white">
          <Link href="/admin/dashboard" className="flex flex-col gap-1">
            <Ticket2GrowLogo size="sm" variant="dark" />
            <span className="text-[10px] font-black text-emerald-700 block tracking-widest uppercase pl-0.5">
              Super Admin Root
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-emerald-800/60">
            System Administration
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25 font-black ring-2 ring-emerald-500 ring-offset-1"
                    : "text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50/70"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-700"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User / Logout Bar */}
        <div className="p-4 border-t border-emerald-950/10 bg-marble-subtle">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-neutral-950 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <User className="w-4 h-4 text-emerald-100" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-neutral-950 truncate">{adminUser?.name}</p>
                <p className="text-[10px] text-emerald-700 font-mono font-bold">{adminUser?.loginId}</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
              Root
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 text-neutral-900 hover:text-emerald-800 text-xs font-extrabold rounded-xl border border-emerald-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-marble-luxury p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

