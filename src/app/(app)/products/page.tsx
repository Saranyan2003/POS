"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Flame,
  Check,
  Boxes,
  Clock,
  Sparkles,
  Building,
  Tag,
  Barcode,
  TrendingUp,
  Percent,
  CheckCircle2,
  Zap,
  FolderPlus,
} from "lucide-react";
import { formatLKR } from "@/lib/currency";
import { safeFetchJson } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getBusinessProfile,
  BusinessProfile,
  isServiceUnit,
  isMadeToOrderUnit,
  isServiceProduct,
  isMadeToOrderProduct,
} from "@/lib/business-profiles";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Active business profile
  const profile: BusinessProfile = getBusinessProfile(businessInfo?.businessType);

  // Add Product Modal state
  const [showModal, setShowModal] = useState(false);
  const [stockMode, setStockMode] = useState<"made_to_order" | "track_stock">("track_stock");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    sku: "",
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    discountPrice: "",
    minStockLevel: "5",
    unit: "pcs",
    initialStock: "50",
    description: "",
  });

  // Edit Product Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    sku: "",
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    discountPrice: "",
    minStockLevel: "5",
    unit: "pcs",
    description: "",
  });
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Category Manager Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categorySuccess, setCategorySuccess] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Inline Quick Add Category state for Add/Edit product modals
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState("");
  const [inlineCatSubmitting, setInlineCatSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  // Fetch only products on search or category filter change
  const fetchProducts = async (query = debouncedSearch, catId = selectedCategory) => {
    try {
      const url = new URL("/api/products", window.location.origin);
      if (query) url.searchParams.set("search", query);
      if (catId) url.searchParams.set("categoryId", catId);

      const pRes = await safeFetchJson(url.toString());
      if (pRes?.products) setProducts(pRes.products);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  // Fetch only categories
  const fetchCategories = async () => {
    try {
      const catRes = await safeFetchJson("/api/categories");
      if (catRes?.categories) setCategories(catRes.categories);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  // General reload for create/edit/delete mutations
  const loadData = async () => {
    await Promise.all([fetchProducts(), fetchCategories()]);
  };

  // Initial load: Fetch categories, suppliers, auth, and products once on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [pRes, catRes, supRes, meRes] = await Promise.all([
          safeFetchJson("/api/products"),
          safeFetchJson("/api/categories"),
          safeFetchJson("/api/suppliers"),
          safeFetchJson("/api/auth/me"),
        ]);

        if (!isMounted) return;
        if (pRes?.products) setProducts(pRes.products);
        if (catRes?.categories) setCategories(catRes.categories);
        if (supRes?.suppliers) setSuppliers(supRes.suppliers);
        if (meRes?.user?.business) setBusinessInfo(meRes.user.business);
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

  // Filter products when search or category changes (debounced by 250ms)
  useEffect(() => {
    fetchProducts(debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory]);

  const generateBarcode = () => {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    return `479${randomDigits}`;
  };

  const handleOpenAddModal = () => {
    const defaultUnit = profile.defaultUnit;
    const isService = isServiceUnit(defaultUnit);
    setFormData({
      name: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      supplierId: "",
      sku: "",
      barcode: "",
      costPrice: "",
      sellingPrice: "",
      discountPrice: "",
      minStockLevel: isService ? "0" : "5",
      unit: defaultUnit,
      initialStock: isService ? "0" : profile.hasMadeToOrder && profile.defaultStockMode === "made_to_order" ? "9999" : "50",
      description: "",
    });
    setStockMode(profile.defaultStockMode);
    setShowInlineAddCat(false);
    setInlineCatName("");
    setModalError("");
    setShowModal(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    const isService = isServiceUnit(formData.unit);
    const isUnlimited = isService || (profile.hasMadeToOrder && stockMode === "made_to_order");
    const payload = {
      ...formData,
      costPrice: isService && !formData.costPrice ? "0" : formData.costPrice || "0",
      minStockLevel: isService ? "0" : formData.minStockLevel || "5",
      initialStock: isService ? "0" : isUnlimited ? "9999" : formData.initialStock || "0",
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to create item.");
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

  const handleOpenEdit = (p: any) => {
    const isService = isServiceUnit(p.unit);
    setEditingProductId(p.id);
    setEditFormData({
      name: p.name || "",
      categoryId: p.categoryId || "",
      supplierId: p.supplierId || "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      costPrice: p.costPrice !== undefined ? String(p.costPrice) : "",
      sellingPrice: p.sellingPrice !== undefined ? String(p.sellingPrice) : "",
      discountPrice: p.discountPrice !== null && p.discountPrice !== undefined ? String(p.discountPrice) : "",
      minStockLevel: isService ? "0" : p.minStockLevel !== undefined ? String(p.minStockLevel) : "5",
      unit: p.unit || profile.defaultUnit,
      description: p.description || "",
    });
    setShowInlineAddCat(false);
    setInlineCatName("");
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    setEditSubmitting(true);
    setEditError("");

    const isService = isServiceUnit(editFormData.unit);
    const payload = {
      ...editFormData,
      costPrice: isService && !editFormData.costPrice ? "0" : editFormData.costPrice || "0",
      minStockLevel: isService ? "0" : editFormData.minStockLevel || "5",
    };

    try {
      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Failed to update item.");
        setEditSubmitting(false);
        return;
      }

      setShowEditModal(false);
      setEditSubmitting(false);
      loadData();
    } catch (e) {
      setEditError("Network error occurred.");
      setEditSubmitting(false);
    }
  };

  // Category Manager Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategorySubmitting(true);
    setCategoryError("");
    setCategorySuccess("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCategoryError(data.error || "Failed to add category.");
        setCategorySubmitting(false);
        return;
      }

      setNewCategoryName("");
      setCategorySuccess(`Category "${data.category?.name}" created successfully!`);
      setCategorySubmitting(false);
      loadData();
    } catch (e) {
      setCategoryError("Network error occurred.");
      setCategorySubmitting(false);
    }
  };

  const handleSeedIndustryCategories = async () => {
    setCategorySubmitting(true);
    setCategoryError("");
    setCategorySuccess("");

    try {
      const res = await fetch("/api/categories/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: businessInfo?.businessType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCategoryError(data.error || "Failed to seed preset categories.");
        setCategorySubmitting(false);
        return;
      }

      setCategorySuccess(data.message || "Preset categories loaded successfully!");
      setCategorySubmitting(false);
      loadData();
    } catch (e) {
      setCategoryError("Network error occurred.");
      setCategorySubmitting(false);
    }
  };

  const handleSaveRenameCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategoryName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to rename category");
        return;
      }

      setEditingCategoryId(null);
      setEditingCategoryName("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?\n(Any items in this category will simply become uncategorized)`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Inline Category Add within Product Form
  const handleInlineAddCategory = async (targetForm: "add" | "edit") => {
    if (!inlineCatName.trim()) return;
    setInlineCatSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inlineCatName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add category.");
        setInlineCatSubmitting(false);
        return;
      }

      if (targetForm === "add") {
        setFormData((prev) => ({ ...prev, categoryId: data.category.id }));
      } else {
        setEditFormData((prev) => ({ ...prev, categoryId: data.category.id }));
      }

      setInlineCatName("");
      setShowInlineAddCat(false);
      setInlineCatSubmitting(false);
      loadData();
    } catch (e) {
      setInlineCatSubmitting(false);
    }
  };

  const handleArchiveProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove/archive "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to calculate live profit and margin for modals
  const calculateMargin = (cost: string, selling: string) => {
    const c = parseFloat(cost) || 0;
    const s = parseFloat(selling) || 0;
    if (s <= 0) return { profit: 0, marginPercent: 0, isNegative: false };
    const profit = s - c;
    const marginPercent = ((profit / s) * 100);
    return {
      profit,
      marginPercent: Math.round(marginPercent * 10) / 10,
      isNegative: profit < 0,
    };
  };

  const addMargin = calculateMargin(formData.costPrice, formData.sellingPrice);
  const editMargin = calculateMargin(editFormData.costPrice, editFormData.sellingPrice);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {profile.badge}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            {profile.catalogTitle}
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            {profile.catalogSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => {
              setCategoryError("");
              setCategorySuccess("");
              setShowCategoryModal(true);
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-emerald-500/30 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Manage Categories ({categories.length})</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>{profile.addItemButtonLabel}</span>
          </button>
        </div>
      </div>

      {/* No Categories Suggestion Banner */}
      {categories.length === 0 && !loading && (
        <div className="bg-emerald-50/70 border-2 border-dashed border-emerald-300 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Setup Product Categories for {profile.name}
              </p>
              <p className="text-[11px] text-neutral-600">
                Categories organize your stock and create 1-tap quick buttons on your POS checkout screen.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedIndustryCategories}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all border border-emerald-400/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Load {profile.name} Categories</span>
          </button>
        </div>
      )}

      {/* Categories Bar & Search */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={profile.catalogSearchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          />
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  : "bg-white/90 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-950 border border-emerald-900/10 shadow-xs"
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id === selectedCategory ? "" : c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white/90 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-950 border border-emerald-900/10 shadow-xs"
                }`}
              >
                <span>{c.name}</span>
                {c._count?.products !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === c.id ? "bg-emerald-900/60 text-emerald-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}>
                    {c._count.products}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-4">{profile.productTerm} Details</th>
                <th className="p-4">Unit Cost (Buying)</th>
                <th className="p-4">Selling Price (Retail)</th>
                <th className="p-4">Unit Margin</th>
                <th className="p-4">Stock Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                      <span>Loading items...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400">
                    <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">
                      No {profile.productTermPlural.toLowerCase()} in your catalog yet.
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Click "{profile.addItemButtonLabel}" to add items with unit cost and selling price.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isService = isServiceProduct(p) || isServiceUnit(p.unit);
                  const isMadeToOrder = isMadeToOrderProduct(p) || isMadeToOrderUnit(p.unit);
                  const isUnlimited = isService || isMadeToOrder || (p.currentStock ?? 0) >= 9000;
                  const unitMargin = (p.sellingPrice || 0) - (p.costPrice || 0);
                  const marginPercent = p.sellingPrice > 0 ? Math.round((unitMargin / p.sellingPrice) * 1000) / 10 : 0;

                  return (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isService && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 text-[9px] font-extrabold uppercase">
                              Service
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-bold text-emerald-800">Unit: {p.unit}</span>
                          {p.category && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                              {p.category.name}
                            </span>
                          )}
                          {p.supplier && (
                            <span className="text-neutral-500">
                              • Supplier: {p.supplier.name}
                            </span>
                          )}
                          {p.barcode && <span className="text-neutral-400 font-mono">• {p.barcode}</span>}
                          {p.sku && <span className="text-neutral-400">• {p.sku}</span>}
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="p-4 font-mono text-neutral-700 font-bold">
                        {p.costPrice > 0 ? (
                          formatLKR(p.costPrice)
                        ) : isService ? (
                          <span className="text-neutral-500 font-normal text-[11px]">Rs. 0.00 (Labor)</span>
                        ) : (
                          <span className="text-neutral-400 font-normal">Rs. 0.00</span>
                        )}
                      </td>

                      {/* Selling Price */}
                      <td className="p-4 font-bold text-neutral-950 font-mono">
                        {p.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-black">{formatLKR(p.discountPrice)}</span>
                            <span className="text-[10px] text-neutral-400 line-through">{formatLKR(p.sellingPrice)}</span>
                          </div>
                        ) : (
                          formatLKR(p.sellingPrice)
                        )}
                      </td>

                      {/* Margin / Profit */}
                      <td className="p-4">
                        {p.costPrice > 0 ? (
                          <div>
                            <span className={`font-mono font-bold text-xs ${unitMargin >= 0 ? "text-emerald-700" : "text-rose-600 line-through"}`}>
                              +{formatLKR(unitMargin)}
                            </span>
                            <span className="text-[10px] text-emerald-800/80 block font-mono font-semibold">
                              ({marginPercent}% margin)
                            </span>
                          </div>
                        ) : isService ? (
                          <div>
                            <span className="font-mono font-bold text-xs text-emerald-700">
                              +{formatLKR(p.sellingPrice)}
                            </span>
                            <span className="text-[10px] text-emerald-800/80 block font-mono font-semibold">
                              (100% service margin)
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="p-4">
                        {isService ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            Unlimited (Service)
                          </span>
                        ) : isMadeToOrder || isUnlimited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Flame className="w-3 h-3 text-emerald-600" />
                            {profile.hasMadeToOrder ? "Fresh / Made-to-Order" : "Unlimited Prep"}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              p.isOutOfStock
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : p.isLowStock
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Item"
                            className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer shadow-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchiveProduct(p.id, p.name)}
                            title="Archive Item"
                            className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      {/* 1. ADD PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-950">
                  {profile.addItemModalTitle}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isServiceUnit(formData.unit)
                    ? "Set service charge, duration, and optional material/consumable cost."
                    : "Set Unit Cost (Buying Price), Selling Price (Retail), Unit, and Inventory details."}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              {/* Item Name */}
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  {profile.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={profile.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category & Supplier Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-neutral-700 uppercase">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineAddCat(!showInlineAddCat)}
                      className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showInlineAddCat ? "Close" : "New Category"}</span>
                    </button>
                  </div>

                  {showInlineAddCat ? (
                    <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <input
                        type="text"
                        placeholder="Category name..."
                        value={inlineCatName}
                        onChange={(e) => setInlineCatName(e.target.value)}
                        className="w-full p-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineAddCategory("add")}
                        disabled={inlineCatSubmitting || !inlineCatName.trim()}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        {inlineCatSubmitting ? "..." : "+ Add"}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    {isServiceUnit(formData.unit) ? "Supplier / Brand (Optional)" : "Supplier / Vendor"}
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Price vs Selling Price */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-800 uppercase mb-1">
                      {isServiceUnit(formData.unit)
                        ? "Consumables / Materials Cost (LKR)"
                        : profile.costPriceLabel}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={isServiceUnit(formData.unit) ? "0.00 (or kit cost)" : profile.costPricePlaceholder}
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      {isServiceUnit(formData.unit)
                        ? "Optional material cost (or leave 0.00 for pure labor)"
                        : profile.costPriceHelpText}
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-800 uppercase mb-1">
                      {isServiceUnit(formData.unit)
                        ? "Service Charge / Retail Price (LKR) *"
                        : profile.sellingPriceLabel}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 1500.00"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      {isServiceUnit(formData.unit)
                        ? "Amount customer is charged for this service"
                        : profile.sellingPriceHelpText}
                    </span>
                  </div>
                </div>

                {/* Live Profit Margin Feedback Pill */}
                {formData.sellingPrice && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    addMargin.isNegative
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-[11px]">
                        {addMargin.isNegative
                          ? "⚠️ Loss Warning: Selling Below Cost"
                          : isServiceUnit(formData.unit) && (!formData.costPrice || formData.costPrice === "0")
                          ? "Gross Service Profit (100% Margin):"
                          : "Estimated Profit per Unit:"}
                      </span>
                    </div>
                    <div className="text-right font-mono font-extrabold text-xs">
                      {formatLKR(addMargin.profit)} <span className="font-normal text-[10px]">({addMargin.marginPercent}% margin)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit & Discount Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Measurement Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {profile.units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label} {u.desc ? `(${u.desc})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Discount / Promo Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional offer price"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode & Identifiers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-neutral-700 uppercase">
                      {profile.identifierLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, barcode: generateBarcode() })}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                    >
                      ⚡ Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={profile.identifierPlaceholder}
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    {profile.secondaryLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={profile.secondaryPlaceholder}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock / Availability Selector */}
              {isServiceUnit(formData.unit) ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-emerald-950">⚡ Unlimited On-Demand Service</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Services are performed on demand by your stylists and staff. No physical stock count or warehouse deduction is needed, and this service will always be available on POS terminal.
                    </p>
                  </div>
                </div>
              ) : profile.hasMadeToOrder ? (
                <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl space-y-2.5">
                  <label className="block font-semibold text-neutral-700 uppercase text-[11px]">
                    Availability Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.stockModeOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setStockMode(opt.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          stockMode === opt.key
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow-sm"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" />
                            {opt.label}
                          </p>
                          <p className="text-[10px] opacity-80">{opt.desc}</p>
                        </div>
                        {stockMode === opt.key && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>

                  {stockMode === "track_stock" && (
                    <div className="pt-2 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-600 uppercase mb-1">
                          Available Opening Quantity
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={formData.initialStock}
                          onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-600 uppercase mb-1">
                          Low Stock Alert Level
                        </label>
                        <input
                          type="number"
                          value={formData.minStockLevel}
                          onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl space-y-2.5">
                  <label className="block font-semibold text-neutral-700 uppercase text-[11px]">
                    Inventory Opening Stock
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-600 uppercase mb-1">
                        Initial Stock Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.initialStock}
                        onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-600 uppercase mb-1">
                        Low Stock Alert Level
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? "Saving Item..." : "Save to Catalog"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-950">
                Edit {profile.productTerm}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  {profile.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category & Supplier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-neutral-700 uppercase">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineAddCat(!showInlineAddCat)}
                      className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showInlineAddCat ? "Close" : "New Category"}</span>
                    </button>
                  </div>

                  {showInlineAddCat ? (
                    <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <input
                        type="text"
                        placeholder="Category name..."
                        value={inlineCatName}
                        onChange={(e) => setInlineCatName(e.target.value)}
                        className="w-full p-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineAddCategory("edit")}
                        disabled={inlineCatSubmitting || !inlineCatName.trim()}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        {inlineCatSubmitting ? "..." : "+ Add"}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editFormData.categoryId}
                      onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    {isServiceUnit(editFormData.unit) ? "Supplier / Brand (Optional)" : "Supplier / Vendor"}
                  </label>
                  <select
                    value={editFormData.supplierId}
                    onChange={(e) => setEditFormData({ ...editFormData, supplierId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Price vs Selling Price */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-800 uppercase mb-1">
                      {isServiceUnit(editFormData.unit)
                        ? "Consumables / Materials Cost (LKR)"
                        : profile.costPriceLabel}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.costPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, costPrice: e.target.value })}
                      placeholder={isServiceUnit(editFormData.unit) ? "0.00" : profile.costPricePlaceholder}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-800 uppercase mb-1">
                      {isServiceUnit(editFormData.unit)
                        ? "Service Charge / Retail Price (LKR) *"
                        : profile.sellingPriceLabel}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.sellingPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, sellingPrice: e.target.value })}
                      className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-xl text-neutral-950 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Margin pill */}
                {editFormData.sellingPrice && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    editMargin.isNegative
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}>
                    <span className="font-bold text-[11px]">Profit per Unit:</span>
                    <span className="font-mono font-extrabold text-xs">
                      {formatLKR(editMargin.profit)} ({editMargin.marginPercent}% margin)
                    </span>
                  </div>
                )}
              </div>

              {/* Unit & Discount Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Unit</label>
                  <select
                    value={editFormData.unit}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {profile.units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label} {u.desc ? `(${u.desc})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Discount Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.discountPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, discountPrice: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">{profile.identifierLabel}</label>
                  <input
                    type="text"
                    value={editFormData.barcode}
                    onChange={(e) => setEditFormData({ ...editFormData, barcode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">{profile.secondaryLabel}</label>
                  <input
                    type="text"
                    value={editFormData.sku}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {!isServiceUnit(editFormData.unit) && (
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={editFormData.minStockLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, minStockLevel: e.target.value })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

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
                  disabled={editSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editSubmitting ? "Updating..." : "Update Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CATEGORY MANAGER MODAL (FULL CRUD + 1-CLICK PRESET SEEDER) */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-neutral-950">Product Categories</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {profile.badge}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Organizes your products and generates 1-tap quick filter tabs on POS checkout.
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{categoryError}</span>
              </div>
            )}

            {categorySuccess && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{categorySuccess}</span>
              </div>
            )}

            {/* 1-Click Industry Category Seeder */}
            <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preset {profile.name} Categories</span>
                </p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  {profile.suggestedCategories?.length || 0} standard industry categories available
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedIndustryCategories}
                disabled={categorySubmitting}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap border border-emerald-400/30"
              >
                <Zap className="w-3 h-3" />
                <span>{categorySubmitting ? "Loading..." : "⚡ Auto-Load"}</span>
              </button>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleCreateCategory} className="mt-3 flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter new category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 p-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={categorySubmitting || !newCategoryName.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{categorySubmitting ? "Adding..." : "Add"}</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[320px]">
              <div className="text-[11px] font-bold uppercase text-neutral-500 mb-1 px-1">
                Active Categories ({categories.length})
              </div>

              {categories.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 border border-neutral-200 rounded-2xl bg-white">
                  <Tag className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-neutral-600 text-xs">No categories created yet</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Click "⚡ Auto-Load" above or type a name to add your first category.
                  </p>
                </div>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-white border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/20 rounded-xl flex items-center justify-between gap-2 transition-all"
                  >
                    {editingCategoryId === c.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 p-1.5 bg-white border border-emerald-600 rounded-lg text-xs font-bold"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRenameCategory(c.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                          className="px-2 py-1 bg-neutral-200 text-neutral-700 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-950 text-xs">{c.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                            {c._count?.products || 0} items
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(c.id);
                              setEditingCategoryName(c.name);
                            }}
                            title="Rename Category"
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            title="Delete Category"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
