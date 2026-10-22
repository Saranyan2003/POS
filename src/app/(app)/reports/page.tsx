"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  User,
  Package,
  Boxes,
  ArrowUpRight,
  Sparkles,
  ArrowDownRight,
  Layers,
  CheckCircle2,
  PieChart,
  Building2,
  Receipt,
  Wallet,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { getBusinessProfile, BusinessProfile } from "@/lib/business-profiles";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [range, setRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const loadReport = async (
    rangePreset = range,
    start = startDate,
    end = endDate,
    branch = selectedBranchId
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (rangePreset) queryParams.set("range", rangePreset);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (branch && branch !== "ALL") queryParams.set("branchId", branch);

      const [rData, meData] = await Promise.all([
        safeFetchJson(`/api/reports/summary?${queryParams.toString()}`),
        safeFetchJson("/api/auth/me"),
      ]);

      if (rData?.summary) setReport(rData.summary);
      if (meData?.user) {
        setActiveUser(meData.user);
        if (meData.user.business) setBusinessInfo(meData.user.business);
      }
      if (meData?.branches) {
        setBranches(meData.branches);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const profile: BusinessProfile = getBusinessProfile(businessInfo?.businessType);

  const handleRangeChange = (preset: string, start?: string, end?: string) => {
    setRange(preset);
    setStartDate(start || "");
    setEndDate(end || "");
    loadReport(preset, start, end, selectedBranchId);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadReport(range, startDate, endDate, branchId);
  };

  const exportCSV = () => {
    if (!report) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Financial Metric,Amount (LKR)\n";
    csvContent += `Gross Sales Revenue,${report.totalRevenue}\n`;
    csvContent += `Cost of Goods Sold (COGS),${report.totalCostOfGoods}\n`;
    csvContent += `Gross Profit,${report.totalGrossProfit}\n`;
    csvContent += `Discounts Given,${report.totalDiscounts}\n`;
    csvContent += `Operating Expenses,${report.totalExpenses}\n`;
    csvContent += `Estimated Net Profit,${report.estimatedNetProfit}\n`;
    csvContent += `Customer Credit Receivables (Owed to Us),${report.totalCustomerReceivables || 0}\n`;
    csvContent += `Supplier Payables (Owed by Us),${report.totalSupplierPayables || 0}\n\n`;

    csvContent += "Top Selling Items,Quantity,Revenue (LKR)\n";
    report.topProducts?.forEach((p: any) => {
      csvContent += `"${p.name}",${p.quantity},${p.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Ticket2Grow_Report_${range}_${startDate || "start"}_${endDate || "end"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isBusinessOwner = activeUser?.businessRole === "BUSINESS_OWNER";
  const userAssignedBranch = branches.find((b) => b.id === activeUser?.branchId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Financial Analytics
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {report?.rangeLabel || range}
            </span>
            {userAssignedBranch ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 font-mono text-[10px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Multi-Branch View
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Reports & Profit Ledger
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Revenue trends, branch operating costs, net profits, customer receivables, and vendor payables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95 ml-auto border border-emerald-400/30"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters: Branch Selector (for Owner) & Date Range */}
      <div className="space-y-3">
        {isBusinessOwner && branches.length > 1 && (
          <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
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
              All Branches
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

        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 p-4 rounded-3xl shadow-sm">
          <DateRangeFilter
            value={range}
            startDate={startDate}
            endDate={endDate}
            onChange={handleRangeChange}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Primary Financial Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-950 mt-2 font-mono">
            {formatLKR(report?.totalRevenue || 0)}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {report?.totalSalesCount || 0} completed orders
          </p>
        </div>

        {/* Cost of Goods Sold */}
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Cost of Goods (COGS)
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">
            {formatLKR(report?.totalCostOfGoods || 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Direct wholesale inventory cost</p>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">
            -{formatLKR(report?.totalExpenses || 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Bills, rent, salaries, utilities</p>
        </div>

        {/* Net Profit - Highlight Obsidian Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-neutral-950 to-emerald-950 text-white border-2 border-emerald-500/40 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Estimated Net Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {report?.grossMarginPercent || "0.0"}% Margin
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">
            {formatLKR(report?.estimatedNetProfit || 0)}
          </p>
          <p className="text-[11px] text-emerald-200/80 mt-1 font-semibold">
            Gross Profit: {formatLKR(report?.totalGrossProfit || 0)}
          </p>
        </div>
      </div>

      {/* Balance Sheet Accounts: Customer Receivables vs Supplier Payables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/5">
            <div>
              <span className="text-xs font-black text-neutral-950 uppercase tracking-wider block">
                Customer Receivables
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">Khata credit ledger balance owed to your store</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
              Money Inbound
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-700 font-mono">
              {formatLKR(report?.totalCustomerReceivables || 0)}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/5">
            <div>
              <span className="text-xs font-black text-neutral-950 uppercase tracking-wider block">
                Supplier Payables
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">Unpaid purchase delivery invoices owed to vendors</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
              Vendor Outbound
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-3xl font-black text-neutral-900 font-mono">
              {formatLKR(report?.totalSupplierPayables || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Payment Breakdown & Top Products Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-neutral-950">Payment Channels</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Revenue collected across payment methods</p>
            </div>
            <PieChart className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {Object.entries(report?.paymentBreakdown || {}).length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No payment transactions recorded in this period.
              </div>
            ) : (
              Object.entries(report?.paymentBreakdown || {}).map(([method, amount]: [string, any]) => {
                const totalRev = report?.totalRevenue || 1;
                const percent = Math.min(100, Math.round((Number(amount) / totalRev) * 100));

                return (
                  <div key={method} className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 uppercase">
                        {method.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-950">{formatLKR(amount)}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">({percent}%)</span>
                      </div>
                    </div>
                    {/* Emerald luxury progress bar */}
                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Product Performers Leaderboard */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-neutral-950">{profile.topSellingTitle}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Best performing items ranked by revenue</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2.5">
            {(!report?.topProducts || report.topProducts.length === 0) ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No product sales recorded in this period.
              </div>
            ) : (
              report.topProducts.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                        idx === 0
                          ? "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xs"
                          : idx === 1
                          ? "bg-neutral-800 text-white"
                          : "bg-neutral-200 text-neutral-900"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 truncate max-w-[200px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-neutral-950 text-xs block">
                      {formatLKR(item.revenue)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">{item.quantity} sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
