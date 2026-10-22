"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, MessageCircle, Package, Users, Building2, Receipt, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { WhatsAppLaunchModal } from "@/components/whatsapp/WhatsAppLaunchModal";

export default function SubscriptionPage() {
  const [entitlements, setEntitlements] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>("My Business");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson("/api/auth/me").then((d) => {
      if (d?.entitlements) setEntitlements(d.entitlements);
      if (d?.user?.business?.name) setBusinessName(d.user.business.name);
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

  const [modalOpen, setModalOpen] = useState(false);
  const usage = entitlements?.currentUsage || {};
  const whatsappSalesNumber = "94704022301";

  const upgradeMsg = `Hello Ticket2Grow Support! I am the owner of ${businessName} and would like assistance regarding my Unlimited subscription (Rs. 4,999/mo).`;
  const upgradeWhatsAppLink = getWhatsAppDirectUrl(whatsappSalesNumber, upgradeMsg);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Current Subscription Card - Obsidian & Emerald Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Active Tier
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white font-mono shadow-xs">
                Rs. 4,999 / mo
              </span>
            </div>

            <h1 className="text-3xl font-black text-white flex items-center gap-2.5">
              <span>All-in-One Unlimited Plan</span>
              <Sparkles className="w-5 h-5 text-emerald-400 fill-current" />
            </h1>

            <p className="text-xs text-neutral-300 mt-1">
              Full unlimited platform access with zero restrictions on products, staff, branches, or billing.
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 text-emerald-200 border border-emerald-500/30 backdrop-blur-md">
                Status: {entitlements?.status}
              </span>
              {entitlements?.isTrial && (
                <span className="text-xs text-neutral-300 font-semibold bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                  {entitlements?.trialDaysRemaining} days remaining in trial
                </span>
              )}
            </div>
          </div>

          <a
            href={upgradeWhatsAppLink}
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer active:scale-95 border border-emerald-400/30"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Manage Billing via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Plan Entitlements & Usage Overview */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-neutral-950">Active Entitlements & Live Usage</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Your subscription includes 100% unrestricted capacity across all store operations.</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>No Hard Limits</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Products */}
          <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Products & Menu
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md font-mono">
                Unlimited
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-950 font-mono">
              {usage.productsCount || 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">Active catalog items</p>
          </div>

          {/* Employees */}
          <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Staff Accounts
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md font-mono">
                Unlimited
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-950 font-mono">
              {usage.employeesCount || 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">Cashiers & managers</p>
          </div>

          {/* Branches */}
          <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Store Branches
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md font-mono">
                Unlimited
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-950 font-mono">
              {usage.branchesCount || 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">Outlets & warehouses</p>
          </div>

          {/* Monthly Invoices */}
          <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Monthly Invoices
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-md font-mono">
                Unlimited
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-950 font-mono">
              {usage.monthlyInvoicesCount || 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">Transactions this month</p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 pt-6 border-t border-emerald-900/10">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-4">
            Included Platform Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-800">
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full POS Billing & Fast Category Search</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thermal Receipt ESC/POS 80mm Printing</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time Gross & Net Profit Margin Reports</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Customer Khata Credit & Supplier Ledger</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Barcode Generation & USB/Bluetooth Scanner</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-Location Branch & Warehouse Switching</span>
            </div>
          </div>
        </div>
      </div>
      {/* WhatsApp Launch Modal */}
      <WhatsAppLaunchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        phone={whatsappSalesNumber}
        message={upgradeMsg}
        title="Manage Subscription via WhatsApp"
      />
    </div>
  );
}
