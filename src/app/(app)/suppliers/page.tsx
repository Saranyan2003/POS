"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  AlertTriangle,
  History,
  CheckCircle2,
  Truck,
  DollarSign,
  Calendar,
  Package,
  MessageCircle,
  Trash2,
  Building2,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { openWhatsAppInstant, getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [totalPayables, setTotalPayables] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Supplier Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    branchId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Supplier State & Modal
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);
  const [deleteSupplierError, setDeleteSupplierError] = useState("");

  // Pay Supplier Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payReference, setPayReference] = useState("");
  const [payProcessing, setPayProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  // Supplier Invoices Drawer
  const [invoicesDrawerOpen, setInvoicesDrawerOpen] = useState(false);
  const [selectedSupplierInvoices, setSelectedSupplierInvoices] = useState<any>(null);
  const [activeSupplierId, setActiveSupplierId] = useState<string>("");
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesRange, setInvoicesRange] = useState("all");
  const [invoicesStartDate, setInvoicesStartDate] = useState("");
  const [invoicesEndDate, setInvoicesEndDate] = useState("");

  const loadSuppliers = async (branch = selectedBranchId) => {
    setLoading(true);
    try {
      const url = new URL("/api/suppliers", window.location.origin);
      if (branch && branch !== "ALL") url.searchParams.set("branchId", branch);

      const [data, meData, bData] = await Promise.all([
        safeFetchJson(url.toString()),
        safeFetchJson("/api/auth/me"),
        safeFetchJson("/api/branches"),
      ]);

      if (data?.suppliers) {
        setSuppliers(data.suppliers);
        setTotalPayables(data.totalOutstandingPayables || 0);
      }
      if (meData?.user) {
        setActiveUser(meData.user);
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

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadSuppliers(branchId);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    setIsDeletingSupplier(true);
    setDeleteSupplierError("");

    try {
      const res = await fetch(`/api/suppliers/${supplierToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteSupplierError(data.error || "Failed to remove supplier.");
        setIsDeletingSupplier(false);
        return;
      }

      setSupplierToDelete(null);
      setIsDeletingSupplier(false);
      loadSuppliers(selectedBranchId);
    } catch (e) {
      setDeleteSupplierError("Network error occurred.");
      setIsDeletingSupplier(false);
    }
  };

  const loadSupplierInvoices = async (
    supplierId: string,
    range = invoicesRange,
    start = invoicesStartDate,
    end = invoicesEndDate
  ) => {
    setInvoicesLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      if (selectedBranchId && selectedBranchId !== "ALL") queryParams.set("branchId", selectedBranchId);

      const data = await safeFetchJson(`/api/suppliers/${supplierId}?${queryParams.toString()}`);
      if (data?.supplier) {
        setSelectedSupplierInvoices(data.supplier);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleOpenInvoices = async (supplierId: string) => {
    setActiveSupplierId(supplierId);
    setInvoicesRange("all");
    setInvoicesStartDate("");
    setInvoicesEndDate("");
    setInvoicesDrawerOpen(true);
    await loadSupplierInvoices(supplierId, "all", "", "");
  };

  const handleInvoicesDateChange = (range: string, start?: string, end?: string) => {
    setInvoicesRange(range);
    setInvoicesStartDate(start || "");
    setInvoicesEndDate(end || "");
    if (activeSupplierId) {
      loadSupplierInvoices(activeSupplierId, range, start, end);
    }
  };

  const handleOpenAddModal = () => {
    const defaultBranchId = activeUser?.branchId || branches[0]?.id || "";
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      branchId: defaultBranchId,
    });
    setModalError("");
    setShowModal(true);
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to add supplier.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setSubmitting(false);
      loadSuppliers(selectedBranchId);
    } catch (e) {
      setModalError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const handleOpenPayModal = (supplier: any) => {
    setSelectedSupplierForPay(supplier);
    setPayAmount(String(supplier.outstandingBalance || 0));
    setPayMethod("BANK_TRANSFER");
    setPayReference("");
    setPayError("");
    setPayModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay) return;
    setPayProcessing(true);
    setPayError("");

    try {
      const res = await fetch(`/api/suppliers/${selectedSupplierForPay.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_PAYMENT",
          amount: parseFloat(payAmount),
          paymentMethod: payMethod,
          reference: payReference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Failed to record payment.");
        setPayProcessing(false);
        return;
      }

      setPayModalOpen(false);
      setPayProcessing(false);
      loadSuppliers(selectedBranchId);
    } catch (e) {
      setPayError("Network error occurred.");
      setPayProcessing(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search))
  );

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
              Vendor Accounts
            </span>
            {userAssignedBranch ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/20 flex items-center gap-1 backdrop-blur-xs">
                <Building2 className="w-3 h-3 text-emerald-400" />
                All Branches Suppliers
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Suppliers & Vendor Payables
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Manage your vendors, wholesale distributors, inward invoices, and supplier payables ledger strictly per branch.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 relative z-10"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Registered Vendors {userAssignedBranch ? `(${userAssignedBranch.name})` : ""}
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-1 font-mono">{suppliers.length}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Active wholesale suppliers at this branch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Outstanding Supplier Payables
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{formatLKR(totalPayables)}</p>
            <p className="text-[11px] text-neutral-600 mt-0.5 font-semibold">Unpaid balance owed to distributors</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers by company name, contact person, phone..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-emerald-900/15 rounded-xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-black bg-emerald-50/50 text-[11px] tracking-wider">
                <th className="p-4">Supplier Company</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Deliveries</th>
                <th className="p-4">Payable Balance (Owed)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                      <span>Loading suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400">
                    <Building className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No suppliers found for this branch.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Click "Add New Supplier" to add vendor accounts.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-950 text-sm">{s.name}</div>
                      {s.address && <div className="text-[10px] text-neutral-500">{s.address}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1 w-max">
                        <Building2 className="w-3 h-3 text-neutral-500" />
                        {s.branch?.name || "Main Branch"}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-700 font-medium">{s.contactPerson || "-"}</td>
                    <td className="p-4 font-mono text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span>{s.phone}</span>
                        {s.phone && (
                          <a
                            href={getWhatsAppDirectUrl(s.phone, `Hello ${s.name}!`)}
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
                    <td className="p-4 font-mono font-bold text-neutral-700">{s._count?.purchases || 0}</td>
                    <td className="p-4">
                      {s.outstandingBalance > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300">
                          • {formatLKR(s.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono">Rs. 0.00</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.outstandingBalance > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(s)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-95"
                          >
                            Pay Bill
                          </button>
                        )}
                        {s.outstandingBalance <= 0 && (
                          <button
                            onClick={() => {
                              setSupplierToDelete(s);
                              setDeleteSupplierError("");
                            }}
                            title="Remove mistake supplier"
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenInvoices(s.id)}
                          className="px-3 py-1.5 bg-white border border-emerald-900/15 hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
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

      {/* ADD SUPPLIER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Add Vendor Account</h3>
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

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-3.5 text-xs">
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
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceylon Agro Distributors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Ruwan Silva"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0112345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="orders@ceylonagro.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Warehouse Address</label>
                <input
                  type="text"
                  placeholder="e.g. 55 Wholesale St, Colombo 11"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Supplies wholesale beverages on 30-day credit term"
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
                  {submitting ? "Saving..." : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SUPPLIER CONFIRMATION MODAL */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Remove Mistaken Supplier</h3>
              </div>
              <button onClick={() => setSupplierToDelete(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteSupplierError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteSupplierError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Are you sure you want to remove supplier <strong>{supplierToDelete.name}</strong>?
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Branch:</span>
                  <span className="font-bold text-neutral-950 font-sans">{supplierToDelete.branch?.name || "Main Branch"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Phone:</span>
                  <span className="font-bold text-neutral-950">{supplierToDelete.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Payable Balance:</span>
                  <span className="font-bold text-neutral-950">{formatLKR(supplierToDelete.outstandingBalance || 0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSupplierToDelete(null)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSupplier}
                  disabled={isDeletingSupplier}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingSupplier ? "Removing..." : "Confirm & Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD SUPPLIER PAYMENT MODAL */}
      {payModalOpen && selectedSupplierForPay && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">Record Supplier Payment</h3>
                  <p className="text-[11px] text-neutral-500">{selectedSupplierForPay.name}</p>
                </div>
              </div>
              <button onClick={() => setPayModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {payError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{payError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Current Outstanding Payable
                </span>
                <p className="text-2xl font-mono font-black text-amber-700">
                  {formatLKR(selectedSupplierForPay.outstandingBalance)}
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Payment Amount (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 25000.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Payment Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / Online Deposit</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  Bank Reference / Cheque No / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Slip #TRX-94820 Commercial Bank"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payProcessing}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {payProcessing ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER INVOICES DRAWER */}
      {invoicesDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">
                    {selectedSupplierInvoices?.name || "Supplier"} Delivery History
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {selectedSupplierInvoices?.phone} • {selectedSupplierInvoices?.branch?.name || "Branch"} Account
                  </p>
                </div>
              </div>
              <button onClick={() => setInvoicesDrawerOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Date Filter */}
            <div className="mt-4 shrink-0">
              <DateRangeFilter
                value={invoicesRange}
                startDate={invoicesStartDate}
                endDate={invoicesEndDate}
                onChange={handleInvoicesDateChange}
                isLoading={invoicesLoading}
              />
            </div>

            {/* Invoices List */}
            <div className="mt-4 overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                </div>
              ) : !selectedSupplierInvoices?.purchases || selectedSupplierInvoices.purchases.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-700">No delivery invoices recorded in this date range.</p>
                </div>
              ) : (
                selectedSupplierInvoices.purchases.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-neutral-50/80 border border-emerald-900/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-neutral-950">{p.invoiceNumber}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(p.purchaseDate).toLocaleDateString("en-LK")}
                        </span>
                        {p.branch && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100/80 font-bold text-emerald-900 border border-emerald-200">
                            {p.branch.name}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-800">
                        {formatLKR(p.total)}
                      </span>
                    </div>

                    <div className="border-t border-emerald-900/10 pt-2 text-[11px] text-neutral-600 flex flex-wrap gap-2">
                      {p.items?.map((item: any) => (
                        <span key={item.id} className="bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {item.product?.name || "Item"} &times; {item.quantity} ({formatLKR(item.unitCost)})
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>Paid: {formatLKR(p.paidAmount || 0)}</span>
                      <span>Unpaid Debt: {formatLKR(Math.max(0, p.total - (p.paidAmount || 0)))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setInvoicesDrawerOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl text-xs hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-600/20"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
