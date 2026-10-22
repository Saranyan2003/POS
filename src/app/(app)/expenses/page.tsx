"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Calendar,
  User,
  X,
  AlertTriangle,
  Boxes,
  ArrowDownRight,
  Tag,
  Receipt,
  Trash2,
  CheckCircle2,
  Building2,
  Filter,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { getBusinessProfile, BusinessProfile } from "@/lib/business-profiles";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal for New Expense
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: "Electricity",
    amount: "",
    description: "",
    branchId: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Expense State & Modal
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadExpenses = async (range = dateRange, start = startDate, end = endDate, branch = selectedBranchId) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (branch && branch !== "ALL") queryParams.set("branchId", branch);

      const [eData, meData, bData] = await Promise.all([
        safeFetchJson(`/api/expenses?${queryParams.toString()}`),
        safeFetchJson("/api/auth/me"),
        safeFetchJson("/api/branches"),
      ]);

      if (eData?.expenses) {
        setExpenses(eData.expenses);
        setTotalExpenseAmount(eData.totalExpenseAmount || 0);
      }
      if (meData?.user) {
        setActiveUser(meData.user);
        if (meData.user.business) {
          setBusinessInfo(meData.user.business);
        }
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

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/expenses?id=${expenseToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete expense entry.");
        setIsDeleting(false);
        return;
      }
      setExpenseToDelete(null);
      setIsDeleting(false);
      loadExpenses(dateRange, startDate, endDate, selectedBranchId);
    } catch (e) {
      setDeleteError("Network error occurred.");
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDateFilterChange = (range: string, start?: string, end?: string) => {
    setDateRange(range);
    setStartDate(start || "");
    setEndDate(end || "");
    loadExpenses(range, start, end, selectedBranchId);
  };

  const handleBranchFilterChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadExpenses(dateRange, startDate, endDate, branchId);
  };

  const profile: BusinessProfile = getBusinessProfile(businessInfo?.businessType);

  const handleOpenModal = () => {
    // Default branch selection
    const defaultBranchId = activeUser?.branchId || branches[0]?.id || "";
    setFormData({
      category: profile.suggestedExpenseCategories[0] || "Electricity",
      amount: "",
      description: "",
      branchId: defaultBranchId,
      expenseDate: new Date().toISOString().split("T")[0],
    });
    setModalError("");
    setShowModal(true);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to record expense.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setSubmitting(false);
      loadExpenses(dateRange, startDate, endDate, selectedBranchId);
    } catch (e) {
      setModalError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== "ALL" && e.category !== selectedCategory) return false;
    return true;
  });

  const isBusinessOwner = activeUser?.businessRole === "BUSINESS_OWNER";
  const userAssignedBranch = branches.find((b) => b.id === activeUser?.branchId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 shadow-xs">
              Operational Overheads
            </span>
            {userAssignedBranch ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/20 flex items-center gap-1 backdrop-blur-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                All Branches Overview
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Operating Expenses</h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Log overheads, utilities, salaries, transport, and operational bills strictly scoped to your branch.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={handleOpenModal}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-neutral-950" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
              Total Expenses Logged {userAssignedBranch ? `(${userAssignedBranch.name})` : ""}
            </span>
            <p className="text-2xl font-black text-red-600 mt-1 font-mono">
              -{formatLKR(totalExpenseAmount)}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Deducted from gross profit calculations</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center text-red-700 font-bold">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Expense Transactions
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-1 font-mono">{expenses.length}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Recorded operational bill receipts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar: Branch Filter (for owner) & Date Range */}
      <div className="space-y-3">
        {isBusinessOwner && branches.length > 1 && (
          <div className="bg-white/90 backdrop-blur-md border border-emerald-900/10 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Branch Filter:
            </span>
            <button
              onClick={() => handleBranchFilterChange("ALL")}
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
                onClick={() => handleBranchFilterChange(b.id)}
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

        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-4 shadow-sm">
          <DateRangeFilter
            value={dateRange}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateFilterChange}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "ALL"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
              : "bg-white text-neutral-700 border border-emerald-900/10 hover:bg-emerald-50"
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {profile.suggestedExpenseCategories.map((cat) => {
          const count = expenses.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  : "bg-white text-neutral-700 border border-emerald-900/10 hover:bg-emerald-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Expenses Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-black bg-emerald-50/50 text-[11px] tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Expense Category</th>
                <th className="p-4">Description / Notes</th>
                <th className="p-4">Recorded By</th>
                <th className="p-4 text-right">Amount (LKR)</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                      <span>Loading expenses...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400">
                    <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No expense records found.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Click "Record Expense" to log bills and overheads.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4 text-neutral-600 whitespace-nowrap font-mono">
                      {new Date(e.expenseDate).toLocaleDateString("en-LK")}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1 w-max">
                        <Building2 className="w-3 h-3 text-neutral-500" />
                        {e.branch?.name || "Main Branch"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-800 font-medium">{e.description || "-"}</td>
                    <td className="p-4 text-neutral-600">{e.recordedBy?.name || "Staff"}</td>
                    <td className="p-4 font-mono font-black text-red-600 text-sm text-right">
                      -{formatLKR(e.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setExpenseToDelete(e);
                          setDeleteError("");
                        }}
                        title="Remove mistaken entry"
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Remove Mistaken Expense</h3>
              </div>
              <button onClick={() => setExpenseToDelete(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Are you sure you want to remove this mistaken expense entry? This will immediately restore your net profit calculations.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Branch:</span>
                  <span className="font-bold text-neutral-950 font-sans">{expenseToDelete.branch?.name || "Main Branch"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Category:</span>
                  <span className="font-bold text-neutral-950">{expenseToDelete.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Amount:</span>
                  <span className="font-bold text-red-600">-{formatLKR(expenseToDelete.amount)}</span>
                </div>
                {expenseToDelete.description && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-sans">Description:</span>
                    <span className="text-neutral-700 font-sans truncate max-w-[200px]">{expenseToDelete.description}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteExpense}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Removing..." : "Confirm & Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Record Operating Expense</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5 text-xs">
              {/* Branch Selector (if multiple branches exist) */}
              {branches.length > 1 && (
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Branch *</label>
                  <select
                    value={formData.branchId}
                    disabled={!isBusinessOwner && !!activeUser?.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer disabled:bg-neutral-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {profile.suggestedExpenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Expense Amount (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 15000.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Description / Bill Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly CEB electricity bill / Generator diesel fuel"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {submitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
