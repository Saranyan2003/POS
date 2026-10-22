"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  KeyRound,
  Copy,
  Check,
  MessageCircle,
  X,
  AlertTriangle,
  Sparkles,
  Shield,
  Users,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { openWhatsAppInstant, getWhatsAppDirectUrl } from "@/lib/whatsapp";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "CASHIER",
    assignedBranchId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadStaff = async (branch = selectedBranchId) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (branch && branch !== "ALL") queryParams.set("branchId", branch);

      const [sRes, bRes, meRes] = await Promise.all([
        safeFetchJson(`/api/staff?${queryParams.toString()}`),
        safeFetchJson("/api/branches"),
        safeFetchJson("/api/auth/me"),
      ]);

      if (sRes?.staff) setStaff(sRes.staff);
      if (meRes?.user) setActiveUser(meRes.user);
      if (bRes?.branches) {
        setBranches(bRes.branches);
        if (bRes.branches.length > 0) {
          setFormData((prev) => ({ ...prev, assignedBranchId: bRes.branches[0].id }));
        }
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    loadStaff(branchId);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create staff account.");
        setSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      setCreatedCreds({
        staffName: data.staff.name,
        role: data.staff.role,
        ...data.credentials,
      });
      loadStaff(selectedBranchId);
      setSubmitting(false);
    } catch (e) {
      setFormError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
              Role-Based Access Control
            </span>
            {userAssignedBranch ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Branch: {userAssignedBranch.name} ({userAssignedBranch.code})
              </span>
            ) : isBusinessOwner ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-emerald-500/30 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                All Branches Staff
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Staff & Employee Accounts
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Provision cashier, manager, and inventory staff logins strictly bound to specific store branches.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              phone: "",
              email: "",
              role: "CASHIER",
              assignedBranchId: activeUser?.branchId || branches[0]?.id || "",
            });
            setFormError("");
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Branch Filter for Business Owner */}
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

      {/* Staff Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Assigned Branch</th>
                <th className="p-4">Login ID</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">WhatsApp Phone</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                      <span>Loading staff accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400">
                    <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No staff members found for this branch.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Click "Add New Employee" to provision accounts.</p>
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {s.isOwner && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">ID: {s.id.slice(-6)}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1 w-max">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        {s.branch?.name || (s.isOwner ? "All Branches" : "Main Branch")}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-black text-emerald-800 text-sm">{s.loginId}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {s.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span>{s.phone || "-"}</span>
                        {s.phone && (
                          <a
                            href={getWhatsAppDirectUrl(s.phone, `Hello ${s.name}!`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-500 font-mono text-[11px]">
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("en-LK") : "Never logged in"}
                    </td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Add New Employee</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heshan Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0771234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Role Permission *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="CASHIER">Cashier (POS Only)</option>
                    <option value="MANAGER">Branch Manager</option>
                    <option value="INVENTORY_MANAGER">Inventory Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Assigned Branch *</label>
                  <select
                    value={formData.assignedBranchId}
                    onChange={(e) => setFormData({ ...formData, assignedBranchId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="staff@store.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS MODAL */}
      {createdCreds && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-950">Employee Account Created!</h3>
                <p className="text-[11px] text-neutral-500">{createdCreds.staffName}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Share these credentials with your employee. They will be required to change their temporary password upon first login.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 font-sans">Login ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">{createdCreds.loginId}</span>
                    <button
                      onClick={() => copyToClipboard(createdCreds.loginId, "loginId")}
                      className="p-1 rounded text-neutral-400 hover:text-emerald-700"
                    >
                      {copiedField === "loginId" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 font-sans">Temp Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">{createdCreds.tempPassword}</span>
                    <button
                      onClick={() => copyToClipboard(createdCreds.tempPassword, "tempPassword")}
                      className="p-1 rounded text-neutral-400 hover:text-emerald-700"
                    >
                      {copiedField === "tempPassword" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {createdCreds.whatsappLink && (
                <a
                  href={createdCreds.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Login via WhatsApp</span>
                </a>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCreatedCreds(null)}
                  className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs"
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
