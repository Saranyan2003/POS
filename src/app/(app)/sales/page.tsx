"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  X,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Trash2,
  Ban,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { ThermalReceipt } from "@/components/receipts/ThermalReceipt";
import { safeFetchJson } from "@/lib/utils";
import DateRangeFilter from "@/components/common/DateRangeFilter";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Print Receipt state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedSaleForRefund, setSelectedSaleForRefund] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("Customer return - undamaged");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Void Mistaken Sale state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [selectedSaleForVoid, setSelectedSaleForVoid] = useState<any>(null);
  const [voidReason, setVoidReason] = useState("Mistaken entry / Accidental checkout");
  const [voidSubmitting, setVoidSubmitting] = useState(false);
  const [voidError, setVoidError] = useState("");

  const [businessInfo, setBusinessInfo] = useState<any>(null);

  const loadSales = async (
    rangePreset = range,
    searchStr = search,
    start = startDate,
    end = endDate,
    branch = selectedBranchId
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (rangePreset) queryParams.set("range", rangePreset);
      if (searchStr) queryParams.set("search", searchStr);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (branch && branch !== "ALL") queryParams.set("branchId", branch);

      const [data, meRes, bData] = await Promise.all([
        safeFetchJson(`/api/sales?${queryParams.toString()}`),
        safeFetchJson("/api/auth/me"),
        safeFetchJson("/api/branches"),
      ]);

      if (data?.sales) setSales(data.sales);
      if (meRes?.user) {
        setActiveUser(meRes.user);
        if (meRes.user.business) setBusinessInfo(meRes.user.business);
      }
      if (bData?.branches) {
        setBranches(bData.branches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadSales(range, search, startDate, endDate, branchId);
  };

  const handleVoidSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForVoid) return;
    setVoidSubmitting(true);
    setVoidError("");

    try {
      const res = await fetch(`/api/sales?id=${selectedSaleForVoid.id}&reason=${encodeURIComponent(voidReason)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setVoidError(data.error || "Failed to void sale invoice.");
        setVoidSubmitting(false);
        return;
      }

      setShowVoidModal(false);
      setVoidSubmitting(false);
      loadSales(range, search, startDate, endDate, selectedBranchId);
    } catch (e) {
      setVoidError("Network error occurred.");
      setVoidSubmitting(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [search, range, startDate, endDate]);

  const handleRangeChange = (preset: string, start: string, end: string) => {
    setRange(preset);
    setStartDate(start);
    setEndDate(end);
    loadSales(preset, search, start, end, selectedBranchId);
  };

  const handlePrintReceipt = (sale: any) => {
    setSelectedReceipt({
      business: {
        name: businessInfo?.name || "Ticket2Grow Merchant",
        phone: businessInfo?.phone || "",
        address: businessInfo?.address || "",
        city: businessInfo?.city || "",
        taxNumber: businessInfo?.taxNumber || "",
        receiptHeader: businessInfo?.receiptHeader || "",
        receiptFooter: businessInfo?.receiptFooter || "",
      },
      branchName: sale.branch?.name || "Main Branch",
      invoiceNumber: sale.invoiceNumber,
      date: sale.saleDate || sale.createdAt,
      cashierName: sale.cashier?.name || "Staff",
      customer: sale.customer ? { name: sale.customer.name, phone: sale.customer.phone } : undefined,
      items: (sale.items || []).map((item: any) => ({
        name: item.productName || item.product?.name || "Item",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      paymentMethod: sale.payments?.[0]?.method || "CASH",
      tenderedAmount: sale.payments?.[0]?.tenderedAmount,
      changeAmount: sale.payments?.[0]?.changeAmount,
    });
  };

  const handleOpenRefundModal = (sale: any) => {
    setSelectedSaleForRefund(sale);
    setRefundReason("Customer return - undamaged");
    setShowRefundModal(true);
  };

  const handleOpenVoidModal = (sale: any) => {
    setSelectedSaleForVoid(sale);
    setVoidReason("Mistaken entry / Accidental checkout");
    setVoidError("");
    setShowVoidModal(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForRefund) return;
    setRefundSubmitting(true);

    try {
      const itemsToRefund = selectedSaleForRefund.items.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity,
        refundPrice: i.unitPrice,
      }));

      const res = await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: selectedSaleForRefund.id,
          reason: refundReason,
          items: itemsToRefund,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Refund failed");
        setRefundSubmitting(false);
        return;
      }

      setShowRefundModal(false);
      setRefundSubmitting(false);
      loadSales(range, search, startDate, endDate, selectedBranchId);
    } catch (e) {
      alert("Network error during refund");
      setRefundSubmitting(false);
    }
  };

  const totalPeriodSales = sales
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const isBusinessOwner = activeUser?.businessRole === "BUSINESS_OWNER";
  const userAssignedBranch = branches.find((b) => b.id === activeUser?.branchId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 shadow-xs">
              Transactions Archive
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {sales.length} Invoices Found
            </span>
            {userAssignedBranch ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/20 font-mono text-[10px] flex items-center gap-1 backdrop-blur-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                All Branches Sales
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sales & Invoices</h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Review past transactions, reprint thermal receipts, and issue customer refunds strictly scoped to your branch.
          </p>
        </div>

        <div className="text-right hidden sm:block relative z-10">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
            {userAssignedBranch ? `${userAssignedBranch.name} Revenue` : "Period Revenue"}
          </span>
          <span className="text-2xl font-black text-white font-mono">{formatLKR(totalPeriodSales)}</span>
        </div>
      </div>

      {/* Branch Filter for Business Owner */}
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

      {/* Date Range Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 p-4 rounded-3xl shadow-sm space-y-3">
        <DateRangeFilter
          rangePreset={range}
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
        />

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number (e.g. INV-202609-0001) or customer phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/80 hover:bg-white focus:bg-white border border-emerald-900/15 rounded-2xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-black bg-emerald-50/50 text-[11px] tracking-wider">
                <th className="p-4">Invoice No</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Cashier</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-neutral-400">
                    <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-bold text-neutral-700">No sales invoices found for selected branch and date range.</p>
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4 font-mono font-black text-neutral-950 text-xs">{s.invoiceNumber}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1 w-max">
                        <Building2 className="w-3 h-3 text-neutral-500" />
                        {s.branch?.name || "Main Branch"}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600 whitespace-nowrap font-medium">
                      {new Date(s.saleDate).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}
                    </td>
                    <td className="p-4 text-neutral-900 font-bold">
                      {s.customer ? `${s.customer.name} (${s.customer.phone})` : "Walk-in Customer"}
                    </td>
                    <td className="p-4 text-neutral-700 font-medium">{s.cashier?.name || "Cashier"}</td>
                    <td className="p-4 font-bold text-neutral-800">{s.items?.length || 0} items</td>
                    <td className="p-4 font-mono font-black text-emerald-800 text-sm">{formatLKR(s.total)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          s.status === "COMPLETED"
                            ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/50"
                            : s.status === "REFUNDED"
                            ? "bg-neutral-900 text-white font-bold"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintReceipt(s)}
                          className="px-2.5 py-1.5 rounded-xl border border-emerald-900/15 hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Reprint Bill Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Print</span>
                        </button>

                        {s.status === "COMPLETED" && (
                          <>
                            <button
                              onClick={() => handleOpenRefundModal(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="Process Customer Refund"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Refund</span>
                            </button>

                            <button
                              onClick={() => handleOpenVoidModal(s)}
                              className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Void mistaken checkout"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VOID MISTAKEN SALE MODAL */}
      {showVoidModal && selectedSaleForVoid && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">Void Mistaken Invoice</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">{selectedSaleForVoid.invoiceNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowVoidModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {voidError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{voidError}</span>
              </div>
            )}

            <form onSubmit={handleVoidSaleSubmit} className="mt-4 space-y-4 text-xs">
              <p className="text-neutral-600">
                Are you sure you want to void this mistaken checkout? This will cancel the transaction, return inventory items to branch shelf stock, and reverse any Khata credit balance.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Total Amount:</span>
                  <span className="font-bold text-neutral-950">{formatLKR(selectedSaleForVoid.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Items Count:</span>
                  <span className="font-bold text-neutral-950">{selectedSaleForVoid.items?.length || 0} items</span>
                </div>
                {selectedSaleForVoid.customer && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-sans">Customer:</span>
                    <span className="font-bold text-neutral-950">{selectedSaleForVoid.customer.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Reason for Void</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wrong items scanned, customer changed mind"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={voidSubmitting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  <span>{voidSubmitting ? "Voiding..." : "Confirm & Void"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {showRefundModal && selectedSaleForRefund && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">Issue Customer Refund</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">{selectedSaleForRefund.invoiceNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowRefundModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="mt-4 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Refund Total:</span>
                  <span className="font-bold text-emerald-800">{formatLKR(selectedSaleForRefund.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Stock Action:</span>
                  <span className="font-bold text-neutral-950">Auto-restock all items</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Reason for Return</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Customer return - undamaged">Customer return - undamaged</option>
                  <option value="Defective / Expired item replacement">Defective / Expired item replacement</option>
                  <option value="Wrong item billed">Wrong item billed</option>
                  <option value="Other customer refund">Other customer refund</option>
                </select>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{refundSubmitting ? "Processing..." : "Confirm Full Refund"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT MODAL */}
      {selectedReceipt && (
        <ThermalReceipt {...selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
