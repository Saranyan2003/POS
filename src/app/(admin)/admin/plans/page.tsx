"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, Building2, Package, Users, ShieldCheck, Sparkles, Layers, Shield } from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson("/api/admin/plans").then((d) => {
      setPlans(d?.plans || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Monetization Tier
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              Platform Pricing Architecture
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Subscription Plans & Monetization
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Unified single subscription tier with 100% unrestricted quotas across all tenant stores in Sri Lanka.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-white/95 backdrop-blur-md border-2 border-emerald-600/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden hover:border-emerald-500 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-neutral-950">{p.name}</h3>
                  <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                  {p._count?.subscriptions || 0} active tenants
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">{p.description}</p>
              <div className="mt-5 mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-700 font-mono">{formatLKR(p.monthlyPriceLkr)}</span>
                <span className="text-xs text-neutral-500 font-mono"> / month</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-800 border-t border-emerald-900/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Max Products:</span>
                  </span>
                  <span className="font-mono font-black px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md text-[10px] uppercase">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Max Staff Logins:</span>
                  </span>
                  <span className="font-mono font-black px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md text-[10px] uppercase">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Max Outlets / Branches:</span>
                  </span>
                  <span className="font-mono font-black px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md text-[10px] uppercase">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Monthly Sales Invoices:</span>
                  </span>
                  <span className="font-mono font-black px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md text-[10px] uppercase">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-Branch Stock Isolation:</span>
                  </span>
                  <span className="font-bold text-emerald-800">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thermal Receipt ESC/POS:</span>
                  </span>
                  <span className="font-bold text-emerald-800">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Financial Profit & Loss Reports:</span>
                  </span>
                  <span className="font-bold text-emerald-800">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
