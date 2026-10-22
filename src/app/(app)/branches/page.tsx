"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Plus, Check, MapPin, Phone, X, AlertTriangle, Building2, Layers, CheckCircle2 } from "lucide-react";
import { safeFetchJson } from "@/lib/utils";

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "BR-02", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadBranches = async () => {
    try {
      const data = await safeFetchJson("/api/branches");
      if (data?.branches) setBranches(data.branches);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to create branch.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setSubmitting(false);
      loadBranches();
    } catch (e) {
      setModalError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    await fetch("/api/branches", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Multi-Location Architecture
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              Branch Isolation
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Branches & Multi-Location
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Manage your retail store locations, isolate stock levels per branch, and switch active operating branch.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              code: `BR-0${branches.length + 1}`,
              phone: "",
              address: "",
            });
            setModalError("");
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className={`p-6 rounded-3xl bg-white/95 backdrop-blur-md border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
              b.isDefault
                ? "border-2 border-emerald-600 bg-emerald-50/10 shadow-emerald-600/10"
                : "border-emerald-900/10 hover:border-emerald-500/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-950 text-base">{b.name}</h3>
                    <span className="font-mono text-emerald-700 text-xs font-bold">{b.code}</span>
                  </div>
                </div>

                {b.isDefault && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-xs">
                    Active Branch
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs text-neutral-600">
                {b.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono">{b.phone}</span>
                  </div>
                )}
                {b.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{b.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-emerald-900/5 grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-neutral-50/80 p-3 rounded-2xl border border-neutral-200/80">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Sales Orders</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">{b._count?.sales || 0}</span>
                </div>
                <div className="bg-neutral-50/80 p-3 rounded-2xl border border-neutral-200/80">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Stocked Items</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">{b._count?.inventory || 0}</span>
                </div>
                <div className="bg-neutral-50/80 p-3 rounded-2xl border border-neutral-200/80">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Staff Access</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">{b._count?.userBranches || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSwitchBranch(b.id)}
              className="mt-6 w-full py-2.5 bg-white hover:bg-emerald-50 text-neutral-900 hover:text-emerald-900 border border-neutral-300 hover:border-emerald-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Switch Working Terminal to this Branch
            </button>
          </div>
        ))}
      </div>

      {/* CREATE BRANCH MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Add New Store Branch</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nallur Express Outlet / Kandy Mall Branch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-02"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 0777654321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Address / Street Location</label>
                <input
                  type="text"
                  placeholder="e.g. No. 28, Point Pedro Road, Nallur"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Saving..." : "Create Branch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
