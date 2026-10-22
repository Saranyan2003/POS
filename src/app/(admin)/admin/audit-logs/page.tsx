"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Activity, User, Building2, Search, Filter, ShieldCheck, Shield } from "lucide-react";
import { safeFetchJson } from "@/lib/utils";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadLogs = async (range = dateRange, start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "250");
      if (range) queryParams.set("range", range);
      if (start) queryParams.set("startDate", start);
      if (end) queryParams.set("endDate", end);

      const d = await safeFetchJson(`/api/admin/audit-logs?${queryParams.toString()}`);
      setLogs(d?.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleDateFilterChange = (range: string, start?: string, end?: string) => {
    setDateRange(range);
    setStartDate(start || "");
    setEndDate(end || "");
    loadLogs(range, start, end);
  };

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.business?.name?.toLowerCase().includes(s) ||
      log.user?.name?.toLowerCase().includes(s) ||
      log.user?.loginId?.toLowerCase().includes(s) ||
      log.entity?.toLowerCase().includes(s) ||
      log.metadata?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-900 animate-in fade-in duration-300">
      {/* Top Banner - Obsidian & Emerald Glass */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Immutable Security Trail
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              System Event Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-400" />
            System Security & Audit Trail
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Immutable event telemetry for all tenant creation, logins, refunds, permissions, and security actions.
          </p>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl p-4 shadow-sm">
        <DateRangeFilter
          value={dateRange}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateFilterChange}
          isLoading={loading}
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit events by action, business name, actor login ID, or entity..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-2xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/95 backdrop-blur-md border border-emerald-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/10 text-neutral-700 uppercase font-bold bg-neutral-50/90">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Action</th>
                <th className="p-4">Business Store</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-sans">
                    <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No audit logs found.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4 text-neutral-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-900 font-bold font-sans">
                      {log.business?.name || "Platform Root"}
                    </td>
                    <td className="p-4 text-neutral-800 font-sans">
                      {log.user ? `${log.user.name} (${log.user.loginId})` : "System / Anonymous"}
                    </td>
                    <td className="p-4 text-neutral-600 font-sans font-medium">{log.entity}</td>
                    <td className="p-4 text-neutral-500 font-sans text-[10px] max-w-xs truncate">
                      {log.metadata || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
