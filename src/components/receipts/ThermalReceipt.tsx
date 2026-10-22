"use client";

import React, { useState } from "react";
import { formatLKR } from "@/lib/currency";
import { Printer, X, Check, Copy, Sparkles } from "lucide-react";

export interface ReceiptProps {
  business: {
    name: string;
    phone: string;
    address?: string | null;
    city?: string | null;
    taxNumber?: string | null;
    receiptHeader?: string | null;
    receiptFooter?: string | null;
  };
  branchName?: string;
  invoiceNumber: string;
  date: string | Date;
  cashierName: string;
  customer?: { name: string; phone?: string } | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  tenderedAmount?: number | null;
  changeAmount?: number | null;
  onClose?: () => void;
}

export function ThermalReceipt({
  business,
  branchName,
  invoiceNumber,
  date,
  cashierName,
  customer,
  items,
  subtotal,
  discount,
  tax,
  total,
  paymentMethod,
  tenderedAmount,
  changeAmount,
  onClose,
}: ReceiptProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(date).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border-2 border-black">
        {/* Header Action Bar */}
        <div className="px-5 py-4 bg-black text-white flex items-center justify-between no-print border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Thermal Receipt Preview</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Standard 80mm ESC/POS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Receipt Container with Realistic Paper Look */}
        <div className="p-6 overflow-y-auto bg-neutral-100 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3 px-1 no-print">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Receipt Paper Simulator
            </span>
            <button
              onClick={copyInvoice}
              className="text-[11px] font-mono font-semibold text-neutral-700 hover:text-black flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : invoiceNumber}</span>
            </button>
          </div>

          <div
            id="printable-receipt"
            className="receipt-paper rounded-xl p-6 w-[310px] text-neutral-950 text-xs font-mono leading-tight border border-neutral-300 shadow-lg relative bg-white"
          >
            {/* Top Store Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-neutral-300">
              <h2 className="text-base font-black text-neutral-950 uppercase tracking-tight">
                {business.name}
              </h2>
              {business.receiptHeader ? (
                <p className="text-[11px] text-neutral-600 whitespace-pre-line mt-1 font-sans">
                  {business.receiptHeader}
                </p>
              ) : (
                <>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{business.address || "Sri Lanka"}</p>
                  <p className="text-[11px] text-neutral-600 font-bold">Tel: {business.phone}</p>
                </>
              )}
              {business.taxNumber && (
                <p className="text-[10px] text-neutral-500 mt-1 font-semibold">TAX / VAT: {business.taxNumber}</p>
              )}
            </div>

            {/* Meta Details */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">INVOICE:</span>
                <span className="font-extrabold text-neutral-950">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">DATE:</span>
                <span className="font-medium text-neutral-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">CASHIER:</span>
                <span className="font-medium text-neutral-800">{cashierName}</span>
              </div>
              {branchName && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">BRANCH:</span>
                  <span className="font-medium text-neutral-800">{branchName}</span>
                </div>
              )}
              {customer && (
                <div className="flex justify-between pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">CUSTOMER:</span>
                  <span className="font-bold text-neutral-900">{customer.name}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-300">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-neutral-400 text-neutral-700 font-black">
                    <th className="pb-1">ITEM</th>
                    <th className="pb-1 text-center">QTY</th>
                    <th className="pb-1 text-right">PRICE</th>
                    <th className="pb-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 pr-1">
                        <span className="font-bold text-neutral-950 line-clamp-1">{item.name}</span>
                        {item.discount && item.discount > 0 ? (
                          <span className="text-[9px] text-neutral-500 block">
                            Disc: -{formatLKR(item.discount)}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-1.5 text-center font-bold text-neutral-900">{item.quantity}</td>
                      <td className="py-1.5 text-right text-neutral-600">{formatLKR(item.unitPrice, false)}</td>
                      <td className="py-1.5 text-right font-black text-neutral-950">{formatLKR(item.total, false)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Calculations */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">SUBTOTAL</span>
                <span className="font-bold">{formatLKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neutral-900 font-bold">
                  <span>DISCOUNT</span>
                  <span>-{formatLKR(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>TAX / VAT</span>
                  <span>+{formatLKR(tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 text-sm font-black text-neutral-950 border-t border-neutral-400">
                <span>NET TOTAL</span>
                <span className="text-base font-black">{formatLKR(total)}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600 font-bold">PAYMENT ({paymentMethod})</span>
                <span className="font-extrabold text-neutral-950">{formatLKR(total)}</span>
              </div>
              {tenderedAmount !== null && tenderedAmount !== undefined && tenderedAmount > 0 && (
                <>
                  <div className="flex justify-between text-neutral-500">
                    <span>CASH TENDERED</span>
                    <span>{formatLKR(tenderedAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-neutral-950">
                    <span>CHANGE DUE</span>
                    <span>{formatLKR(changeAmount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Receipt Footer & Barcode Simulation */}
            <div className="pt-4 text-center space-y-2 text-[10px] text-neutral-500 font-sans">
              <p className="font-bold text-neutral-800 text-[11px]">{business.receiptFooter}</p>
              <div className="font-mono tracking-widest text-[9px] text-neutral-400 py-1 select-none">
                ||||||||||||| | ||||| |||||| |||||||| ||||
              </div>
              <p className="text-[9px] text-neutral-400">Powered by Ticket2Grow Cloud 🇱🇰</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Window
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

