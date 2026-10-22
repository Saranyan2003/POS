"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  AlertTriangle,
  CreditCard,
  History,
  CheckCircle2,
  Receipt,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  Calendar,
  MessageCircle,
  ExternalLink,
  Trash2,
  Building2,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { openWhatsAppInstant, getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [totalCustomerSpend, setTotalCustomerSpend] = useState<number>(0);
  const [totalOutstandingCredit, setTotalOutstandingCredit] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Customer Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", notes: "", branchId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Customer State & Modal
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [deleteCustomerError, setDeleteCustomerError] = useState("");

  // Credit Settlement Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedCustomerForSettle, setSelectedCustomerForSettle] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMethod, setSettleMethod] = useState("CASH");
  const [settleNotes, setSettleNotes] = useState("");
  const [settleProcessing, setSettleProcessing] = useState(false);
  const [settleError, setSettleError] = useState("");

  // Customer Ledger & History Modal
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedCustomerLedger, setSelectedCustomerLedger] = useState<any>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string>("");
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerRange, setLedgerRange] = useState("all");
  const [ledgerStartDate, setLedgerStartDate] = useState("");
  const [ledgerEndDate, setLedgerEndDate] = useState("");

  const debouncedSearch = useDebounce(search, 250);

  // Load auth & branches once on mount
  useEffect(() => {
    Promise.all([
      safeFetchJson("/api/auth/me"),
      safeFetchJson("/api/branches"),
    ]).then(([meData, bData]) => {
      if (meData?.user) setActiveUser(meData.user);
      if (bData?.branches) setBranches(bData.branches);
    });
  }, []);

  const loadCustomers = async (branch = selectedBranchId, searchStr = debouncedSearch) => {
    setLoading(true);
    try {
      const url = new URL("/api/customers", window.location.origin);
      if (searchStr) url.searchParams.set("search", searchStr);
      if (branch && branch !== "ALL") url.searchParams.set("branchId", branch);

      const data = await safeFetchJson(url.toString());

      if (data?.customers) {
        setCustomers(data.customers);
        setTotalCustomerSpend(data.totalCustomerSpend || 0);
        setTotalOutstandingCredit(data.totalOutstandingCredit || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(selectedBranchId, debouncedSearch);
  }, [debouncedSearch, selectedBranchId]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeletingCustomer(true);
    setDeleteCustomerError("");

    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteCustomerError(data.error || "Failed to remove customer.");
        setIsDeletingCustomer(false);
        return;
      }

      setCustomerToDelete(null);
      setIsDeletingCustomer(false);
      loadCustomers(selectedBranchId, search);
    } catch (e) {
      setDeleteCustomerError("Network error occurred.");
      setIsDeletingCustomer(false);
    }
  };

  const loadCustomerLedger = async (customerId: string, range = ledgerRange, start = ledgerStartDate, end = ledgerEndDate) => {
    setLedgerLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (selectedBranchId && selectedBranchId !== "ALL") queryParams.set("branchId", selectedBranchId);

      const data = await safeFetchJson(`/api/customers/${customerId}?${queryParams.toString()}`);
      if (data?.customer) {
        setSelectedCustomerLedger(data.customer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleOpenLedger = async (customerId: string) => {
    setActiveCustomerId(customerId);
    setLedgerRange("all");
    setLedgerStartDate("");
    setLedgerEndDate("");
    setLedgerModalOpen(true);
    await loadCustomerLedger(customerId, "all", "", "");
  };

  const handleLedgerDateChange = (range: string, start?: string, end?: string) => {
    setLedgerRange(range);
    setLedgerStartDate(start || "");
    setLedgerEndDate(end || "");
    if (activeCustomerId) {
      loadCustomerLedger(activeCustomerId, range, start, end);
    }
  };

  const handleOpenAddModal = () => {
    const defaultBranchId = activeUser?.branchId || branches[0]?.id || "";
    setFormData({ name: "", phone: "", email: "", address: "", notes: "", branchId: defaultBranchId });
    setModalError("");
    setShowModal(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to add customer.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setSubmitting(false);
      loadCustomers(selectedBranchId, search);
    } catch (e) {
      setModalError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const handleOpenSettleModal = (customer: any) => {
    setSelectedCustomerForSettle(customer);
    setSettleAmount(String(customer.creditBalance || 0));
    setSettleMethod("CASH");
    setSettleNotes("");
    setSettleError("");
    setSettleModalOpen(true);
  };

  const handleSettleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForSettle) return;
    setSettleProcessing(true);
    setSettleError("");

    try {
      const res = await fetch(`/api/customers/${selectedCustomerForSettle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SETTLE_CREDIT",
          amount: parseFloat(settleAmount),
          paymentMethod: settleMethod,
          notes: settleNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSettleError(data.error || "Failed to record settlement.");
        setSettleProcessing(false);
        return;
      }

      setSettleModalOpen(false);
      setSettleProcessing(false);
      loadCustomers(selectedBranchId, search);
    } catch (e) {
      setSettleError("Network error occurred.");
      setSettleProcessing(false);
    }
  };

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
              Khata Ledger
            </span>
            {userAssignedBranch ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/20 flex items-center gap-1 backdrop-blur-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                All Branches Khata
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Directory & Khata Ledger
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Maintain customer purchase records, contact info, and credit balance ledgers (Khata / Naya Potha) strictly per branch.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-neutral-950" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Registered Clients {userAssignedBranch ? `(${userAssignedBranch.name})` : ""}
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-1 font-mono">{customers.length}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Profiles in active branch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Lifetime Client Sales
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{formatLKR(totalCustomerSpend)}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Recorded across active patrons</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Outstanding Credit Balance
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
              {formatLKR(totalOutstandingCredit)}
            </p>
            <p className="text-[11px] text-neutral-600 mt-0.5 font-semibold">Receivables owed to this branch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Branch Filter (for Business Owner) */}
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone number, address..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-emerald-900/15 rounded-xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-black bg-emerald-50/50 text-[11px] tracking-wider">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Address / Town</th>
                <th className="p-4">Lifetime Spent</th>
                <th className="p-4">Credit Balance (Khata)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                      <span>Loading customer directory...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400">
                    <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No customer records found for this branch.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Click "Add New Customer" to register a client at this branch.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-950 text-sm">{c.name}</div>
                      <div className="text-[10px] text-neutral-500">{c.purchaseCount || 0} visits</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1 w-max">
                        <Building2 className="w-3 h-3 text-neutral-500" />
                        {c.branch?.name || "Main Branch"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span>{c.phone}</span>
                        {c.phone && (
                          <a
                            href={getWhatsAppDirectUrl(c.phone, `Hello ${c.name}!`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600">{c.address || "-"}</td>
                    <td className="p-4 font-mono font-bold text-emerald-800">
                      {formatLKR(c.totalSpent)}
                    </td>
                    <td className="p-4">
                      {c.creditBalance > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300">
                          • {formatLKR(c.creditBalance)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono">Rs. 0.00</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.creditBalance > 0 && (
                          <button
                            onClick={() => handleOpenSettleModal(c)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-95"
                          >
                            Settle Credit
                          </button>
                        )}
                        {c.creditBalance <= 0 && (
                          <button
                            onClick={() => {
                              setCustomerToDelete(c);
                              setDeleteCustomerError("");
                            }}
                            title="Remove mistake customer"
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenLedger(c.id)}
                          className="px-3 py-1.5 bg-white border border-emerald-900/15 hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Ledger</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Add Customer Account</h3>
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

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3.5 text-xs">
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

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0771234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Address / Town</label>
                <input
                  type="text"
                  placeholder="e.g. 142 Galle Road, Colombo 03"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wholesale account, allowed credit up to 20,000 LKR"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {submitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CUSTOMER CONFIRMATION MODAL */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Remove Mistaken Customer</h3>
              </div>
              <button onClick={() => setCustomerToDelete(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteCustomerError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteCustomerError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Are you sure you want to remove customer <strong>{customerToDelete.name}</strong>?
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Branch:</span>
                  <span className="font-bold text-neutral-950 font-sans">{customerToDelete.branch?.name || "Main Branch"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Phone:</span>
                  <span className="font-bold text-neutral-950">{customerToDelete.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Credit Balance:</span>
                  <span className="font-bold text-neutral-950">{formatLKR(customerToDelete.creditBalance || 0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCustomer}
                  disabled={isDeletingCustomer}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingCustomer ? "Removing..." : "Confirm & Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTLE CREDIT MODAL */}
      {settleModalOpen && selectedCustomerForSettle && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">Record Khata Credit Settlement</h3>
                  <p className="text-[11px] text-neutral-500">{selectedCustomerForSettle.name}</p>
                </div>
              </div>
              <button onClick={() => setSettleModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {settleError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{settleError}</span>
              </div>
            )}

            <form onSubmit={handleSettleCredit} className="mt-4 space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Current Outstanding Debt
                </span>
                <p className="text-2xl font-mono font-black text-amber-700">
                  {formatLKR(selectedCustomerForSettle.creditBalance)}
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Repayment Amount (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000.00"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Payment Channel</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Direct Bank Deposit / Transfer</option>
                  <option value="OTHER">Other Channel</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Receipt / Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full via cash at branch counter"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSettleModalOpen(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settleProcessing}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {settleProcessing ? "Recording..." : "Confirm Repayment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER LEDGER & ORDER HISTORY MODAL */}
      {ledgerModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">
                    {selectedCustomerLedger?.name || "Customer"} Ledger
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {selectedCustomerLedger?.phone} • {selectedCustomerLedger?.branch?.name || "Branch"} Account
                  </p>
                </div>
              </div>
              <button onClick={() => setLedgerModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ledger Date Filter */}
            <div className="mt-4 shrink-0">
              <DateRangeFilter
                value={ledgerRange}
                startDate={ledgerStartDate}
                endDate={ledgerEndDate}
                onChange={handleLedgerDateChange}
                isLoading={ledgerLoading}
              />
            </div>

            {/* Transactions List */}
            <div className="mt-4 overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {ledgerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                </div>
              ) : !selectedCustomerLedger?.sales || selectedCustomerLedger.sales.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-700">No transactions recorded in this date range.</p>
                </div>
              ) : (
                selectedCustomerLedger.sales.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-neutral-50/80 border border-emerald-900/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-neutral-950">{s.invoiceNumber}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(s.saleDate).toLocaleDateString("en-LK")}
                        </span>
                        {s.branch && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100/80 font-bold text-emerald-900 border border-emerald-200">
                            {s.branch.name}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-800">
                        {formatLKR(s.total)}
                      </span>
                    </div>

                    <div className="border-t border-emerald-900/10 pt-2 text-[11px] text-neutral-600 flex flex-wrap gap-2">
                      {s.items?.map((item: any) => (
                        <span key={item.id} className="bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {item.productName} &times; {item.quantity}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>Payment: {s.payments?.map((p: any) => p.method).join(", ") || "CASH"}</span>
                      <span className="font-bold text-emerald-900 uppercase text-[10px] bg-emerald-100/80 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setLedgerModalOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl text-xs hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-600/20"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
