"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  User,
  X,
  AlertCircle,
  Printer,
  Ban,
  Check,
  Zap,
  Flame,
} from "lucide-react";
import { formatLKR, calculateOrderTotals } from "@/lib/currency";
import { ThermalReceipt } from "@/components/receipts/ThermalReceipt";
import { safeFetchJson } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  isServiceProduct,
  isMadeToOrderProduct,
  isServiceUnit,
  isMadeToOrderUnit,
} from "@/lib/business-profiles";

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number;
  unit: string;
  stock: number;
}

export default function POSTerminalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [heldSales, setHeldSales] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  // Status banners & feedback
  const [stockNotice, setStockNotice] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Completed Receipt state
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);
  const [showHeldModal, setShowHeldModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 200);

  // Fetch only products on search / category filter change (high speed, no redundant static fetches)
  const refreshProducts = async (query = debouncedSearch, catId = selectedCategory) => {
    try {
      const prodRes = await safeFetchJson(
        `/api/products?search=${encodeURIComponent(query)}&categoryId=${catId}`
      );
      if (prodRes?.products) {
        setProducts(prodRes.products);
      }
    } catch (e) {
      console.error("Error refreshing products:", e);
    }
  };

  // Fetch only held sales
  const refreshHeldSales = async () => {
    try {
      const heldRes = await safeFetchJson("/api/pos/held-sales");
      if (heldRes?.heldSales) setHeldSales(heldRes.heldSales);
    } catch (e) {
      console.error("Error refreshing held sales:", e);
    }
  };

  // Initial load: Fetch categories, customers, held sales, auth, and products once on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [prodRes, catRes, custRes, heldRes, meRes] = await Promise.all([
          safeFetchJson("/api/products"),
          safeFetchJson("/api/categories"),
          safeFetchJson("/api/customers"),
          safeFetchJson("/api/pos/held-sales"),
          safeFetchJson("/api/auth/me"),
        ]);

        if (!isMounted) return;
        if (prodRes?.products) setProducts(prodRes.products);
        if (catRes?.categories) setCategories(catRes.categories);
        if (custRes?.customers) setCustomers(custRes.customers);
        if (heldRes?.heldSales) setHeldSales(heldRes.heldSales);
        if (meRes?.user) {
          setCurrentUser(meRes.user);
          if (meRes.user.business) setBusinessInfo(meRes.user.business);
        }
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

  // Filter products when search or category changes (debounced by 200ms)
  useEffect(() => {
    refreshProducts(debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory]);

  // F2 Shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Universal Smart Search + Barcode Enter
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;

    // Check exact barcode or SKU match
    const matched = products.find(
      (p) =>
        p.barcode?.toLowerCase() === query.toLowerCase() ||
        p.sku?.toLowerCase() === query.toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setSearch("");
    } else if (products.length === 1) {
      // If single item matched in search list, add it on Enter
      addToCart(products[0]);
      setSearch("");
    } else {
      // Direct instant query for barcode scan or Enter without waiting for debounce
      const res = await safeFetchJson(`/api/products?search=${encodeURIComponent(query)}`);
      if (res?.products && res.products.length > 0) {
        const exact =
          res.products.find(
            (p: any) =>
              p.barcode?.toLowerCase() === query.toLowerCase() ||
              p.sku?.toLowerCase() === query.toLowerCase()
          ) || res.products[0];
        addToCart(exact);
        setSearch("");
      }
    }
  };

  // Add to cart with strict stock validation (Services & fresh prep are on-demand)
  const addToCart = (product: any) => {
    const isService = isServiceProduct(product) || isServiceUnit(product.unit);
    const isMadeToOrder = isMadeToOrderProduct(product) || isMadeToOrderUnit(product.unit);
    const availableStock = product.currentStock ?? 0;
    const isUnlimited = isService || isMadeToOrder || availableStock >= 9000;

    if (!isUnlimited && availableStock <= 0) {
      setStockNotice(`"${product.name}" is out of stock (0 available).`);
      setTimeout(() => setStockNotice(""), 3500);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (!isUnlimited && existing.quantity >= availableStock) {
          setStockNotice(`Maximum stock (${availableStock} ${product.unit || "pcs"}) already in cart.`);
          setTimeout(() => setStockNotice(""), 3500);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.discountPrice || product.sellingPrice,
          costPrice: product.costPrice || 0,
          quantity: 1,
          discount: 0,
          unit: product.unit || "pcs",
          stock: isUnlimited ? 9999 : availableStock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const isUnlimited = item.stock >= 9000;
            if (delta > 0 && !isUnlimited && item.quantity >= item.stock) {
              setStockNotice(`Maximum stock reached (${item.stock} ${item.unit}).`);
              setTimeout(() => setStockNotice(""), 3500);
              return item;
            }
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setDirectQuantity = (productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const isUnlimited = item.stock >= 9000;
          let validQty = isNaN(qty) || qty < 1 ? 1 : Math.floor(qty);
          if (!isUnlimited && validQty > item.stock) {
            validQty = Math.max(1, item.stock);
            setStockNotice(`Quantity capped at maximum stock (${item.stock} ${item.unit}).`);
            setTimeout(() => setStockNotice(""), 3500);
          }
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setOrderDiscount(0);
    setDiscountPercent(null);
    setStockNotice("");
    setCheckoutError("");
  };

  // Subtotal & Discount calculations
  const rawSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const effectiveDiscount = useMemo(() => {
    if (discountPercent !== null) {
      return Math.round((rawSubtotal * discountPercent) / 100);
    }
    return Math.min(rawSubtotal, Math.max(0, orderDiscount));
  }, [rawSubtotal, discountPercent, orderDiscount]);

  const totals = calculateOrderTotals(
    cart.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      costPrice: i.costPrice,
    })),
    effectiveDiscount,
    0
  );

  // 1-Click Fast Checkout at Exact Price
  const handleCompleteSale = async () => {
    if (cart.length === 0 || processing) return;
    setProcessing(true);
    setCheckoutError("");

    const exactTotal = totals.grandTotal;

    const payload = {
      items: cart.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
      customerId: selectedCustomer?.id || null,
      orderDiscount: effectiveDiscount,
      taxRatePercent: 0,
      payments: [
        {
          method: "CASH",
          amount: exactTotal,
          tenderedAmount: exactTotal,
          changeAmount: 0,
        },
      ],
    };

    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutError(data.error || "Checkout failed");
        setProcessing(false);
        return;
      }

      // Generate Receipt Preview Immediately
      setCompletedReceipt({
        business: {
          name: businessInfo?.name || "Ticket2Grow Merchant",
          phone: businessInfo?.phone || "",
          address: businessInfo?.address || "",
        },
        invoiceNumber: data.sale.invoiceNumber,
        date: new Date(),
        cashierName: currentUser?.name || "Active Cashier",
        customer: selectedCustomer,
        items: cart.map((c) => ({
          name: c.name,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          discount: c.discount,
          total: c.quantity * c.unitPrice - (c.discount || 0),
        })),
        subtotal: totals.subtotal,
        discount: totals.totalDiscount,
        tax: totals.taxAmount,
        total: exactTotal,
        paymentMethod: "CASH",
        tenderedAmount: exactTotal,
        changeAmount: 0,
      });

      clearCart();
      setProcessing(false);
      refreshProducts();
      refreshHeldSales();
    } catch (e) {
      setCheckoutError("Network connection error. Please try again.");
      setProcessing(false);
    }
  };

  // Hold / Resume
  const handleHoldCart = async () => {
    if (cart.length === 0) return;
    try {
      await fetch("/api/pos/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerId: selectedCustomer?.id,
          holdNote: `Held order at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        }),
      });
      clearCart();
      refreshHeldSales();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResumeSale = async (sale: any) => {
    if (cart.length > 0) {
      if (!confirm("Overwrite current cart with this held sale?")) return;
    }
    try {
      const res = await fetch(`/api/pos/held-sales?id=${sale.id}`);
      const data = await res.json();
      if (data?.sale) {
        setCart(
          data.sale.items.map((i: any) => ({
            productId: i.productId,
            name: i.productName || i.product?.name,
            unitPrice: i.unitPrice,
            costPrice: i.unitCost || 0,
            quantity: i.quantity,
            discount: i.discount || 0,
            unit: i.product?.unit || "pcs",
            stock: i.product?.inventory?.[0]?.quantity ?? 0,
          }))
        );
        setSelectedCustomer(data.sale.customer || null);
        setShowHeldModal(false);
        refreshProducts();
        refreshHeldSales();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Filter only categories that have items to avoid visual clutter
  const activeCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const populated = categories.filter((c) => (c._count?.products || 0) > 0);
    return populated.length > 0 ? populated : categories;
  }, [categories]);

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row gap-4 max-w-[1700px] mx-auto text-neutral-900">
      {/* LEFT SECTION: Clean Product Catalog (60%) */}
      <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-md border border-emerald-950/15 rounded-3xl p-4 sm:p-5 overflow-hidden shadow-xs">
        {/* Single Universal Smart Search Bar */}
        <div className="mb-3.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, items, or scan barcode... (Press F2)"
              className="w-full pl-11 pr-10 py-3.5 bg-emerald-50/40 hover:bg-white focus:bg-white border-2 border-emerald-950/15 focus:border-emerald-600 rounded-2xl text-neutral-950 text-sm placeholder-emerald-800/40 focus:outline-none transition-all shadow-2xs font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-emerald-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Clean Category Filter Tabs */}
        {activeCategories && activeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25 ring-2 ring-emerald-500"
                  : "bg-emerald-50/70 text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/80 border border-emerald-200/80"
              }`}
            >
              All Items ({products.length})
            </button>
            {activeCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id === selectedCategory ? "" : c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25 ring-2 ring-emerald-500"
                    : "bg-emerald-50/70 text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/80 border border-emerald-200/80"
                }`}
              >
                <span>{c.name}</span>
                {c._count?.products !== undefined && c._count.products > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      selectedCategory === c.id ? "bg-emerald-950 text-emerald-300" : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {c._count.products}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Instant Stock Warning Notification */}
        {stockNotice && (
          <div className="mb-3 p-3 bg-neutral-950 border border-emerald-500/40 text-white text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-lg animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{stockNotice}</span>
            </div>
            <button onClick={() => setStockNotice("")} className="text-neutral-400 hover:text-white p-1 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
              <ShoppingBag className="w-12 h-12 text-emerald-300 stroke-1 mb-3" />
              <p className="font-bold text-neutral-800 text-sm">No items found</p>
              <p className="text-xs text-neutral-400 mt-1">Try another search or select a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((p) => {
                const isService = isServiceProduct(p) || isServiceUnit(p.unit);
                const isMadeToOrder = isMadeToOrderProduct(p) || isMadeToOrderUnit(p.unit);
                const stockVal = p.currentStock ?? 0;
                const isUnlimited = isService || isMadeToOrder || stockVal >= 9000;
                const isOutOfStock = !isUnlimited && stockVal <= 0;

                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between group relative select-none card-interactive ${
                      isOutOfStock
                        ? "bg-neutral-50 border border-neutral-200 opacity-60 cursor-not-allowed"
                        : "bg-white border border-emerald-950/15 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer active:scale-97"
                    }`}
                  >
                    <div>
                      {/* Category / Stock Pill */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider truncate max-w-[90px]">
                          {p.category?.name || "General"}
                        </span>

                        {isService ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1 uppercase">
                            <Zap className="w-2.5 h-2.5 text-emerald-600" />
                            Service
                          </span>
                        ) : isMadeToOrder ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1 uppercase">
                            <Flame className="w-2.5 h-2.5 text-emerald-600" />
                            Fresh Prep
                          </span>
                        ) : isOutOfStock ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-200 text-neutral-800 flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5 text-neutral-600" />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                            {stockVal} {p.unit}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 className="text-sm font-black text-neutral-950 group-hover:text-emerald-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    {/* Price & Tap Indicator */}
                    <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-emerald-700 font-mono">
                          {formatLKR(p.discountPrice || p.sellingPrice)}
                        </span>
                        {p.discountPrice && (
                          <span className="text-[10px] text-neutral-400 line-through block font-mono">
                            {formatLKR(p.sellingPrice)}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                          isOutOfStock
                            ? "bg-neutral-200 text-neutral-400"
                            : "bg-emerald-50 group-hover:bg-emerald-600 text-emerald-800 group-hover:text-white"
                        }`}
                      >
                        {isOutOfStock ? <Ban className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Simple, Fast Billing Cart (40%) */}
      <div className="w-full lg:w-[440px] flex flex-col bg-white/95 backdrop-blur-md border border-emerald-950/15 rounded-3xl p-5 overflow-hidden shrink-0 shadow-sm">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-emerald-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-neutral-950 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-black text-sm text-neutral-950">Active Cart</h3>
              <p className="text-[10px] text-emerald-700 font-bold">{totalItemCount} item{totalItemCount === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {heldSales.length > 0 && (
              <button
                onClick={() => setShowHeldModal(true)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer border border-emerald-200"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Held ({heldSales.length})</span>
              </button>
            )}
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0}
              title="Hold Order"
              className="p-2 text-neutral-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              title="Clear Cart"
              className="p-2 text-neutral-600 hover:text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Selector (Optional) */}
        <div className="py-2.5 border-b border-emerald-950/10">
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" />
            <select
              value={selectedCustomer?.id || ""}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(cust || null);
              }}
              className="w-full pl-8 pr-3 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer font-bold"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600 border border-emerald-100">
                <ShoppingBag className="w-6 h-6 stroke-1" />
              </div>
              <p className="font-bold text-neutral-800 text-sm">Cart is Empty</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                Tap any product on the screen to add it to the bill.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const isUnlimited = item.stock >= 9000;
              const isAtMax = !isUnlimited && item.quantity >= item.stock;

              return (
                <div
                  key={item.productId}
                  className="p-3 rounded-2xl bg-marble-subtle border border-emerald-950/10 flex items-center justify-between gap-2.5 transition-all"
                >
                  <div className="flex-1 overflow-hidden">
                    <h5 className="text-xs font-black text-neutral-950 truncate">{item.name}</h5>
                    <p className="text-[11px] text-emerald-700 font-mono font-bold mt-0.5">
                      {formatLKR(item.unitPrice)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={isUnlimited ? 99999 : item.stock}
                      value={item.quantity}
                      onChange={(e) => setDirectQuantity(item.productId, parseInt(e.target.value))}
                      className="w-10 text-center text-xs font-black text-neutral-950 font-mono bg-transparent focus:outline-none rounded p-0.5"
                    />

                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={isAtMax}
                      className="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 flex items-center justify-center cursor-pointer transition-colors active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Quick Remove */}
                  <div className="text-right shrink-0 min-w-[75px]">
                    <p className="text-xs font-black text-neutral-950 font-mono">
                      {formatLKR(item.quantity * item.unitPrice - (item.discount || 0))}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[10px] text-neutral-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total Summary & 1-Click Checkout */}
        <div className="pt-3 border-t border-emerald-950/10 space-y-2.5 text-xs">
          {/* Quick Discount selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-neutral-500">Discount:</span>
            <div className="flex items-center gap-1">
              {[
                { label: "0%", pct: null },
                { label: "5%", pct: 5 },
                { label: "10%", pct: 10 },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    if (d.pct === null) {
                      setDiscountPercent(null);
                      setOrderDiscount(0);
                    } else {
                      setDiscountPercent(d.pct);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    discountPercent === d.pct && (d.pct !== null || orderDiscount === 0)
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 border-emerald-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtotal & Discount row */}
          {effectiveDiscount > 0 && (
            <div className="flex justify-between text-neutral-500 font-medium">
              <span>Discount Amount</span>
              <span className="font-bold text-emerald-700 font-mono">-{formatLKR(effectiveDiscount)}</span>
            </div>
          )}

          {/* Large Clean Net Total Due */}
          <div className="flex justify-between items-baseline pt-2 border-t border-emerald-950/10">
            <div>
              <span className="text-xs uppercase font-black text-emerald-800 tracking-wider block">Total Due</span>
              <span className="text-[10px] text-neutral-400 font-bold">Exact Price</span>
            </div>
            <span className="text-3xl font-black text-emerald-700 font-mono tracking-tight">
              {formatLKR(totals.grandTotal)}
            </span>
          </div>

          {/* Error Notice */}
          {checkoutError && (
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center justify-between gap-2 border border-red-500/40">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{checkoutError}</span>
              </div>
              <button onClick={() => setCheckoutError("")} className="text-neutral-400 hover:text-white p-0.5 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Big Tactile 1-Click Pay & Print Bill Button */}
          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || processing}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer disabled:opacity-30 disabled:pointer-events-none mt-1"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Pay & Print Bill ({formatLKR(totals.grandTotal)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* HELD ORDERS DRAWER */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 text-neutral-900">
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-100">
              <h3 className="text-base font-black text-neutral-950">Held Orders ({heldSales.length})</h3>
              <button onClick={() => setShowHeldModal(false)} className="text-neutral-400 hover:text-emerald-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-72 overflow-y-auto space-y-2">
              {heldSales.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-neutral-950 font-mono">{s.invoiceNumber}</span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {s.holdNote || "Held"} • <strong className="text-emerald-800">{formatLKR(s.total)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleResumeSale(s)}
                    className="px-3.5 py-1.5 btn-emerald-solid text-white text-xs font-black rounded-xl cursor-pointer"
                  >
                    Resume
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHeldModal(false)}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED THERMAL RECEIPT POPUP */}
      {completedReceipt && (
        <ThermalReceipt
          {...completedReceipt}
          onClose={() => setCompletedReceipt(null)}
        />
      )}
    </div>
  );
}
