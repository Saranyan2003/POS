"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Layers,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Printer,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Clock,
  Zap,
  Boxes,
  Barcode,
  Users,
  Building,
  Check,
  ChevronDown,
} from "lucide-react";
import { Ticket2GrowLogo } from "@/components/brand/Ticket2GrowLogo";
import { getWhatsAppDirectUrl } from "@/lib/whatsapp";
import { WhatsAppLaunchModal } from "@/components/whatsapp/WhatsAppLaunchModal";

export default function LandingPage() {
  const whatsappSalesNumber = "94704022301";
  const defaultMsg =
    "Hello Ticket2Grow Team! I saw your POS SaaS and would like to learn more about setting up an account for my business.";
  const defaultWhatsAppSalesLink = getWhatsAppDirectUrl(whatsappSalesNumber, defaultMsg);

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeWhatsAppMsg, setActiveWhatsAppMsg] = useState(defaultMsg);

  const handleOpenWhatsAppModal = (e: React.MouseEvent, msg = defaultMsg) => {
    e.preventDefault();
    setActiveWhatsAppMsg(msg);
    setWhatsAppModalOpen(true);
  };

  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I create and activate an account for my business?",
      a: "To maintain top-tier service quality and prevent spam, our local Sri Lankan support team sets up your account for you via WhatsApp. Within 5 minutes, you receive your unique Business Code (e.g. T2G-48291), Manager Login ID, and initial configuration.",
    },
    {
      q: "What thermal printers and barcode scanners are supported?",
      a: "Ticket2Grow supports all standard 80mm and 58mm ESC/POS USB, Bluetooth, and Wi-Fi thermal receipt printers (including Xprinter, Epson, Citizen, Sunmi, and generic Chinese POS printers), plus standard 1D/2D USB and wireless barcode scanners.",
    },
    {
      q: "Can I manage multiple branches and track inventory transfers?",
      a: "Yes! Ticket2Grow includes built-in multi-branch management. You can assign dedicated cashiers to each branch, monitor branch-specific stock levels, record inter-branch stock transfers, and view consolidated multi-branch profit reports.",
    },
    {
      q: "Does Ticket2Grow work on phones, tablets, and computers?",
      a: "Yes! Ticket2Grow is 100% cloud-based and responsive. It works flawlessly across Windows PCs, MacBooks, iPads, Android tablets, and smartphones without needing any bulky app installations.",
    },
  ];

  return (
    <div className="min-h-screen bg-marble-luxury text-neutral-900 flex flex-col selection:bg-emerald-600 selection:text-white relative">
      {/* Ambient Top Emerald Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-aurora pointer-events-none" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-emerald-950/10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Ticket2GrowLogo size="md" variant="dark" showTagline={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-700">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#industries" className="hover:text-emerald-600 transition-colors">Industries</a>
            <a href="#demo" className="hover:text-emerald-600 transition-colors">POS Terminal</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 text-xs font-bold text-neutral-800 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition-all border border-emerald-950/15"
            >
              Sign In
            </Link>
            <a
              href={defaultWhatsAppSalesLink}
              onClick={(e) => handleOpenWhatsAppModal(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-xs font-black btn-emerald-solid rounded-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Setup</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Engineered for Sri Lankan Retail Stores & SMEs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 leading-[1.1] max-w-4xl mx-auto">
            The Fastest Cloud POS & Business SaaS in <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 bg-clip-text text-transparent">Sri Lanka</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Next-generation billing, real-time inventory ledger, Khata customer credit, multi-branch tracking, and automated thermal receipts. Onboard in 5 minutes via WhatsApp.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={defaultWhatsAppSalesLink}
              onClick={(e) => handleOpenWhatsAppModal(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/25 flex items-center justify-center gap-3 text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Start on WhatsApp (Instant Setup)</span>
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-emerald-50 text-neutral-950 font-bold rounded-2xl border-2 border-emerald-950/20 hover:border-emerald-600 flex items-center justify-center gap-2 text-sm transition-all shadow-sm active:scale-95"
            >
              <span>Merchant Sign In</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-emerald-950/10 hover:border-emerald-500/40 flex items-center gap-3 shadow-xs card-interactive">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Checkout Speed</p>
                <p className="text-sm font-black text-neutral-950">&lt; 2 Seconds</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-950/10 hover:border-emerald-500/40 flex items-center gap-3 shadow-xs card-interactive">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Thermal Printing</p>
                <p className="text-sm font-black text-neutral-950">80mm & 58mm</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-950/10 hover:border-emerald-500/40 flex items-center gap-3 shadow-xs card-interactive">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Multi-Tenant</p>
                <p className="text-sm font-black text-neutral-950">100% Isolated</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-950/10 hover:border-emerald-500/40 flex items-center gap-3 shadow-xs card-interactive">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Devices</p>
                <p className="text-sm font-black text-neutral-950">PC, Mac, Tab, Phone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POS Terminal Live Interactive Mockup Showcase */}
      <section id="demo" className="py-20 bg-gradient-to-b from-neutral-950 to-emerald-950 text-white relative overflow-hidden border-y border-emerald-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block mb-2 font-extrabold">
              Built for speed, efficiency and zero lag
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Tactile, Modern POS Terminal Experience
            </h2>
          </div>

          {/* Mock Window Terminal Frame */}
          <div className="rounded-3xl border border-emerald-500/30 bg-neutral-900/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl relative shadow-emerald-950/50">
            {/* Window header buttons */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <span className="ml-2 text-xs font-mono text-emerald-200/70">Ticket2Grow Terminal v2.4 • Active Register</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live POS Cloud Sync</span>
              </span>
            </div>

            {/* Terminal Inner Content Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product grid mock */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex gap-2 text-xs font-bold">
                  <span className="bg-emerald-500 text-neutral-950 px-3.5 py-1.5 rounded-xl font-black">All Items</span>
                  <span className="bg-neutral-800 text-neutral-300 px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:border-emerald-500/40">Beverages</span>
                  <span className="bg-neutral-800 text-neutral-300 px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:border-emerald-500/40">Bakery</span>
                  <span className="bg-neutral-800 text-neutral-300 px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:border-emerald-500/40">Snacks</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: "Ceylon Tea Special 200g", price: "Rs. 650.00", stock: "45 pcs" },
                    { name: "Fresh Milk 1L", price: "Rs. 420.00", stock: "28 pcs" },
                    { name: "Ginger Biscuits Box", price: "Rs. 320.00", stock: "60 pcs" },
                    { name: "Coconut Oil Pure 500ml", price: "Rs. 890.00", stock: "14 pcs" },
                    { name: "Red Rice 5kg Pack", price: "Rs. 1,250.00", stock: "32 pcs" },
                    { name: "Spicy Cashew Nuts 100g", price: "Rs. 580.00", stock: "19 pcs" },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 hover:border-emerald-400 transition-all flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400/80">{p.stock}</span>
                        <h4 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-300">{p.name}</h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-700 flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold text-emerald-300">{p.price}</span>
                        <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">+</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart sidebar mock */}
              <div className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Sale #1042</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded font-mono">3 items</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300 pb-1.5 border-b border-neutral-900">
                      <span>1x Ceylon Tea Special</span>
                      <span className="font-mono text-emerald-300">Rs. 650.00</span>
                    </div>
                    <div className="flex justify-between text-neutral-300 pb-1.5 border-b border-neutral-900">
                      <span>2x Fresh Milk 1L</span>
                      <span className="font-mono text-emerald-300">Rs. 840.00</span>
                    </div>
                    <div className="flex justify-between text-neutral-300 pb-1.5 border-b border-neutral-900">
                      <span>1x Ginger Biscuits Box</span>
                      <span className="font-mono text-emerald-300">Rs. 320.00</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">Rs. 1,810.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white">
                    <span>Total Due</span>
                    <span className="font-mono text-lg text-emerald-300">Rs. 1,810.00</span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs rounded-xl text-center shadow-lg shadow-emerald-900/40 cursor-pointer hover:from-emerald-500 hover:to-emerald-600 transition-all">
                    ⚡ Instant Checkout & Print
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-white/70 border-b border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block mb-2">
              End-to-End Retail Automation
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-950">
              Everything Your Store Needs to Thrive
            </h2>
            <p className="mt-4 text-neutral-600 text-sm">
              Designed specifically for Sri Lankan retail workflows, currency standards, and multi-branch management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-emerald-950/15 hover:border-emerald-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 card-interactive">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3">Instant Barcode Billing</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Scan barcodes with USB or Bluetooth scanners, apply line discounts, hold active bills, and print 80mm/58mm receipts in less than 2 seconds.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-emerald-950/15 hover:border-emerald-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 card-interactive">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3">Live Stock Ledger</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Every sale, purchase inward, and damage adjustment logs an immutable movement ledger. Automatic low-stock warnings notify you before stockouts.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-emerald-950/15 hover:border-emerald-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 card-interactive">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3">Daily Profit & Cost Analysis</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Track revenue, Cost of Goods Sold (COGS), staff wages, rent, and utility expenses. Real-time gross margin and net profit reports in LKR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-marble-subtle border-b border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-neutral-950 sm:text-4xl">
              Tailored for Every Business Industry in Sri Lanka
            </h2>
            <p className="mt-4 text-neutral-600 text-sm">
              Pre-configured product units, category structures, and receipt formats for your specific retail vertical.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Grocery & Supermarkets", emoji: "🛒", desc: "Kg, Pack & Barcode ready" },
              { name: "Restaurants & Cafes", emoji: "☕", desc: "Fast table & counter billing" },
              { name: "Bakeries & Sweetshops", emoji: "🥐", desc: "Fresh portions & quick keys" },
              { name: "Clothing & Fashion", emoji: "👗", desc: "Sizes, colors & barcode tags" },
              { name: "Pharmacies & Health", emoji: "💊", desc: "Strips, bottles & prescriptions" },
              { name: "Salons & Spas", emoji: "✂️", desc: "Service billing & staff comms" },
            ].map((ind, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-emerald-950/10 hover:border-emerald-500 text-center transition-all shadow-xs hover:shadow-md card-interactive"
              >
                <span className="text-3xl mb-3 block">{ind.emoji}</span>
                <p className="text-xs font-extrabold text-neutral-900">{ind.name}</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Single Unlimited Plan */}
      <section id="pricing" className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 block mb-2">
              Predictable Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-950">
              One Flat Monthly Plan. Unlimited Everything.
            </h2>
            <p className="mt-4 text-neutral-600 text-sm">
              No artificial tiers, no hidden item limits, and no surprises. One predictable fee for total business peace of mind.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-emerald-600 shadow-2xl shadow-emerald-900/10 flex flex-col justify-between relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-[11px] font-black uppercase rounded-full tracking-wider shadow-md">
                ⭐ All-Inclusive Enterprise Plan
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-emerald-950/10 pb-8 mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-neutral-950">All-in-One Unlimited</h3>
                    <p className="text-xs text-neutral-500 mt-1 font-medium">
                      Full access for single or multi-branch shops across Sri Lanka
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 text-left sm:text-right">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-700 font-mono">Rs. 4,999</span>
                    <span className="text-xs text-neutral-500 font-bold block sm:inline"> / month</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-800 font-medium">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Unlimited</strong> Products & Menu Items</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Unlimited</strong> Staff & Cashier Logins</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Unlimited</strong> Store Branches</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Unlimited</strong> Monthly Sales & Invoices</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thermal Receipt Printing (80mm & 58mm)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live Profit, Expense & Tax Reports</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer & Supplier Credit Ledgers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Barcode Generation & Scanner Support</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-Branch Stock Transfer & Tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Daily Cloud Backups & WhatsApp Help</span>
                  </div>
                </div>
              </div>

              <a
                href={getWhatsAppDirectUrl(whatsappSalesNumber, "Hello! I would like to get started with the Ticket2Grow All-in-One Unlimited Plan (Rs. 4,999/mo).")}
                onClick={(e) => handleOpenWhatsAppModal(e, "Hello! I would like to get started with the Ticket2Grow All-in-One Unlimited Plan (Rs. 4,999/mo).")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-sm rounded-2xl text-center block transition-all shadow-xl shadow-emerald-900/25 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Get Started on WhatsApp &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="py-20 bg-marble-subtle border-t border-emerald-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-neutral-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-xs text-neutral-500">Everything you need to know about setting up and running Ticket2Grow.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-emerald-950/10 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-neutral-950 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-700 transition-transform ${
                        isOpen ? "rotate-180 text-emerald-800" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-neutral-600 leading-relaxed border-t border-emerald-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-neutral-950 border-t border-emerald-900/40 py-12 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Ticket2GrowLogo size="sm" variant="dualtone-white" />
            <p className="font-medium text-neutral-300">
              © {new Date().getFullYear()} Ticket2Grow SaaS. Built for Modern High-Growth Retail & Hospitality 🇱🇰.
            </p>
          </div>
          <div className="flex items-center gap-6 font-semibold text-emerald-300">
            <Link href="/login" className="hover:text-emerald-100 transition-colors">Merchant Sign In</Link>
            <a
              href={defaultWhatsAppSalesLink}
              onClick={(e) => handleOpenWhatsAppModal(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-100 transition-colors cursor-pointer"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </footer>

      {/* Instant WhatsApp Choice Modal (Web vs Windows Desktop App) */}
      <WhatsAppLaunchModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        phone={whatsappSalesNumber}
        message={activeWhatsAppMsg}
        title="Connect with Ticket2Grow Team"
      />
    </div>
  );
}

