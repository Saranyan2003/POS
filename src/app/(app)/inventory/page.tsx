"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Sliders,
  History,
  AlertTriangle,
  Search,
  Plus,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Barcode,
  Package,
  Sparkles,
  TrendingDown,
  Layers,
  Zap,
  Flame,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getBusinessProfile,
  BusinessProfile,
  isServiceProduct,
  isMadeToOrderProduct,
  isServiceUnit,
  isMadeToOrderUnit,
} from "@/lib/business-profiles";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "OUT">("ALL");
  const [itemTypeFilter, setItemTypeFilter] = useState<"ALL" | "PHYSICAL" | "SERVICES">("ALL");
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");
  const [loading, setLoading] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementRange, setMovementRange] = useState("all");
  const [movementStartDate, setMovementStartDate] = useState("");
  const [movementEndDate, setMovementEndDate] = useState("");

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustData, setAdjustData] = useState({
    newQuantity: "",
    type: "MANUAL_ADJUSTMENT",
    notes: "",
  });
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  // Create Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    costPrice: "",
    sellingPrice: "",
    minStockLevel: "5",
    unit: "pcs",
    initialStock: "0",
  });

  const loadMovements = async (range = movementRange, start = movementStartDate, end = movementEndDate) => {
    setLoadingMovements(true);
    try {
      const queryParams = new URLSearchParams();
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);
      const mRes = await safeFetchJson(`/api/inventory/movements?${queryParams.toString()}`);
      if (mRes?.movements) setMovements(mRes.movements);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovements(false);
    }
  };

  const debouncedSearch = useDebounce(search, 250);

  // Initial load: Fetch auth, categories, movements, and initial products once on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [pRes, meRes, catRes] = await Promise.all([
          safeFetchJson("/api/products"),
          safeFetchJson("/api/auth/me"),
          safeFetchJson("/api/categories"),
        ]);

        if (!isMounted) return;
        if (pRes?.products) setProducts(pRes.products);
        if (meRes?.user?.business) setBusinessInfo(meRes.user.business);
        if (catRes?.categories) setCategories(catRes.categories);
        await loadMovements();
        setLoading(false);
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products when search query changes (debounced by 250ms)
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const pRes = await safeFetchJson(`/api/products?search=${encodeURIComponent(debouncedSearch)}`);
        if (pRes?.products) setProducts(pRes.products);
      } catch (e) {
        console.error(e);
      }
    };

    fetchFilteredProducts();
  }, [debouncedSearch]);

  // General reload after inventory adjustment or product creation
  const loadData = async () => {
    try {
      const pRes = await safeFetchJson(`/api/products?search=${encodeURIComponent(debouncedSearch)}`);
      if (pRes?.products) setProducts(pRes.products);
      await loadMovements();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMovementDateChange = (range: string, start?: string, end?: string) => {
    setMovementRange(range);
    setMovementStartDate(start || "");
    setMovementEndDate(end || "");
    loadMovements(range, start, end);
  };

  const profile: BusinessProfile = getBusinessProfile(businessInfo?.businessType);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const parsedQty = parseFloat(adjustData.newQuantity);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setAdjustError("New physical stock count cannot be negative. Must be 0 or greater.");
      return;
    }

    setSubmittingAdjust(true);
    setAdjustError("");

    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          newQuantity: parsedQty,
          type: adjustData.type,
          notes: adjustData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error || "Failed to save stock adjustment.");
        setSubmittingAdjust(false);
        return;
      }

      setShowAdjustModal(false);
      setSubmittingAdjust(false);
      loadData();
    } catch (e) {
      setAdjustError("Network error occurred.");
      setSubmittingAdjust(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setCreateError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create product.");
        setSubmittingProduct(false);
        return;
      }

      setShowCreateModal(false);
      setSubmittingProduct(false);
      setNewProduct({
        name: "",
        sku: "",
        barcode: "",
        categoryId: "",
        costPrice: "",
        sellingPrice: "",
        minStockLevel: "5",
        unit: "pcs",
        initialStock: "0",
      });
      loadData();
    } catch (e) {
      setCreateError("Network error occurred.");
      setSubmittingProduct(false);
    }
  };

  // Quick adjustment delta helpers (Strictly non-negative)
  const handleQuickDelta = (delta: number) => {
    const rawVal = parseFloat(adjustData.newQuantity);
    const current = isNaN(rawVal) ? Math.max(0, selectedProduct?.currentStock ?? 0) : Math.max(0, rawVal);
    const updated = Math.max(0, current + delta);
    setAdjustData({ ...adjustData, newQuantity: updated.toString() });
  };

  // Computed metrics (Physical tracked inventory vs Intangible Services / Fresh Prep)
  const physicalProducts = products.filter((p) => !isServiceProduct(p) && !isMadeToOrderProduct(p));
  const serviceProducts = products.filter((p) => isServiceProduct(p) || isMadeToOrderProduct(p));
  const totalStockItems = products.length;
  const totalStockValuation = physicalProducts.reduce((sum, p) => sum + Math.max(0, p.currentStock || 0) * (p.costPrice || 0), 0);
  const lowStockCount = physicalProducts.filter((p) => p.isLowStock && !p.isOutOfStock).length;
  const outOfStockCount = physicalProducts.filter((p) => p.isOutOfStock).length;

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (itemTypeFilter === "PHYSICAL" && (isServiceProduct(p) || isMadeToOrderProduct(p))) return false;
    if (itemTypeFilter === "SERVICES" && !isServiceProduct(p) && !isMadeToOrderProduct(p)) return false;
    if (selectedCategory !== "ALL" && p.categoryId !== selectedCategory) return false;
    if (stockFilter === "LOW" && !p.isLowStock) return false;
    if (stockFilter === "OUT" && !p.isOutOfStock) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 shadow-xs">
              Stock Telemetry
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {profile.badge}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Real-time branch inventory levels, physical count adjustments, and movement audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-neutral-950" />
            <span>Add New Item</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "stock"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Stock Levels
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "movements"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Movement Logs
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Catalog Items
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-1 font-mono">{totalStockItems}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {physicalProducts.length} Physical Stock{serviceProducts.length > 0 ? ` • ${serviceProducts.length} Services` : ""}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm hover:border-emerald-500/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Stock Valuation (Cost)
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{formatLKR(totalStockValuation)}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Physical warehouse asset value</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "LOW" ? "ALL" : "LOW")}
          className={`p-5 rounded-2xl bg-white/95 backdrop-blur-md border cursor-pointer transition-all flex items-center justify-between ${
            stockFilter === "LOW" ? "border-2 border-emerald-600 bg-emerald-50/50 shadow-sm" : "border-emerald-900/10 hover:border-emerald-500/40"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Low Stock Warnings
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{lowStockCount}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Physical items at/below threshold</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "OUT" ? "ALL" : "OUT")}
          className={`p-5 rounded-2xl bg-white/95 backdrop-blur-md border cursor-pointer transition-all flex items-center justify-between ${
            stockFilter === "OUT" ? "border-2 border-emerald-600 bg-emerald-50/50 shadow-sm" : "border-emerald-900/10 hover:border-emerald-500/40"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
              Out of Stock
            </span>
            <p className="text-2xl font-black text-red-600 mt-1 font-mono">{outOfStockCount}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Physical items needing restock</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center text-red-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {activeTab === "stock" && (
        <>
          {/* Search, Type Filter & Category Filter Pills */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={profile.inventorySearchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-emerald-900/15 rounded-xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {stockFilter !== "ALL" && (
                <button
                  onClick={() => setStockFilter("ALL")}
                  className="px-3 py-2 bg-emerald-100/80 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300/50 flex items-center gap-1.5 hover:bg-emerald-200/80 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Stock Filter ({stockFilter})</span>
                </button>
              )}
            </div>

            {/* Filter by Item Type (Physical Stock vs Services) */}
            {serviceProducts.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-900/10 w-fit">
                <button
                  onClick={() => setItemTypeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemTypeFilter === "ALL"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                      : "text-neutral-700 hover:text-emerald-900"
                  }`}
                >
                  All Items ({products.length})
                </button>
                <button
                  onClick={() => setItemTypeFilter("PHYSICAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemTypeFilter === "PHYSICAL"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                      : "text-neutral-700 hover:text-emerald-900"
                  }`}
                >
                  Physical Stock ({physicalProducts.length})
                </button>
                <button
                  onClick={() => setItemTypeFilter("SERVICES")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    itemTypeFilter === "SERVICES"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                      : "text-neutral-700 hover:text-emerald-900"
                  }`}
                >
                  Services & On-Demand ({serviceProducts.length})
                </button>
              </div>
            )}

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white text-neutral-700 border border-emerald-900/10 hover:bg-emerald-50"
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                        : "bg-white text-neutral-700 border border-emerald-900/10 hover:bg-emerald-50"
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-black bg-emerald-50/50 text-[11px] tracking-wider">
                    <th className="p-4">{profile.productTerm} Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">{profile.identifierLabel}</th>
                    <th className="p-4">Cost Price</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Stock Valuation</th>
                    <th className="p-4 text-right">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/5">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                          <span>Loading inventory catalog...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-neutral-400">
                        <Boxes className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="font-semibold text-neutral-700">No items found.</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Click "Add New Item" to create stock records.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isService = isServiceProduct(p) || isServiceUnit(p.unit);
                      const isMadeToOrder = isMadeToOrderProduct(p) || isMadeToOrderUnit(p.unit);

                      return (
                        <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {isService && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100/80 border border-emerald-300/50 text-emerald-900 text-[9px] font-extrabold uppercase">
                                  Service
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {isService ? "On-Demand Service (No Warehouse Stock)" : `Min Threshold: ${p.minStockLevel} ${p.unit}`}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium">
                              {p.category?.name || "General"}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-neutral-700 text-[11px]">
                            {p.barcode ? (
                              <span className="flex items-center gap-1">
                                <Barcode className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{p.barcode}</span>
                              </span>
                            ) : (
                              p.sku || "-"
                            )}
                          </td>
                          <td className="p-4 font-mono text-neutral-600">
                            {p.costPrice > 0 ? (
                              formatLKR(p.costPrice)
                            ) : isService ? (
                              <span className="text-neutral-500 font-normal text-[11px]">Rs. 0.00 (Labor)</span>
                            ) : (
                              "Rs. 0.00"
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-800">{formatLKR(p.sellingPrice)}</td>
                          <td className="p-4">
                            {isService ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100/80 text-emerald-900 border border-emerald-300/50">
                                <Zap className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Unlimited (Service)</span>
                              </span>
                            ) : isMadeToOrder ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100/80 text-emerald-900 border border-emerald-300/50">
                                <Flame className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Fresh Prep</span>
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  p.currentStock < 0
                                    ? "bg-red-600 text-white border border-red-700 shadow-xs"
                                    : p.isOutOfStock
                                    ? "bg-neutral-900 text-white font-bold"
                                    : p.isLowStock
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-emerald-100/80 text-emerald-900 border border-emerald-300/50"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    p.currentStock < 0 ? "bg-white animate-pulse" : p.isOutOfStock ? "bg-red-400" : p.isLowStock ? "bg-amber-600" : "bg-emerald-600"
                                  }`}
                                />
                                <span>
                                  {p.currentStock < 0 ? `Deficit: ${p.currentStock} ${p.unit}` : `${p.currentStock} ${p.unit}`}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold text-neutral-950">
                            {isService ? (
                              <span className="text-neutral-400 text-xs italic font-medium">— (Service)</span>
                            ) : isMadeToOrder ? (
                              <span className="text-neutral-400 text-xs italic font-medium">— (Fresh Prep)</span>
                            ) : p.currentStock < 0 ? (
                              <span className="text-neutral-500 text-[11px]">Rs. 0.00 (Deficit)</span>
                            ) : (
                              formatLKR(p.currentStock * p.costPrice)
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isService ? (
                              <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200 inline-block">
                                ⚡ On-Demand
                              </span>
                            ) : isMadeToOrder ? (
                              <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200 inline-block">
                                ⚡ Fresh Prep
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setAdjustData({
                                    newQuantity: Math.max(0, p.currentStock ?? 0).toString(),
                                    type: "MANUAL_ADJUSTMENT",
                                    notes: "",
                                  });
                                  setAdjustError("");
                                  setShowAdjustModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-900/15 text-emerald-900 text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer shadow-2xs active:scale-95"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Adjust</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "movements" && (
        <div className="space-y-4">
          {/* Movement Date Filter Bar */}
          <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl p-3 shadow-xs">
            <DateRangeFilter
              value={movementRange}
              startDate={movementStartDate}
              endDate={movementEndDate}
              onChange={handleMovementDateChange}
              isLoading={loadingMovements}
            />
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-emerald-900/10 text-emerald-950 uppercase font-semibold font-sans bg-emerald-50/50">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">{profile.productTerm}</th>
                    <th className="p-4">Movement Type</th>
                    <th className="p-4 text-center">Change Qty</th>
                    <th className="p-4 text-center">Balance After</th>
                    <th className="p-4 font-sans">Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/5 text-[11px]">
                  {loadingMovements ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                          <span>Filtering movement audit logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400 font-sans">
                        No stock movement history recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-4 text-neutral-600 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}
                        </td>
                        <td className="p-4 font-sans font-bold text-neutral-950">{m.product?.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 border border-emerald-200 font-bold">
                            {m.type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className={`p-4 text-center font-bold ${isPositive ? "text-emerald-700" : "text-neutral-700"}`}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="p-4 text-center font-bold text-neutral-950">{m.balanceAfter}</td>
                        <td className="p-4 font-sans text-neutral-600">{m.notes || "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADJUST STOCK MODAL */}
      {/* ========================================================================= */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Adjust Stock Count</h3>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <p className="font-bold text-neutral-950 text-sm">{selectedProduct.name}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Current Stock Level:</span>
                  <span className="font-mono font-black text-neutral-950 text-sm">
                    {selectedProduct.currentStock} {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  New Physical Stock Count (0 or more)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0"
                  value={adjustData.newQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "" && parseFloat(val) < 0) return;
                    setAdjustData({ ...adjustData, newQuantity: val });
                  }}
                  className="w-full p-3 bg-white border-2 border-emerald-700 rounded-xl text-neutral-950 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Delta calculation badge */}
                {adjustData.newQuantity !== "" && (
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-500">Calculated Adjustment Delta:</span>
                    <span className="font-bold text-emerald-800">
                      {parseFloat(adjustData.newQuantity) - selectedProduct.currentStock >= 0 ? "+" : ""}
                      {parseFloat(adjustData.newQuantity) - selectedProduct.currentStock} {selectedProduct.unit}
                    </span>
                  </div>
                )}

                {/* Quick increment buttons */}
                <div className="flex gap-1.5 mt-2">
                  {[-10, -5, -1, +1, +5, +10].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleQuickDelta(delta)}
                      className="flex-1 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-mono text-[10px] font-bold text-emerald-900 transition-colors cursor-pointer"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Adjustment Reason</label>
                <select
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="MANUAL_ADJUSTMENT">Physical Stock Count Correction</option>
                  <option value="DAMAGED_DISPOSAL">Damaged / Expired Item Disposal</option>
                  <option value="BRANCH_TRANSFER_IN">Branch Inward Transfer</option>
                  <option value="BRANCH_TRANSFER_OUT">Branch Outward Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Month-end audit or discrepancy verified"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {submittingAdjust ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-950">Add New {profile.productTerm}</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  {profile.productTerm} Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${profile.namePlaceholder}`}
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">General</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Unit of Measure</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {profile.units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Barcode / EAN</label>
                  <input
                    type="text"
                    placeholder="Scan or type barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ITM-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Cost Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Selling Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Initial Opening Stock</label>
                  <input
                    type="number"
                    step="any"
                    value={newProduct.initialStock}
                    onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Min Low Stock Alert</label>
                  <input
                    type="number"
                    value={newProduct.minStockLevel}
                    onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
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
                  disabled={submittingProduct}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingProduct ? "Creating..." : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
