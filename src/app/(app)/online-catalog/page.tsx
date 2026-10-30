"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Code,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import { safeFetchJson } from "@/lib/utils";

export default function OnlineCatalogApiPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Playground state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(6);
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Response state
  const [apiResult, setApiResult] = useState<any>(null);
  const [fetchingApi, setFetchingApi] = useState(false);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  // Copy states
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedStorefront, setCopiedStorefront] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<"js" | "react" | "curl" | "iframe">("js");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await safeFetchJson("/api/auth/me");
        setSession(data);
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const businessCode = session?.business?.code || session?.user?.businessCode || "T2G-BAKERY";
  const businessName = session?.business?.name || session?.user?.businessName || "My Business";

  // Build API URL
  const buildQueryUrl = (targetPage: number = page, targetLimit: number = limit) => {
    const params = new URLSearchParams({
      businessCode,
      page: targetPage.toString(),
      limit: targetLimit.toString(),
      sortBy,
    });
    if (search.trim()) params.set("search", search.trim());
    if (inStockOnly) params.set("inStockOnly", "true");
    return `/api/v1/catalog?${params.toString()}`;
  };

  const executeApiQuery = async (targetPage: number = page) => {
    setFetchingApi(true);
    const start = performance.now();
    try {
      const url = buildQueryUrl(targetPage, limit);
      const res = await fetch(url);
      const data = await res.json();
      const end = performance.now();
      setResponseTimeMs(Math.round(end - start));
      setApiResult(data);
      setPage(targetPage);
    } catch (err) {
      console.error("Playground query failed:", err);
    } finally {
      setFetchingApi(false);
    }
  };

  useEffect(() => {
    if (businessCode) {
      executeApiQuery(1);
    }
  }, [businessCode, limit, sortBy, inStockOnly]);

  const copyToClipboard = (text: string, type: "endpoint" | "storefront" | string) => {
    navigator.clipboard.writeText(text);
    if (type === "endpoint") {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else if (type === "storefront") {
      setCopiedStorefront(true);
      setTimeout(() => setCopiedStorefront(false), 2000);
    } else {
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const publicApiEndpoint = `${origin}/api/v1/catalog?businessCode=${businessCode}&page=1&limit=12`;
  const publicStorefrontUrl = `${origin}/catalog/${businessCode}`;

  const jsSnippet = `// Fetch POS products with pagination from another website
async function loadPosProducts(page = 1, limit = 12) {
  const url = "${origin}/api/v1/catalog?businessCode=${businessCode}&page=" + page + "&limit=" + limit;
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  const data = await response.json();

  if (data.success) {
    console.log("Total Products:", data.pagination.totalProducts);
    console.log("Current Page:", data.pagination.page, "of", data.pagination.totalPages);
    console.log("Has Next Page:", data.pagination.hasNextPage);
    
    // Render products on your website
    data.products.forEach(product => {
      console.log(product.name, product.currency, product.effectivePrice, product.inStock);
    });
  }
}`;

  const reactSnippet = `import { useState, useEffect } from "react";

export function ExternalStoreCatalog() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(true);

  const fetchPage = async (pageNumber = 1) => {
    setLoading(true);
    const res = await fetch(\`${origin}/api/v1/catalog?businessCode=${businessCode}&page=\${pageNumber}&limit=12\`);
    const data = await res.json();
    if (data.success) {
      setProducts(data.products);
      setPagination(data.pagination);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPage(1); }, []);

  return (
    <div>
      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p>{p.currency} {p.effectivePrice}</p>
            <span>{p.inStock ? "In Stock" : "Out of Stock"}</span>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={!pagination.hasPrevPage} onClick={() => fetchPage(pagination.page - 1)}>Prev</button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button disabled={!pagination.hasNextPage} onClick={() => fetchPage(pagination.page + 1)}>Next</button>
      </div>
    </div>
  );
}`;

  const curlSnippet = `curl -X GET "${origin}/api/v1/catalog?businessCode=${businessCode}&page=1&limit=12" \\
  -H "Accept: application/json"`;

  const iframeSnippet = `<!-- Embed live POS catalog on any external website -->
<iframe
  src="${publicStorefrontUrl}"
  width="100%"
  height="700px"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #e2e8e4;"
></iframe>`;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest">
            Loading Catalog API Settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              REST API & Online Catalog
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              CORS Enabled
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            External Website Sync & Paginated API
          </h1>
          <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
            Allow other websites, online storefronts, mobile apps, or partner portals to display your
            live POS products with real-time stock and clean pagination.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={publicStorefrontUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <span>Open Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Integration URLs Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: REST API Endpoint */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 text-base">Public Paginated REST API</h3>
                  <p className="text-xs text-neutral-500">JSON endpoint for another website or frontend</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                GET
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Accepts query parameters: <code className="text-emerald-700 font-mono font-semibold">page</code>,{" "}
              <code className="text-emerald-700 font-mono font-semibold">limit</code>,{" "}
              <code className="text-emerald-700 font-mono font-semibold">search</code>,{" "}
              <code className="text-emerald-700 font-mono font-semibold">category</code>, and{" "}
              <code className="text-emerald-700 font-mono font-semibold">sortBy</code>.
            </p>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{publicApiEndpoint}</span>
              <button
                onClick={() => copyToClipboard(publicApiEndpoint, "endpoint")}
                className="shrink-0 text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 px-2 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs"
              >
                {copiedEndpoint ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEndpoint ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Pre-configured CORS (Access-Control-Allow-Origin: *)
            </span>
          </div>
        </div>

        {/* Card 2: Hosted Storefront */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 text-base">Hosted Online Storefront</h3>
                  <p className="text-xs text-neutral-500">Ready-made public website for your customers</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                WEBSITE
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              A responsive, dark-mode showcase showing how an external website connects to this API with
              live pagination, filters, and WhatsApp ordering.
            </p>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{publicStorefrontUrl}</span>
              <button
                onClick={() => copyToClipboard(publicStorefrontUrl, "storefront")}
                className="shrink-0 text-blue-700 hover:text-blue-800 text-xs font-bold flex items-center gap-1 px-2 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs"
              >
                {copiedStorefront ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedStorefront ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Business Code: <strong>{businessCode}</strong></span>
            <a
              href={publicStorefrontUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Visit Page</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive API Playground & Live Pagination Simulator */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-neutral-900">
                Live Pagination Playground & API Tester
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Simulate how external websites request specific pages and limits from your POS database.
            </p>
          </div>

          {responseTimeMs !== null && (
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                ⚡ {responseTimeMs}ms
              </span>
              <button
                onClick={() => executeApiQuery(page)}
                disabled={fetchingApi}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingApi ? "animate-spin" : ""}`} />
                <span>Re-query</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-6 border-b border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Search Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Product name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeApiQuery(1)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Limit (Items per page) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Items Per Page (<code className="font-mono text-emerald-700">limit</code>)
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
              }}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono cursor-pointer"
            >
              <option value={2}>limit = 2</option>
              <option value={4}>limit = 4</option>
              <option value={6}>limit = 6</option>
              <option value={12}>limit = 12</option>
              <option value={24}>limit = 24</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Sort Order (<code className="font-mono text-emerald-700">sortBy</code>)
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
            >
              <option value="name_asc">Name (A - Z)</option>
              <option value="name_desc">Name (Z - A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* In Stock Only */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                inStockOnly
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>In-Stock Only Filter</span>
            </button>
          </div>
        </div>

        {/* Live Pagination Output Stats */}
        {apiResult?.pagination && (
          <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-emerald-950">
            <div className="flex items-center gap-4">
              <span>
                Total Products: <strong>{apiResult.pagination.totalProducts}</strong>
              </span>
              <span>•</span>
              <span>
                Total Pages: <strong>{apiResult.pagination.totalPages}</strong>
              </span>
              <span>•</span>
              <span>
                Current Page: <strong>{apiResult.pagination.page}</strong>
              </span>
              <span>•</span>
              <span>
                Items on this page: <strong>{apiResult.products?.length || 0}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${apiResult.pagination.hasPrevPage ? "bg-emerald-200 text-emerald-900" : "bg-neutral-200 text-neutral-500"}`}>
                hasPrevPage: {String(apiResult.pagination.hasPrevPage)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${apiResult.pagination.hasNextPage ? "bg-emerald-200 text-emerald-900" : "bg-neutral-200 text-neutral-500"}`}>
                hasNextPage: {String(apiResult.pagination.hasNextPage)}
              </span>
            </div>
          </div>
        )}

        {/* Products Results Table/Grid */}
        <div className="p-6">
          {fetchingApi ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs text-neutral-500 font-mono">Querying database...</span>
            </div>
          ) : !apiResult?.products || apiResult.products.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No products found matching the query.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-700 font-bold border-y border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">SKU / Barcode</th>
                      <th className="py-2.5 px-3 text-right">Price (LKR)</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {apiResult.products.map((p: any) => (
                      <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-neutral-900">{p.name}</td>
                        <td className="py-3 px-3">
                          {p.category ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {p.category.name}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500">
                          {p.sku || p.barcode || "-"}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                          {p.effectivePrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-neutral-700">
                          {p.stockQuantity !== null ? `${p.stockQuantity} ${p.unit}` : "Made-to-order"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {p.inStock ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                              Out of Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Playground Pagination Bar */}
              {apiResult?.pagination && (
                <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs font-mono text-neutral-500">
                    Page <strong>{page}</strong> of <strong>{apiResult.pagination.totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executeApiQuery(page - 1)}
                      disabled={!apiResult.pagination.hasPrevPage}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-neutral-700 flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Page</span>
                    </button>
                    <button
                      onClick={() => executeApiQuery(page + 1)}
                      disabled={!apiResult.pagination.hasNextPage}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-neutral-700 flex items-center gap-1 transition-all"
                    >
                      <span>Next Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Snippets for Developers & External Websites */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden text-white shadow-xl">
        <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-black text-white">How Another Website Uses This API</h2>
              <p className="text-xs text-neutral-400">Copy ready-to-run code snippets into your website</p>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveSnippetTab("js")}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                activeSnippetTab === "js" ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              JavaScript Fetch
            </button>
            <button
              onClick={() => setActiveSnippetTab("react")}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                activeSnippetTab === "react" ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              React Hook
            </button>
            <button
              onClick={() => setActiveSnippetTab("curl")}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                activeSnippetTab === "curl" ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveSnippetTab("iframe")}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                activeSnippetTab === "iframe" ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              HTML Embed
            </button>
          </div>
        </div>

        {/* Snippet Display */}
        <div className="relative p-6 bg-neutral-950 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => {
              const code =
                activeSnippetTab === "js"
                  ? jsSnippet
                  : activeSnippetTab === "react"
                  ? reactSnippet
                  : activeSnippetTab === "curl"
                  ? curlSnippet
                  : iframeSnippet;
              copyToClipboard(code, activeSnippetTab);
            }}
            className="absolute top-4 right-4 text-xs bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copiedSnippet === activeSnippetTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === activeSnippetTab ? "Copied Snippet" : "Copy Code"}</span>
          </button>

          <pre className="text-emerald-300 leading-relaxed">
            {activeSnippetTab === "js" && jsSnippet}
            {activeSnippetTab === "react" && reactSnippet}
            {activeSnippetTab === "curl" && curlSnippet}
            {activeSnippetTab === "iframe" && iframeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
