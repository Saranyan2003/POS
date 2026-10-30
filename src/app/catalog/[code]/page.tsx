"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Code,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Phone,
  Layers,
  SlidersHorizontal,
  PackageCheck,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  category: { id: string; name: string; color: string } | null;
  sellingPrice: number;
  discountPrice: number | null;
  effectivePrice: number;
  currency: string;
  unit: string;
  imageUrl: string | null;
  inStock: boolean;
  stockQuantity: number | null;
  isLowStock: boolean;
  isService: boolean;
  isMadeToOrder: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  itemsOnPage: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BusinessInfo {
  id: string;
  name: string;
  code: string;
  businessType: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  currency: string;
}

export default function PublicStorefrontCatalogPage() {
  const params = useParams();
  const businessCode = (params?.code as string) || "T2G-BAKERY";

  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    totalProducts: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    itemsOnPage: 0,
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState(true);
  const [apiDrawerOpen, setApiDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Construct current API URL
  const queryParams = new URLSearchParams({
    businessCode,
    page: currentPage.toString(),
    limit: limit.toString(),
    sortBy,
  });
  if (search.trim()) queryParams.set("search", search.trim());
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (inStockOnly) queryParams.set("inStockOnly", "true");

  const fullApiUrl = `/api/v1/catalog?${queryParams.toString()}`;

  // Fetch paginated products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(fullApiUrl, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      setRawApiResponse(JSON.stringify(data, null, 2));

      if (data.success) {
        setBusiness(data.business);
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load catalog via API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [businessCode, currentPage, limit, selectedCategory, sortBy, inStockOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const copyApiUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}${fullApiUrl}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: business?.currency || "LKR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Banner indicating this is an External Website powered by the POS API */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border-b border-emerald-500/20 px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
              External Website Storefront
            </span>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-300">
              Live POS Products sync with <strong className="text-emerald-300 font-mono">GET /api/v1/catalog</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setApiDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Inspect API Response ({products.length} items)</span>
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
            >
              <span>Back to POS Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-neutral-950 shadow-xl shadow-emerald-900/30 shrink-0">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {business?.name || "Loading Business..."}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400">
                    {business?.code || businessCode}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  {business?.businessType} • {business?.city || "Sri Lanka"}
                  {business?.address && ` • ${business.address}`}
                </p>
                {business?.phone && (
                  <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Inquiries & WhatsApp: {business.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick API Endpoint Card */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 max-w-md w-full">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-neutral-400 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  REST API Endpoint
                </span>
                <button
                  onClick={copyApiUrl}
                  className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
                >
                  {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl ? "Copied" : "Copy URL"}
                </button>
              </div>
              <div className="font-mono text-[11px] text-emerald-300 bg-neutral-900 px-2.5 py-1.5 rounded border border-neutral-800 truncate select-all">
                {fullApiUrl}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>Page: {pagination.page} / {pagination.totalPages}</span>
                <span>Total: {pagination.totalProducts} products</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search Toolbar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
              />
            </div>

            {/* Sort & Limit & InStock Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Items Per Page (Limit) */}
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs">
                <span className="text-neutral-400 font-mono">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
                >
                  <option value={3} className="bg-neutral-900 text-white">3 / page</option>
                  <option value={6} className="bg-neutral-900 text-white">6 / page</option>
                  <option value={12} className="bg-neutral-900 text-white">12 / page</option>
                  <option value={24} className="bg-neutral-900 text-white">24 / page</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white focus:outline-none cursor-pointer font-sans"
                >
                  <option value="name_asc" className="bg-neutral-900 text-white">Name: A to Z</option>
                  <option value="name_desc" className="bg-neutral-900 text-white">Name: Z to A</option>
                  <option value="price_asc" className="bg-neutral-900 text-white">Price: Low to High</option>
                  <option value="price_desc" className="bg-neutral-900 text-white">Price: High to Low</option>
                  <option value="newest" className="bg-neutral-900 text-white">Newest Additions</option>
                </select>
              </div>

              {/* In-Stock Toggle */}
              <button
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  inStockOnly
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>In-Stock Only</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === ""
                    ? "bg-emerald-500 text-neutral-950 shadow-md font-bold"
                    : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                All Categories ({pagination.totalProducts})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? "bg-emerald-500 text-neutral-950 font-bold shadow-md"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#10b981" }}
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid Section */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Fetching page {currentPage} from POS API...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Try adjusting your search terms, removing category filters, or selecting a different page.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setInStockOnly(false);
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl text-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const whatsappMessage = encodeURIComponent(
                  `Hi ${business?.name}, I saw your product "${p.name}" (LKR ${p.effectivePrice}) on your online catalog. Is it available?`
                );
                const whatsappUrl = `https://wa.me/${business?.phone?.replace(/\D/g, "") || "94704022301"}?text=${whatsappMessage}`;

                return (
                  <div
                    key={p.id}
                    className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40 relative overflow-hidden"
                  >
                    {/* Top Tag Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {p.category ? (
                          <span
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white/90 border border-white/10"
                            style={{ backgroundColor: `${p.category.color || "#059669"}33` }}
                          >
                            {p.category.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-500">General</span>
                        )}

                        {/* Stock Badge */}
                        {p.inStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
                            {p.stockQuantity !== null ? `${p.stockQuantity} ${p.unit} in stock` : "Available"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-[10px] font-mono text-rose-400 font-bold">
                            Out of stock
                          </span>
                        )}
                      </div>

                      {/* Product Title & Details */}
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {p.name}
                      </h3>

                      {p.description && (
                        <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2">
                          {p.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                        {p.sku && <span>SKU: {p.sku}</span>}
                        {p.barcode && <span>BAR: {p.barcode}</span>}
                        <span>Unit: {p.unit}</span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                          {formatLKR(p.effectivePrice)}
                        </div>
                        {p.discountPrice && p.discountPrice < p.sellingPrice && (
                          <div className="text-xs text-neutral-500 line-through font-mono">
                            {formatLKR(p.sellingPrice)}
                          </div>
                        )}
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order / Inquire</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-xs font-mono text-neutral-400 text-center sm:text-left">
                Showing <strong className="text-white">{(pagination.page - 1) * pagination.limit + 1}</strong> to{" "}
                <strong className="text-white">
                  {Math.min(pagination.page * pagination.limit, pagination.totalProducts)}
                </strong>{" "}
                of <strong className="text-emerald-400">{pagination.totalProducts}</strong> products
                <span className="text-neutral-600 mx-2">|</span>
                Page <strong className="text-white">{pagination.page}</strong> of{" "}
                <strong className="text-white">{pagination.totalPages}</strong>
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Numeric Page Buttons */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show current page, edges, and adjacent
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="text-neutral-600 px-1 font-mono">...</span>}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all ${
                            p === pagination.page
                              ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-950"
                              : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-over / Modal to Inspect Raw Paginated API JSON */}
      {apiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Paginated API Response Inspector</h3>
              </div>
              <button
                onClick={() => setApiDrawerOpen(false)}
                className="text-neutral-400 hover:text-white text-sm px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="my-4 space-y-2">
              <p className="text-xs text-neutral-400">
                This is the exact JSON returned to external websites from the Ticket2Grow POS API:
              </p>
              <div className="font-mono text-xs text-emerald-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
                <span className="truncate">{fullApiUrl}</span>
                <button
                  onClick={copyApiUrl}
                  className="text-neutral-400 hover:text-emerald-400 shrink-0 ml-2"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-neutral-900 p-4 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200">
              <pre>{rawApiResponse || "No data loaded yet."}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
