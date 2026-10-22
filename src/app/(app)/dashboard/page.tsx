"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Receipt,
  Users,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Boxes,
  Zap,
  Tag,
  DollarSign,
  Building2,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { getBusinessProfile, BusinessProfile } from "@/lib/business-profiles";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function BusinessDashboard() {
  const [report, setReport] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadDashboardData = async (
    range = dateRange,
    start = startDate,
    end = endDate,
    branch = selectedBranchId
  ) => {
    setLoadingReport(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (branch && branch !== "ALL") queryParams.set("branchId", branch);

      const [reportRes, salesRes, meRes] = await Promise.all([
        safeFetchJson(`/api/reports/summary?${queryParams.toString()}`),
        safeFetchJson(`/api/sales?${queryParams.toString()}`),
        safeFetchJson("/api/auth/me"),
      ]);

      if (reportRes?.summary) setReport(reportRes.summary);
      if (salesRes?.sales) setRecentSales(salesRes.sales.slice(0, 6));
      if (meRes?.user) {
        setActiveUser(meRes.user);
        if (meRes.user.business) setBusinessInfo(meRes.user.business);
      }
      if (meRes?.branches) {
        setBranches(meRes.branches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDateChange = (range: string, start?: string, end?: string) => {
    setDateRange(range);
    setStartDate(start || "");
    setEndDate(end || "");
    loadDashboardData(range, start, end, selectedBranchId);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadDashboardData(dateRange, startDate, endDate, branchId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-10 h-10 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest">
          Compiling Store Telemetry...
        </span>
      </div>
    );
  }

  const profile: BusinessProfile = getBusinessProfile(businessInfo?.businessType);
  const inv = report?.inventory || {};
  const isBusinessOwner = activeUser?.businessRole === "BUSINESS_OWNER";
  const userAssignedBranch = branches.find((b) => b.id === activeUser?.branchId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-neutral-900 selection:bg-emerald-600 selection:text-white">
      {/* Top Banner & Fast POS Access */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span>Store Command Center • {profile.badge}</span>
            {userAssignedBranch ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-emerald-200 font-mono text-[10px] flex items-center gap-1 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 font-mono text-[10px] flex items-center gap-1 backdrop-blur-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Multi-Branch Command
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {businessInfo?.name || "My Store"} Dashboard
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl font-medium">
            Real-time sales velocity, isolated branch operating expenses, and live valuations for your {profile.name.toLowerCase()} store.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/pos"
            className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-950" />
            <span>Launch {profile.posTitle} &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Filter Bar (Branch Selector for Owner & Date Range) */}
      <div className="space-y-3">
        {isBusinessOwner && branches.length > 1 && (
          <div className="bg-white/90 backdrop-blur-md border border-emerald-900/10 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Branch Filter:
            </span>
            <button
              onClick={() => handleBranchChange("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedBranchId === "ALL"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  : "bg-neutral-100 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              All Branches Combined
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBranchChange(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedBranchId === b.id
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-neutral-100 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-900"
                }`}
              >
                {b.name} ({b.code})
              </button>
            ))}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-4 shadow-xs">
          <DateRangeFilter
            value={dateRange}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            isLoading={loadingReport}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Total Revenue ({report?.rangeLabel || "Selected Period"})
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-950 mt-4 font-mono tracking-tight">
            {formatLKR(report?.totalRevenue || 0)}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-600 font-medium">
            <span className="font-bold text-emerald-700">{report?.totalSalesCount || 0}</span> completed transactions
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Estimated Net Profit
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-4 font-mono tracking-tight">
            {formatLKR(report?.estimatedNetProfit || 0)}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-600 font-medium">
            Gross Margin: <strong className="text-emerald-800 font-bold">{report?.grossMarginPercent || "0.0"}%</strong>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Stock Valuation (Cost)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-950 mt-4 font-mono tracking-tight">
            {formatLKR(inv?.totalInventoryValue || 0)}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-600 font-medium truncate">
            <span className="font-bold text-neutral-950">{inv?.totalStockUnits || 0}</span> units in {inv?.totalProductsCount || 0} {profile.productTermPlural.toLowerCase()}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 transition-all card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Low Stock Warnings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-4 font-mono tracking-tight">
            {inv?.lowStockCount || 0}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-600 font-medium">
            <span className="font-bold text-neutral-950">{inv?.outOfStockCount || 0}</span> completely out of stock
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Top Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-neutral-950">Top Selling Products</h2>
              <p className="text-[11px] text-neutral-500">Highest volume performers in selected period</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
            >
              <span>Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!report?.topProducts || report.topProducts.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-900/10">
              <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-600 text-xs">No product sales yet</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Completed transactions will rank here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.topProducts.slice(0, 5).map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/80 hover:bg-emerald-50/50 border border-emerald-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-mono font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-neutral-900 text-xs">{p.name}</p>
                      <p className="text-[11px] text-neutral-500 font-mono">{p.quantity} units sold</p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs text-emerald-800">{formatLKR(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices / Receipts */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-neutral-950">Recent Transactions</h2>
              <p className="text-[11px] text-neutral-500">Live order audit feed</p>
            </div>
            <Link
              href="/pos"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
            >
              <span>View POS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-900/10">
              <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-600 text-xs">No sales recorded in period</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Use the POS terminal to process sales.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/80 hover:bg-emerald-50/50 border border-emerald-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-emerald-900/10 flex items-center justify-center text-emerald-800">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-mono font-black text-xs text-neutral-950">{s.invoiceNumber}</p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                        <span>{new Date(s.saleDate).toLocaleDateString("en-LK")}</span>
                        <span>•</span>
                        <span>{s.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-xs text-emerald-800">{formatLKR(s.total)}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
                      {s.payments?.[0]?.method || "PAID"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
