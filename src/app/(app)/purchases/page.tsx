"use client";

import React, { useState, useEffect } from "react";
import { Truck, Plus, Search, X, CheckCircle2, AlertTriangle, Package, Calendar, Layers, Boxes, Trash2 } from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // New Purchase Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Purchase State & Modal
  const [purchaseToDelete, setPurchaseToDelete] = useState<any>(null);
  const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);
  const [deletePurchaseError, setDeletePurchaseError] = useState("");

  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; unitCost: number }>>([
    { productId: "", quantity: 10, unitCost: 0 },
  ]);

  const loadData = async (range = dateRange, start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);

      const [purRes, supRes, prodRes] = await Promise.all([
        safeFetchJson(`/api/purchases?${queryParams.toString()}`),
        safeFetchJson("/api/suppliers"),
        safeFetchJson("/api/products"),
      ]);

      if (purRes?.purchases) setPurchases(purRes.purchases);
      if (supRes?.suppliers) {
        setSuppliers(supRes.suppliers);
        if (supRes.suppliers.length > 0 && !supplierId) setSupplierId(supRes.suppliers[0].id);
      }
      if (prodRes?.products) setProducts(prodRes.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    setIsDeletingPurchase(true);
    setDeletePurchaseError("");

    try {
      const res = await fetch(`/api/purchases?id=${purchaseToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setDeletePurchaseError(data.error || "Failed to remove delivery order.");
        setIsDeletingPurchase(false);
        return;
      }

      setPurchaseToDelete(null);
      setIsDeletingPurchase(false);
      loadData();
    } catch (e) {
      setDeletePurchaseError("Network error occurred.");
      setIsDeletingPurchase(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDateFilterChange = (range: string, start?: string, end?: string) => {
    setDateRange(range);
    setStartDate(start || "");
    setEndDate(end || "");
    loadData(range, start, end);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: products[0]?.id || "", quantity: 10, unitCost: products[0]?.costPrice || 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) updated[index].unitCost = prod.costPrice || 0;
    }
    setItems(updated);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          invoiceNumber,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to record purchase.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setSubmitting(false);
      loadData();
    } catch (e) {
      setModalError("Network error occurred.");
      setSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier?.name && p.supplier.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPurchaseVolume = purchases.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Procurement & Restocking
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              Inward Invoices
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-emerald-400" />
            Purchases & Inward Stock
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Record wholesale deliveries, track supplier invoices, and auto-restock branch inventory.
          </p>
        </div>
        <button
          onClick={() => {
            setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
            setItems([{ productId: products[0]?.id || "", quantity: 20, unitCost: products[0]?.costPrice || 100 }]);
            setModalError("");
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inward Delivery</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm flex items-center justify-between hover:border-emerald-500/30 transition-all">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Total Inward Shipments
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-1 font-mono">{purchases.length}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Recorded vendor deliveries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm flex items-center justify-between hover:border-emerald-500/30 transition-all">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Cumulative Inventory Inflow
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{formatLKR(totalPurchaseVolume)}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Total wholesale restock value</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-4 shadow-sm">
        <DateRangeFilter
          value={dateRange}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateFilterChange}
          isLoading={loading}
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by supplier invoice # or vendor name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Purchases Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-4">Delivery Invoice #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Supplier Vendor</th>
                <th className="p-4">Items Received</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                      <span>Loading delivery logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400">
                    <Truck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No purchase records found.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Click "Record Inward Delivery" to log vendor shipments.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-950 text-sm">{p.invoiceNumber}</td>
                    <td className="p-4 text-neutral-600 whitespace-nowrap">
                      {new Date(p.purchaseDate).toLocaleDateString("en-LK")}
                    </td>
                    <td className="p-4 font-bold text-neutral-950">{p.supplier?.name}</td>
                    <td className="p-4 text-neutral-700 font-mono">{p.items?.length || 0} line items</td>
                    <td className="p-4 font-mono font-bold text-emerald-800 text-sm">{formatLKR(p.total)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                        Received & Restocked
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setPurchaseToDelete(p);
                          setDeletePurchaseError("");
                        }}
                        title="Cancel / Remove mistaken inward delivery"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* DELETE PURCHASE MODAL */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-500 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Remove Mistaken Delivery</h3>
              </div>
              <button onClick={() => setPurchaseToDelete(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deletePurchaseError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deletePurchaseError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Was this delivery entered by mistake? Removing this record will automatically deduct the received stock units from branch inventory and reverse supplier payables.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Invoice #:</span>
                  <span className="font-bold text-neutral-950">{purchaseToDelete.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Supplier:</span>
                  <span className="font-bold text-neutral-950">{purchaseToDelete.supplier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Total Amount:</span>
                  <span className="font-bold text-emerald-700">{formatLKR(purchaseToDelete.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Items to Deduct:</span>
                  <span className="text-neutral-800 font-sans">{purchaseToDelete.items?.length || 0} line items</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPurchaseToDelete(null)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePurchase}
                  disabled={isDeletingPurchase}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingPurchase ? "Removing..." : "Confirm & Deduct Stock"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW PURCHASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Record Inward Stock Delivery</h3>
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

            <form onSubmit={handleCreatePurchase} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Supplier Vendor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Supplier Bill / Invoice #</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 uppercase">Received Products & Quantities</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-emerald-700 hover:underline text-xs font-bold"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-neutral-50/80 rounded-2xl border border-neutral-200">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        required
                        className="flex-1 p-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs cursor-pointer"
                      >
                        <option value="">Select Catalog Item</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-20 p-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono text-center font-bold"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cost"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, "unitCost", parseFloat(e.target.value) || 0)}
                        className="w-28 p-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono text-right font-bold"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-neutral-400 hover:text-rose-600 p-1.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-950 uppercase text-xs">Total Restock Cost:</span>
                <span className="font-mono font-black text-lg text-emerald-800">
                  {formatLKR(calculateTotalCost())}
                </span>
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
                  <span>{submitting ? "Processing..." : "Complete Delivery & Restock"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
