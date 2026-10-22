"use client";

import React, { useEffect } from "react";
import { MessageCircle, Monitor, Globe, X, ExternalLink, ArrowRight } from "lucide-react";
import { getWhatsAppWebUrl, getWhatsAppAppUri, openWhatsAppAppDirect } from "@/lib/whatsapp";

interface WhatsAppLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  message?: string;
  title?: string;
}

export function WhatsAppLaunchModal({
  isOpen,
  onClose,
  phone,
  message = "",
  title = "Choose How to Open WhatsApp",
}: WhatsAppLaunchModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const webUrl = getWhatsAppWebUrl(phone, message);
  const appUri = getWhatsAppAppUri(phone, message);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-950/15 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-neutral-950 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white tracking-tight">{title}</h3>
              <p className="text-[11px] font-mono text-emerald-300">Target: +{phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-6 space-y-3.5 bg-marble-luxury">
          <p className="text-xs text-neutral-600 font-medium leading-relaxed">
            Select your preferred WhatsApp platform to connect directly without intermediate landing screens:
          </p>

          {/* Option 1: WhatsApp Web (Direct Browser Tab) */}
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-50/50 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-neutral-950 flex items-center gap-1.5">
                  <span>WhatsApp Web</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Browser
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Opens directly in a new tab with message pre-filled
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>

          {/* Option 2: Windows / Mac WhatsApp Desktop App */}
          <a
            href={appUri}
            onClick={() => {
              openWhatsAppAppDirect(phone, message);
              onClose();
            }}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-neutral-950 flex items-center gap-1.5">
                  <span>Windows Desktop App</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-mono">
                    Native
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Launches installed WhatsApp Windows/Mac application
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-center">
          <p className="text-[10px] text-neutral-500">
            Powered by Ticket2Grow Instant WhatsApp Bridge🇱🇰
          </p>
        </div>
      </div>
    </div>
  );
}
