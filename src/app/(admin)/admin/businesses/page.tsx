"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  KeyRound,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Edit2,
  X,
  Lock,
  User,
  Phone,
  Sparkles,
  AlertTriangle,
  Calendar,
  Zap,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export default function BusinessesAdminPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Action Modals
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Action Form States
  const [trialDaysInput, setTrialDaysInput] = useState<number>(14);
  const [customTrialDate, setCustomTrialDate] = useState<string>("");
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  // Edit Business Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    businessType: "Grocery & Retail",
    city: "Colombo",
    address: "",
  });

  // Create Business Form State
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    businessType: "Grocery & Retail",
    city: "Colombo",
    address: "",
    planCode: "UNLIMITED",
    trialDays: 14,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const debouncedSearch = useDebounce(search, 250);

  // Fetch plans only once on mount
  useEffect(() => {
    safeFetchJson("/api/admin/plans").then((pData) => {
      if (pData?.plans) setPlans(pData.plans);
    });
  }, []);

  const fetchBusinesses = async () => {
    try {
      const url = new URL("/api/admin/businesses", window.location.origin);
      if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
      if (statusFilter) url.searchParams.set("status", statusFilter);

      const bData = await safeFetchJson(url.toString());
      if (bData?.businesses) setBusinesses(bData.businesses);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [debouncedSearch, statusFilter]);

  // Handle Provisioning New Business
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create business.");
        setSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      setCreatedCreds({
        businessName: data.business.name,
        ...data.credentials,
      });
      fetchBusinesses();
      setSubmitting(false);
    } catch (e) {
      setFormError("Network error occurred.");
      setSubmitting(false);
    }
  };

  // Open Password Reset Modal
  const openPasswordResetDialog = (business: any) => {
    setSelectedBusiness(business);
    setActionError("");
    setShowPasswordResetModal(true);
  };

  // Confirm Password Reset
  const handleConfirmPasswordReset = async () => {
    if (!selectedBusiness) return;
    setActionProcessing(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_PASSWORD" }),
      });

      const data = await res.json();
      setActionProcessing(false);

      if (!res.ok) {
        setActionError(data.error || "Failed to reset password.");
        return;
      }

      setShowPasswordResetModal(false);
      if (data.credentials) {
        setCreatedCreds({
          businessName: selectedBusiness.name,
          ...data.credentials,
        });
      }
      fetchBusinesses();
    } catch (e) {
      setActionError("Network error occurred while resetting password.");
      setActionProcessing(false);
    }
  };

  // Open Trial Management Modal
  const openTrialDialog = (business: any) => {
    setSelectedBusiness(business);
    setTrialDaysInput(14);
    setCustomTrialDate("");
    setActionError("");
    setShowTrialModal(true);
  };

  // Confirm Trial Update
  const handleSaveTrial = async (isActivatePaid = false) => {
    if (!selectedBusiness) return;
    setActionProcessing(true);
    setActionError("");

    try {
      let body: any;
      if (isActivatePaid) {
        body = { action: "ACTIVATE_PAID", durationMonths: 12 };
      } else {
        body = {
          action: "SET_TRIAL",
          days: trialDaysInput,
          newDate: customTrialDate || undefined,
        };
      }

      const res = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setActionProcessing(false);

      if (!res.ok) {
        setActionError(data.error || "Failed to update trial.");
        return;
      }

      setShowTrialModal(false);
      fetchBusinesses();
    } catch (e) {
      setActionError("Network error occurred while updating trial.");
      setActionProcessing(false);
    }
  };

  // Open Status Toggle Modal (Suspend / Activate)
  const openStatusDialog = (business: any) => {
    setSelectedBusiness(business);
    setActionError("");
    setShowStatusModal(true);
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = async () => {
    if (!selectedBusiness) return;
    setActionProcessing(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_STATUS" }),
      });

      const data = await res.json();
      setActionProcessing(false);

      if (!res.ok) {
        setActionError(data.error || "Failed to change business status.");
        return;
      }

      setShowStatusModal(false);
      fetchBusinesses();
    } catch (e) {
      setActionError("Network error occurred while changing status.");
      setActionProcessing(false);
    }
  };

  // Open Edit Business Modal
  const openEditBusinessDialog = (business: any) => {
    const owner = business.userBusinesses?.[0]?.user;
    setSelectedBusiness(business);
    setEditFormData({
      name: business.name || "",
      ownerName: owner?.name || "",
      phone: business.phone || "",
      businessType: business.businessType || "Grocery & Retail",
      city: business.city || "",
      address: business.address || "",
    });
    setActionError("");
    setShowEditModal(true);
  };

  // Save Edit Business Details
  const handleSaveEditBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    setActionProcessing(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT_BUSINESS",
          ...editFormData,
        }),
      });

      const data = await res.json();
      setActionProcessing(false);

      if (!res.ok) {
        setActionError(data.error || "Failed to update business details.");
        return;
      }

      setShowEditModal(false);
      fetchBusinesses();
    } catch (e) {
      setActionError("Network error occurred.");
      setActionProcessing(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllDetails = () => {
    if (!createdCreds) return;
    const text = `BUSINESS CREDENTIALS\n\nBusiness: ${createdCreds.businessName}\nLogin URL: ${createdCreds.loginUrl}\nLogin ID: ${createdCreds.loginId}\nTemporary Password: ${createdCreds.tempPassword}\n\nPlease change your password upon your first login.`;
    copyToClipboard(text, "all");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 font-sans animate-in fade-in duration-300">
      {/* Top Action Bar - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Tenant Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Businesses & Tenant Provisioning
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Authorize, manage trial periods, reset passwords, and control tenant store statuses.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              ownerName: "",
              phone: "",
              email: "",
              businessType: "Grocery & Retail",
              city: "Colombo",
              address: "",
              planCode: "UNLIMITED",
              trialDays: 14,
            });
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Business</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business name, Login ID (T2G-XXXXX), or WhatsApp phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active (Paid)</option>
          <option value="TRIAL">Trial Mode</option>
          <option value="SUSPENDED">Suspended / Expired</option>
        </select>
      </div>

      {/* Businesses Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-4">Business</th>
                <th className="p-4">Owner & Phone</th>
                <th className="p-4">Login ID</th>
                <th className="p-4">Plan & Status</th>
                <th className="p-4">Trial / Expiry</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                      <span>Loading tenant businesses...</span>
                    </div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    No businesses found matching your search.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => {
                  const owner = b.userBusinesses?.[0]?.user;
                  const sub = b.subscriptions?.[0];
                  const isTrial = b.status === "TRIAL" || sub?.status === "TRIAL";
                  const trialEnd = sub?.trialEndDate ? new Date(sub.trialEndDate) : null;
                  const isExpired = isTrial && trialEnd && new Date() > trialEnd;

                  return (
                    <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                          <span>{b.name}</span>
                          <button
                            onClick={() => openEditBusinessDialog(b)}
                            title="Edit Business Details"
                            className="p-1 text-neutral-400 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-neutral-500">{b.businessType} • {b.city || "Sri Lanka"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-neutral-800">{owner?.name || "N/A"}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{b.phone}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-800">
                        {b.code}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-900">All-in-One Unlimited</div>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            b.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : b.status === "TRIAL"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-600">
                        {isTrial && trialEnd ? (
                          <div>
                            <span className="font-mono text-xs font-semibold block">
                              {trialEnd.toLocaleDateString("en-LK")}
                            </span>
                            <span className={`text-[10px] font-bold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                              {isExpired ? "Trial Expired" : `${Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs">Paid Active</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* 1. Reset Password Button */}
                          <button
                            onClick={() => openPasswordResetDialog(b)}
                            title="Reset Owner Password (Asks Permission)"
                            className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-800 transition-all cursor-pointer shadow-xs"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit / Extend Trial Button */}
                          <button
                            onClick={() => openTrialDialog(b)}
                            title="Edit Trial Period / Activate Subscription"
                            className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-800 transition-all cursor-pointer shadow-xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Suspend / Activate Button */}
                          <button
                            onClick={() => openStatusDialog(b)}
                            title={b.status === "SUSPENDED" ? "Reactivate Business" : "Suspend Business"}
                            className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-800 transition-all cursor-pointer shadow-xs"
                          >
                            {b.status === "SUSPENDED" ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PASSWORD RESET CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showPasswordResetModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Reset Owner Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordResetModal(false)}
                className="text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-950 text-sm">{selectedBusiness.name}</p>
                <p className="text-neutral-700">
                  Owner: <strong>{selectedBusiness.userBusinesses?.[0]?.user?.name || "N/A"}</strong>
                </p>
                <p className="text-neutral-700 font-mono">
                  Login ID: <strong>{selectedBusiness.code}</strong>
                </p>
                <p className="text-neutral-700 font-mono">
                  WhatsApp: <strong>{selectedBusiness.phone}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] leading-relaxed">
                ⚠️ <strong>Confirmation Required:</strong> Generating a new password will immediately invalidate the owner's existing password. A temporary password will be created so you can send it via WhatsApp.
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleConfirmPasswordReset}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionProcessing ? "Generating..." : "Confirm & Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TRIAL & SUBSCRIPTION MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {showTrialModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Manage Trial & Subscription</h3>
              </div>
              <button
                onClick={() => setShowTrialModal(false)}
                className="text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="my-4 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <p className="font-bold text-emerald-950 text-sm">{selectedBusiness.name}</p>
                <p className="text-neutral-700 mt-1">
                  Current Status: <strong className="uppercase">{selectedBusiness.status}</strong>
                </p>
                {selectedBusiness.subscriptions?.[0]?.trialEndDate && (
                  <p className="text-neutral-700 font-mono text-[11px] mt-0.5">
                    Current Trial Ends: {new Date(selectedBusiness.subscriptions[0].trialEndDate).toLocaleDateString("en-LK")}
                  </p>
                )}
              </div>

              {/* Section 1: Set Custom Trial Days */}
              <div className="space-y-2">
                <label className="block font-bold text-neutral-800 uppercase text-[11px]">
                  Option 1: Set Trial Days from Today
                </label>
                <div className="flex gap-2">
                  {[7, 14, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTrialDaysInput(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        trialDaysInput === d
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow-xs"
                          : "bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block font-semibold text-neutral-600 mb-1">Or enter custom number of days:</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={trialDaysInput}
                    onChange={(e) => setTrialDaysInput(parseInt(e.target.value, 10) || 14)}
                    className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Convert to Paid Subscription */}
              <div className="pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div>
                    <p className="font-extrabold text-emerald-950 text-xs">Convert to Paid (Active)</p>
                    <p className="text-[10px] text-neutral-600">Marks store as active for 1 full year.</p>
                  </div>
                  <button
                    type="button"
                    disabled={actionProcessing}
                    onClick={() => handleSaveTrial(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Activate Paid
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowTrialModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={() => handleSaveTrial(false)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionProcessing ? "Saving..." : "Save Trial Period"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUSPEND / REACTIVATE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showStatusModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  {selectedBusiness.status === "SUSPENDED" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <h3 className="text-base font-black text-neutral-950">
                  {selectedBusiness.status === "SUSPENDED" ? "Reactivate Business Store" : "Suspend Business Store"}
                </h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200">
                <p className="font-bold text-neutral-950 text-sm">{selectedBusiness.name}</p>
                <p className="text-neutral-600 mt-1">
                  Current Status: <strong className="uppercase">{selectedBusiness.status}</strong>
                </p>
              </div>

              {selectedBusiness.status === "SUSPENDED" ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  ✅ <strong>Reactivation:</strong> Reactivating this store will immediately unlock access to the POS terminal, product catalog, and cashier logins.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                  ⚠️ <strong>Suspension Warning:</strong> Suspending this business will immediately block all cashiers, managers, and the owner from logging in or processing POS sales.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleConfirmStatusToggle}
                className={`px-5 py-2 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
                  selectedBusiness.status === "SUSPENDED"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                }`}
              >
                {actionProcessing
                  ? "Processing..."
                  : selectedBusiness.status === "SUSPENDED"
                  ? "Confirm Reactivation"
                  : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EDIT BUSINESS DETAILS MODAL */}
      {/* ========================================================================= */}
      {showEditModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Edit Business Details</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditBusiness} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Business Store Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.ownerName}
                    onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Business Type</label>
                  <select
                    value={editFormData.businessType}
                    onChange={(e) => setEditFormData({ ...editFormData, businessType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Grocery & Retail">Grocery & Retail</option>
                    <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                    <option value="Bakery & Takeaway">Bakery & Takeaway</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Clothing Store">Clothing Store</option>
                    <option value="Salon & Barber">Salon & Barber</option>
                    <option value="Electronics & Mobile">Electronics & Mobile</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">City / Town</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Address / Street</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionProcessing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROVISION NEW BUSINESS MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-950">Provision New Business</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBusiness} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galle Fresh Supermart"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahesh Senaratne"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0779988776"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Grocery & Retail">Grocery & Retail</option>
                    <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                    <option value="Bakery & Takeaway">Bakery & Takeaway</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Clothing Store">Clothing Store</option>
                    <option value="Salon & Barber">Salon & Barber</option>
                    <option value="Electronics & Mobile">Electronics & Mobile</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Galle, Colombo, Jaffna"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Subscription Plan</label>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-bold text-xs flex items-center justify-between">
                    <span>All-in-One Unlimited</span>
                    <span className="text-[10px] text-emerald-800 font-mono">Rs. 4,999/mo</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value, 10) || 14 })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? "Provisioning..." : "Create Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREDENTIALS DISPLAY POPUP (WHATSAPP SHARE) */}
      {/* ========================================================================= */}
      {createdCreds && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="text-center pb-4 border-b border-neutral-200">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase">
                Owner Credentials Ready
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Share these login details directly with the business owner via WhatsApp.
              </p>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase font-sans text-neutral-500 font-bold block">Business</span>
                <span className="font-bold text-emerald-950 text-sm">{createdCreds.businessName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans text-neutral-500 font-bold block">Login ID</span>
                  <span className="font-bold text-emerald-950 text-sm">{createdCreds.loginId}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCreds.loginId, "loginId")}
                  className="p-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-emerald-50 text-neutral-800 text-[10px] flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === "loginId" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === "loginId" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans text-neutral-500 font-bold block">Temporary Password</span>
                  <span className="font-bold text-emerald-950 text-sm">{createdCreds.tempPassword}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCreds.tempPassword, "password")}
                  className="p-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-emerald-50 text-neutral-800 text-[10px] flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === "password" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === "password" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans text-neutral-500 font-bold block">Login URL</span>
                <span className="text-neutral-700 break-all">{createdCreds.loginUrl}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <a
                href={createdCreds.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send to Owner via WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyAllDetails}
                  className="py-2.5 bg-white hover:bg-emerald-50 border border-neutral-300 text-neutral-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === "all" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "all" ? "Copied!" : "Copy All Details"}</span>
                </button>
                <button
                  onClick={() => setCreatedCreds(null)}
                  className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-neutral-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
