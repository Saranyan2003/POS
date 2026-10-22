"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket2GrowLogo } from "@/components/brand/Ticket2GrowLogo";
import {
  Store,
  Lock,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Zap,
  ShoppingBag,
  Utensils,
  Croissant,
  Activity,
  Shirt,
  Smartphone,
  Truck,
  Scissors,
  Check,
  Copy,
  Building2,
  MapPin,
  LogIn,
  Layers,
  Sparkles,
  UserCheck,
  User,
} from "lucide-react";

interface DemoIndustry {
  id: string;
  industry: string;
  businessName: string;
  badge: string;
  iconName: string;
  category: "retail" | "food" | "health" | "lifestyle" | "tech" | "wholesale";
  branches: string[];
  owner: {
    loginId: string;
    name: string;
    role: string;
    password: string;
    destination: string;
  };
  employee: {
    loginId: string;
    name: string;
    role: string;
    password: string;
    destination: string;
  };
}

const DEMO_INDUSTRIES: DemoIndustry[] = [
  {
    id: "grocery_retail",
    industry: "Grocery & Retail",
    businessName: "Lanka Fresh Supermarket",
    badge: "Supermarket Mode",
    iconName: "ShoppingBag",
    category: "retail",
    branches: ["Main Supermarket - Colombo 03", "Kandy City Branch"],
    owner: {
      loginId: "OWN-GROCERY",
      name: "Sunil Perera",
      role: "Business Owner",
      password: "Demo1234!",
      destination: "Dashboard & Full Access",
    },
    employee: {
      loginId: "EMP-GROCERY",
      name: "Kasun Jayasuriya",
      role: "Store Cashier",
      password: "Demo1234!",
      destination: "Fast POS Checkout",
    },
  },
  {
    id: "restaurant_cafe",
    industry: "Restaurant & Cafe",
    businessName: "Kottu & Cafe House",
    badge: "Kitchen POS Mode",
    iconName: "Utensils",
    category: "food",
    branches: ["Central Kitchen - Colombo 04", "Galle Beach Cafe"],
    owner: {
      loginId: "OWN-CAFE",
      name: "Nimal Fernando",
      role: "Restaurateur Owner",
      password: "Demo1234!",
      destination: "Dashboard & Menu Catalog",
    },
    employee: {
      loginId: "EMP-CAFE",
      name: "Dinesh Bandara",
      role: "Kitchen Cashier",
      password: "Demo1234!",
      destination: "Kitchen POS Billing",
    },
  },
  {
    id: "bakery_takeaway",
    industry: "Bakery & Takeaway",
    businessName: "Perera Bake House",
    badge: "Bakery & Pastry Mode",
    iconName: "Croissant",
    category: "food",
    branches: ["Main Bakery - Dehiwala", "Nugegoda Outlet"],
    owner: {
      loginId: "OWN-BAKERY",
      name: "Chamal Perera",
      role: "Head Baker Owner",
      password: "Demo1234!",
      destination: "Dashboard & Batch Stocks",
    },
    employee: {
      loginId: "EMP-BAKERY",
      name: "Ruwan Silva",
      role: "Counter Cashier",
      password: "Demo1234!",
      destination: "Counter POS Terminal",
    },
  },
  {
    id: "pharmacy",
    industry: "Pharmacy",
    businessName: "MediCare Wellness Pharmacy",
    badge: "Healthcare & OTC Mode",
    iconName: "Activity",
    category: "health",
    branches: ["Dispensary - Maharagama", "Negombo Town Branch"],
    owner: {
      loginId: "OWN-PHARM",
      name: "Dr. Anura Senanayake",
      role: "Chief Pharmacist Owner",
      password: "Demo1234!",
      destination: "Dashboard & Dispensary Stock",
    },
    employee: {
      loginId: "EMP-PHARM",
      name: "Sanduni Wickramasinghe",
      role: "Dispensary Staff",
      password: "Demo1234!",
      destination: "Dispensary POS Terminal",
    },
  },
  {
    id: "clothing_store",
    industry: "Clothing Store",
    businessName: "City Style Boutique",
    badge: "Apparel & Fashion Mode",
    iconName: "Shirt",
    category: "lifestyle",
    branches: ["Flagship Boutique - Colombo 07", "KCC Branch"],
    owner: {
      loginId: "OWN-FASHION",
      name: "Malini Wijesinghe",
      role: "Boutique Owner",
      password: "Demo1234!",
      destination: "Dashboard & Boutique Outfits",
    },
    employee: {
      loginId: "EMP-FASHION",
      name: "Praveen Rathnayake",
      role: "Showroom Cashier",
      password: "Demo1234!",
      destination: "Boutique POS Checkout",
    },
  },
  {
    id: "electronics_mobile",
    industry: "Electronics & Mobile",
    businessName: "iTech Mobile & Gadgets",
    badge: "Tech & Devices Mode",
    iconName: "Smartphone",
    category: "tech",
    branches: ["Main Store - Liberty Plaza", "Majestic City Branch"],
    owner: {
      loginId: "OWN-TECH",
      name: "Sahan Gunasekara",
      role: "Tech Store Owner",
      password: "Demo1234!",
      destination: "Dashboard & IMEI Catalog",
    },
    employee: {
      loginId: "EMP-TECH",
      name: "Nuwan Kumara",
      role: "Tech Assistant / POS",
      password: "Demo1234!",
      destination: "Tech POS Terminal",
    },
  },
  {
    id: "wholesale",
    industry: "Wholesale",
    businessName: "Lanka Wholesale Hardware",
    badge: "Bulk Hardware Mode",
    iconName: "Truck",
    category: "wholesale",
    branches: ["Pettah Wholesale Yard", "Wattala Storage Depot"],
    owner: {
      loginId: "OWN-WHOLESALE",
      name: "Ranjith Alwis",
      role: "Managing Director",
      password: "Demo1234!",
      destination: "Dashboard & Bulk Inventory",
    },
    employee: {
      loginId: "EMP-WHOLESALE",
      name: "Kavinda Thilakarathne",
      role: "Dispatch Clerk",
      password: "Demo1234!",
      destination: "Bulk Invoicing POS",
    },
  },
  {
    id: "salon_barber",
    industry: "Salon & Barber",
    businessName: "Crown & Blade Luxury Salon",
    badge: "Salon & Spa Mode",
    iconName: "Scissors",
    category: "lifestyle",
    branches: ["Salon Main - Bambalapitiya", "Rajagiriya Spa Branch"],
    owner: {
      loginId: "OWN-SALON",
      name: "Ayesha De Silva",
      role: "Salon Director Owner",
      password: "Demo1234!",
      destination: "Dashboard & Services Menu",
    },
    employee: {
      loginId: "EMP-SALON",
      name: "Roshan Mendis",
      role: "Stylist / Front Desk",
      password: "Demo1234!",
      destination: "Salon Front Desk POS",
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemoLoading, setActiveDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instant" | "manual">("instant");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError("Please enter your Login ID and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setError("Network or server connection issue. Please try again.");
      setLoading(false);
    }
  };

  const handle1ClickDemoLogin = async (targetLoginId: string) => {
    setActiveDemoLoading(targetLoginId);
    setError("");

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: targetLoginId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in to demo account.");
        setActiveDemoLoading(null);
        return;
      }

      // Success -> Redirect instantly
      router.push(data.redirectTo || "/dashboard");
    } catch {
      setError("Failed to connect to authentication service.");
      setActiveDemoLoading(null);
    }
  };

  const fillManualCreds = (demoId: string, demoPass: string) => {
    setLoginId(demoId);
    setPassword(demoPass);
    setError("");
    setActiveTab("manual");
    setCopiedId(demoId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderIndustryIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-neutral-900" };
    switch (iconName) {
      case "ShoppingBag":
        return <ShoppingBag {...props} />;
      case "Utensils":
        return <Utensils {...props} />;
      case "Croissant":
        return <Croissant {...props} />;
      case "Activity":
        return <Activity {...props} />;
      case "Shirt":
        return <Shirt {...props} />;
      case "Smartphone":
        return <Smartphone {...props} />;
      case "Truck":
        return <Truck {...props} />;
      case "Scissors":
        return <Scissors {...props} />;
      default:
        return <Store {...props} />;
    }
  };

  const filteredIndustries = DEMO_INDUSTRIES.filter((ind) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "retail") return ind.category === "retail" || ind.category === "wholesale";
    if (categoryFilter === "food") return ind.category === "food";
    if (categoryFilter === "health") return ind.category === "health" || ind.category === "lifestyle";
    if (categoryFilter === "tech") return ind.category === "tech";
    return true;
  });

  return (
    <div className="min-h-screen bg-marble-luxury text-neutral-900 flex flex-col justify-start py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-emerald-600 selection:text-white">
      {/* Ambient emerald glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-emerald-aurora pointer-events-none" />

      {/* Top Brand Header */}
      <div className="max-w-6xl w-full mx-auto text-center z-10 mb-6 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <Ticket2GrowLogo size="lg" variant="dark" showTagline={true} />
        </Link>

        {/* Global Error Banner if any */}
        {error && (
          <div className="mt-4 max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-900 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto z-10">
        {/* Navigation Tabs between Instant Sandbox & Manual Login */}
        <div className="flex items-center justify-between border-b border-emerald-950/10 pb-3 mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-200/60">
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "instant"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25"
                  : "text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/60"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>⚡ Instant 1-Click QA Access (8 Industries)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25"
                  : "text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/60"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Manual Credential Login</span>
            </button>
          </div>

          {/* Super Admin Quick Launch Capsule */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handle1ClickDemoLogin("ADMIN-0001")}
              disabled={!!activeDemoLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-emerald-950 text-white text-xs font-bold border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md shadow-emerald-950/20 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {activeDemoLoading === "ADMIN-0001" ? "Signing In..." : "1-Click Super Admin"}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">ADMIN-0001</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 1-CLICK INSTANT INDUSTRY DEMO ACCOUNTS */}
        {activeTab === "instant" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Layers className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] tracking-wider">Industry Filter:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", label: "All Industries (8)" },
                  { id: "retail", label: "Retail & Wholesale" },
                  { id: "food", label: "Restaurant & Bakery" },
                  { id: "health", label: "Pharmacy & Salon" },
                  { id: "tech", label: "Electronics & Mobile" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setCategoryFilter(pill.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      categoryFilter === pill.id
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white text-neutral-700 hover:bg-emerald-50 border border-emerald-950/15"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredIndustries.map((ind) => {
                const isOwnerLoading = activeDemoLoading === ind.owner.loginId;
                const isEmpLoading = activeDemoLoading === ind.employee.loginId;

                return (
                  <div
                    key={ind.id}
                    className="bg-white border border-emerald-950/15 hover:border-emerald-500 rounded-2xl p-4 shadow-xs hover:shadow-lg hover:shadow-emerald-900/10 transition-all flex flex-col justify-between group relative card-interactive"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {renderIndustryIcon(ind.iconName)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ind.badge}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-neutral-950 tracking-tight line-clamp-1 group-hover:text-emerald-900">
                        {ind.businessName}
                      </h3>
                      <p className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{ind.branches[0]}</span>
                      </p>
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-emerald-100 space-y-2">
                      {/* Owner 1-Click */}
                      <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-200/60 hover:border-emerald-400 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                            <span className="text-xs font-black text-emerald-950">
                              Business Owner
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            {ind.owner.loginId}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handle1ClickDemoLogin(ind.owner.loginId)}
                            disabled={!!activeDemoLoading}
                            className="flex-1 py-1.5 px-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-98"
                          >
                            {isOwnerLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                                <span>1-Click Owner</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            title="Auto-fill into manual login"
                            onClick={() => fillManualCreds(ind.owner.loginId, ind.owner.password)}
                            className="p-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 transition-all cursor-pointer"
                          >
                            {copiedId === ind.owner.loginId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Employee 1-Click */}
                      <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/70 hover:border-neutral-300 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-neutral-700" />
                            <span className="text-xs font-bold text-neutral-800">
                              Staff / Cashier
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-500">
                            {ind.employee.loginId}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handle1ClickDemoLogin(ind.employee.loginId)}
                            disabled={!!activeDemoLoading}
                            className="flex-1 py-1.5 px-2.5 bg-neutral-950 hover:bg-black text-white border border-emerald-500/30 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98 shadow-xs"
                          >
                            {isEmpLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Store className="w-3 h-3 text-emerald-400" />
                                <span>1-Click POS</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            title="Auto-fill into manual login"
                            onClick={() => fillManualCreds(ind.employee.loginId, ind.employee.password)}
                            className="p-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-all cursor-pointer"
                          >
                            {copiedId === ind.employee.loginId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helpful Testing Tip */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-950/15 flex items-center justify-between gap-4 flex-wrap text-xs text-neutral-600 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Tip for QA Testers:</strong> Every account is pre-populated with real products, live stock counts, and branch isolation. All accounts use password <code className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">Demo1234!</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manual Login Mode</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL LOGIN FORM */}
        {activeTab === "manual" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-emerald-600 py-8 px-6 shadow-2xl shadow-emerald-900/10 rounded-3xl sm:px-10 relative">
              <h2 className="text-xl font-black tracking-tight text-neutral-950 mb-1">
                Sign In With Credentials
              </h2>
              <p className="text-xs text-neutral-500 mb-6">
                Enter your system-issued Login ID and password to access your store.
              </p>

              <form onSubmit={handleManualLogin} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
                    Unique Login ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. OWN-GROCERY, EMP-GROCERY"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-emerald-600 rounded-xl text-neutral-950 placeholder-neutral-400 text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all uppercase shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-emerald-600 rounded-xl text-neutral-950 placeholder-neutral-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black rounded-xl text-sm shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:scale-98 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Switch back to Instant Sandbox */}
              <div className="mt-6 pt-5 border-t border-emerald-100 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("instant")}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Switch to Fast 1-Click Testing Sandboxes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="max-w-6xl w-full mx-auto text-center mt-12 text-xs text-neutral-400">
        <p>© 2026 Ticket2Grow Cloud SaaS • Designed & Engineered for High-Growth Modern Enterprises</p>
      </div>
    </div>
  );
}
