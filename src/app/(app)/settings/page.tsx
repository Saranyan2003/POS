"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Store, Printer, Boxes, Sparkles, Building2, Phone, MapPin } from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { getBusinessProfile, BusinessProfile } from "@/lib/business-profiles";

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    businessType: "Grocery & Retail",
    address: "",
    city: "",
    taxNumber: "",
    receiptHeader: "",
    receiptFooter: "Thank you for your business! Please visit again.",
  });

  useEffect(() => {
    safeFetchJson("/api/business/settings").then((d) => {
      if (d?.business) {
        const b = d.business;
        setBusiness(b);
        setFormData({
          name: b.name || "",
          phone: b.phone || "",
          email: b.email || "",
          businessType: b.businessType || "Grocery & Retail",
          address: b.address || "",
          city: b.city || "",
          taxNumber: b.taxNumber || "",
          receiptHeader: b.receiptHeader || (b.name ? `${b.name}\n${b.address || ""}\nTel: ${b.phone || ""}` : ""),
          receiptFooter: b.receiptFooter || "Thank you for your business! Please visit again.",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to update settings.");
        setSaving(false);
        return;
      }

      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveError("Network error occurred while saving.");
      setSaving(false);
    }
  };

  const currentProfile: BusinessProfile = getBusinessProfile(formData.businessType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Header - Obsidian & Emerald Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              System Preferences
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {currentProfile.badge}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            Business & Print Settings
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Store profile, industry business mode, VAT/tax details, and thermal receipt print configurations.
          </p>
        </div>
      </div>

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <span>{saveError}</span>
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Business settings and industry profile saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile & Industry Type */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-black text-neutral-950 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Store Profile & Industry Mode</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">Industry Business Type</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Electronics & Mobile">📱 Electronics & Mobile</option>
                <option value="Grocery & Retail">🛒 Grocery & Retail</option>
                <option value="Pharmacy">💊 Pharmacy</option>
                <option value="Clothing Store">👕 Clothing Store</option>
                <option value="Restaurant & Cafe">🍽️ Restaurant & Cafe</option>
                <option value="Bakery & Takeaway">🥐 Bakery & Takeaway</option>
                <option value="Salon & Barber">✂️ Salon & Barber</option>
                <option value="Wholesale">📦 Wholesale</option>
              </select>
            </div>
          </div>

          {/* Active Profile Info Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-emerald-950">Active Mode: {currentProfile.badge}</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                {currentProfile.catalogSubtitle} Supported units:{" "}
                <span className="font-mono font-bold text-emerald-800">
                  {currentProfile.units.map((u) => u.value).join(", ")}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">WhatsApp Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">City / Town</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Colombo 03, Kandy, Galle"
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">Address / Street</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 uppercase mb-1">Tax / VAT Registration No.</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="Optional"
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Thermal Receipt Settings */}
        <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-black text-neutral-950 flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Thermal Receipt Customization (ESC/POS 80mm)</span>
          </h2>

          <div>
            <label className="block font-semibold text-neutral-700 uppercase mb-1">Receipt Header Text</label>
            <textarea
              rows={3}
              value={formData.receiptHeader}
              onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
              placeholder="e.g. YOUR STORE NAME&#10;No. 123, Main Street, Colombo&#10;Tel: 077 123 4567"
              className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 uppercase mb-1">Receipt Footer Message</label>
            <input
              type="text"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              placeholder="e.g. Thank you for your business! Please visit again."
              className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Settings..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
