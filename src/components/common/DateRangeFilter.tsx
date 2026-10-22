"use client";

import React, { useState, useEffect } from "react";
import { Calendar, X, Check, Filter, Loader2 } from "lucide-react";

export interface DateRangeFilterProps {
  value?: string;
  rangePreset?: string;
  startDate?: string;
  endDate?: string;
  onChange?: (preset: string, start?: string, end?: string) => void;
  onRangeChange?: (preset: string, start: string, end: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function DateRangeFilter({
  value,
  rangePreset = "all",
  startDate = "",
  endDate = "",
  onChange,
  onRangeChange,
  isLoading = false,
  className = "",
}: DateRangeFilterProps) {
  const activePreset = value || rangePreset || "all";
  const [isCustomOpen, setIsCustomOpen] = useState(Boolean(activePreset === "custom" || (startDate && endDate)));
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  useEffect(() => {
    setCustomStart(startDate);
    setCustomEnd(endDate);
    if (activePreset === "custom" || (startDate && endDate)) {
      setIsCustomOpen(true);
    }
  }, [startDate, endDate, activePreset]);

  const presets = [
    { id: "today", label: "Today" },
    { id: "week", label: "Past 7 Days" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
    { id: "all", label: "All Time" },
  ];

  const handleSelectPreset = (presetId: string) => {
    setIsCustomOpen(false);
    if (onChange) onChange(presetId, "", "");
    if (onRangeChange) onRangeChange(presetId, "", "");
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    if (onChange) onChange("custom", customStart, customEnd);
    if (onRangeChange) onRangeChange("custom", customStart, customEnd);
  };

  const handleClearCustom = () => {
    setCustomStart("");
    setCustomEnd("");
    setIsCustomOpen(false);
    if (onChange) onChange("all", "", "");
    if (onRangeChange) onRangeChange("all", "", "");
  };

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Presets Button Group */}
        <div className="flex flex-wrap items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-900/10 shadow-xs">
          {presets.map((p) => {
            const isSelected = !isCustomOpen && activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20"
                    : "text-neutral-700 hover:text-emerald-900 hover:bg-emerald-50/80"
                }`}
              >
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCustomOpen || activePreset === "custom"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20"
                : "text-neutral-700 hover:text-emerald-900 hover:bg-emerald-50/80"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom Dates</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px] animate-in fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Filtering records...</span>
          </div>
        )}
      </div>

      {/* Expandable Custom Range Selector */}
      {isCustomOpen && (
        <form
          onSubmit={handleApplyCustom}
          className="flex flex-wrap items-center gap-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-800/15 shadow-sm animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-600 uppercase">From:</span>
            <input
              type="date"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="p-2 bg-neutral-50/80 border border-emerald-900/15 rounded-xl text-neutral-950 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-600 uppercase">To:</span>
            <input
              type="date"
              required
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="p-2 bg-neutral-50/80 border border-emerald-900/15 rounded-xl text-neutral-950 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filter</span>
            </button>
            <button
              type="button"
              onClick={handleClearCustom}
              title="Reset date filter"
              className="p-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default DateRangeFilter;
