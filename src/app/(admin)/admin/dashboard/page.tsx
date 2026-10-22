"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Clock,
  Ban,
  Users,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  DollarSign,
  Shield,
  Activity,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson("/api/admin/analytics")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
          Loading Platform Telemetry...
        </span>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-neutral-900 selection:bg-emerald-600 selection:text-white animate-in fade-in duration-300">
      {/* Top Banner & Quick Actions - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span>Platform Root Control</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-emerald-400" />
            Super Administrator Console
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl font-medium">
            Commercial multi-tenant SaaS telemetry, live revenue metrics, and tenant onboarding controls.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/admin/businesses"
            className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 border border-emerald-400/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Provision New Store &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Total Businesses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-950 mt-4 font-mono tracking-tight">{metrics.totalBusinesses || 0}</p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <span className="font-bold text-emerald-700">{metrics.activeBusinesses || 0} active</span>
            <span className="text-neutral-300">•</span>
            <span className="font-bold text-neutral-700">{metrics.trialBusinesses || 0} trials</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Monthly Recurring (MRR)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-4 font-mono tracking-tight">{formatLKR(metrics.mrrLkr || 0)}</p>
          <p className="mt-2.5 text-xs text-neutral-500 font-medium">Predictable subscription volume</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Total Staff Logins
            </span>
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-950 mt-4 font-mono tracking-tight">{metrics.totalUsers || 0}</p>
          <p className="mt-2.5 text-xs text-neutral-500 font-medium">Active platform accounts</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Suspended Accounts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shadow-2xs">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-950 mt-4 font-mono tracking-tight">{metrics.suspendedBusinesses || 0}</p>
          <p className="mt-2.5 text-xs text-neutral-500 font-medium">Overdue or past-due subscriptions</p>
        </div>
      </div>

      {/* Recent Businesses Section */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-neutral-950">Recently Onboarded Tenants</h2>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">Latest provisioned business accounts on the SaaS platform</p>
          </div>
          <Link
            href="/admin/businesses"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <span>View All Tenants</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-3.5">Business Name</th>
                <th className="p-3.5">Login ID / Code</th>
                <th className="p-3.5">Business Vertical</th>
                <th className="p-3.5">WhatsApp Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Provisioned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {data?.recentBusinesses?.map((b: any) => (
                <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-3.5 font-bold text-neutral-950">{b.name}</td>
                  <td className="p-3.5 font-mono font-black text-emerald-800">{b.code}</td>
                  <td className="p-3.5 text-neutral-600 font-medium">{b.businessType}</td>
                  <td className="p-3.5 text-neutral-700 font-mono font-bold">{b.phone}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        b.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : b.status === "TRIAL"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      } font-mono`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-500 font-medium">
                    {new Date(b.createdAt).toLocaleDateString("en-LK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
