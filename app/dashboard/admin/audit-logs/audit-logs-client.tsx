"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  User,
  Clock,
  Sparkles,
  Layers,
  FileText,
  Activity,
  AlertTriangle,
  FileCheck2,
  X,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp
} from "lucide-react";

type AuditLog = {
  id: number;
  user_id: number | null;
  entity_type: string;
  entity_id: number;
  action: string;
  old_value: any;
  new_value: any;
  created_at: string;
  event_category: string;
  severity: string;
  entity_name: string | null;
  action_summary: string;
  metadata: any;
  impact_type: string | null;
  impact_value: string | number;
  is_system_event: boolean;
  related_entity_type: string | null;
  related_entity_id: number | null;
  user_name: string | null;
  user_role: string | null;
};

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuditLogsCenterClientProps = {
  initialLogs: AuditLog[];
  users: UserProfile[];
};

export default function AuditLogsCenterClient({ initialLogs, users }: AuditLogsCenterClientProps) {
  const [logs] = useState<AuditLog[]>(initialLogs);
  
  // Mounted state to prevent hydration locale/timezone date mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("ALL"); // ALL, HUMAN, SYSTEM
  const [userFilter, setUserFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");
  const [dateRangePreset, setDateRangePreset] = useState("ALL"); // ALL, TODAY, WEEK, MONTH

  // Detail Drawer State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Get distinct Entity Types present in logs
  const distinctEntityTypes = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.entity_type))).filter(Boolean);
  }, [logs]);

  // Handle reload/refresh log event simulated locally
  const handleRefreshLogs = () => {
    window.location.reload();
  };

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search text match
      const text = searchTerm.toLowerCase();
      const matchesSearch = 
        log.action_summary.toLowerCase().includes(text) ||
        (log.entity_name && log.entity_name.toLowerCase().includes(text)) ||
        (log.user_name && log.user_name.toLowerCase().includes(text)) ||
        log.action.toLowerCase().includes(text) ||
        log.entity_type.toLowerCase().includes(text) ||
        String(log.entity_id).includes(text);

      // 2. Category match
      const matchesCategory = categoryFilter === "ALL" || log.event_category === categoryFilter;

      // 3. Severity match
      const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;

      // 4. Actor match
      const matchesActor = 
        actorFilter === "ALL" ||
        (actorFilter === "SYSTEM" && log.is_system_event) ||
        (actorFilter === "HUMAN" && !log.is_system_event);

      // 5. User match
      const matchesUser = userFilter === "ALL" || String(log.user_id) === userFilter;

      // 6. Entity Type match
      const matchesEntityType = entityTypeFilter === "ALL" || log.entity_type === entityTypeFilter;

      // 7. Date Range match
      let matchesDate = true;
      if (dateRangePreset !== "ALL") {
        const logDate = new Date(log.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateRangePreset === "TODAY") {
          matchesDate = logDate.toDateString() === now.toDateString();
        } else if (dateRangePreset === "WEEK") {
          matchesDate = diffDays <= 7;
        } else if (dateRangePreset === "MONTH") {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesCategory && matchesSeverity && matchesActor && matchesUser && matchesEntityType && matchesDate;
    });
  }, [logs, searchTerm, categoryFilter, severityFilter, actorFilter, userFilter, entityTypeFilter, dateRangePreset]);

  // Calculations for KPIs
  const kpiMetrics = useMemo(() => {
    const today = new Date().toDateString();
    
    const totalToday = logs.filter(l => new Date(l.created_at).toDateString() === today).length;
    const salesEvents = logs.filter(l => l.event_category === "SALES").length;
    const inventoryEvents = logs.filter(l => l.event_category === "INVENTORY").length;
    const mfgEvents = logs.filter(l => l.event_category === "MANUFACTURING").length;
    const failedActions = logs.filter(l => l.severity === "ERROR" || logIsFailed(l)).length;
    const criticalEvents = logs.filter(l => l.severity === "CRITICAL").length;

    return { totalToday, salesEvents, inventoryEvents, mfgEvents, failedActions, criticalEvents };
  }, [logs]);

  function logIsFailed(log: AuditLog) {
    const act = log.action.toUpperCase();
    return act.includes("FAIL") || act.includes("ERROR") || act.includes("DENIED");
  }

  // Helper to format date cleanly (executed client side after mounting)
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  // Severity Colors mapping
  const severityStyles: Record<string, string> = {
    INFO: "text-blue-700 bg-blue-50 border-blue-200",
    SUCCESS: "text-emerald-700 bg-emerald-50 border-emerald-200",
    WARNING: "text-amber-700 bg-amber-50 border-amber-200",
    ERROR: "text-rose-700 bg-rose-50 border-rose-200",
    CRITICAL: "text-purple-700 bg-purple-50 border-purple-200"
  };

  const categoryColors = {
    AUTHENTICATION: "#a855f7",
    SALES: "#14b8a6",
    PURCHASE: "#3b82f6",
    MANUFACTURING: "#ec4899",
    INVENTORY: "#f59e0b",
    SYSTEM: "#64748b"
  };

  // Render GitHub Diff Comparison
  function renderChangeComparison(oldVal: any, newVal: any) {
    if (!oldVal && !newVal) {
      return <p className="text-xs text-[#53645c] italic">No record data changes captured.</p>;
    }

    try {
      const oldObj = typeof oldVal === "string" ? JSON.parse(oldVal) : oldVal || {};
      const newObj = typeof newVal === "string" ? JSON.parse(newVal) : newVal || {};

      const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

      if (allKeys.length === 0) {
        return <p className="text-xs text-[#53645c] italic">Empty value data structures.</p>;
      }

      return (
        <div className="rounded-xl border border-[#ded4c3] bg-[#0f172a] p-4 font-mono text-[11px] text-[#f8fafc] overflow-x-auto max-h-96">
          {allKeys.map((key) => {
            const oVal = oldObj[key];
            const nVal = newObj[key];

            const oldStr = typeof oVal === "object" ? JSON.stringify(oVal) : String(oVal ?? "");
            const newStr = typeof nVal === "object" ? JSON.stringify(nVal) : String(nVal ?? "");

            // Hide password hashes entirely for safety
            if (key.includes("password") || key.includes("hash")) {
              return (
                <div key={key} className="py-1 text-slate-500 border-b border-slate-900 last:border-0 flex justify-between">
                  <span>{key}:</span>
                  <span className="italic">[PROTECTED PASSWORD HASH]</span>
                </div>
              );
            }

            if (oldStr === newStr) {
              return (
                <div key={key} className="py-1 text-slate-500 border-b border-slate-900 last:border-0 flex justify-between">
                  <span className="font-semibold">{key}:</span>
                  <span>{oldStr}</span>
                </div>
              );
            }

            return (
              <div key={key} className="py-1 border-b border-slate-900 last:border-0 space-y-1">
                <span className="font-bold text-slate-300 block">{key}</span>
                {oVal !== undefined && (
                  <div className="rounded bg-red-950/50 px-2 py-0.5 text-red-400 flex items-start gap-1">
                    <span className="font-bold shrink-0 w-3">-</span>
                    <span className="break-all">{oldStr}</span>
                  </div>
                )}
                {nVal !== undefined && (
                  <div className="rounded bg-emerald-950/50 px-2 py-0.5 text-emerald-400 flex items-start gap-1">
                    <span className="font-bold shrink-0 w-3">+</span>
                    <span className="break-all">{newStr}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    } catch (e) {
      return (
        <div className="rounded-xl border border-[#ded4c3] bg-slate-950 p-4 font-mono text-[11px] text-slate-100 whitespace-pre-wrap">
          {`Raw Data:\nOld: ${JSON.stringify(oldVal)}\nNew: ${JSON.stringify(newVal)}`}
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Activity KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Events Today</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.totalToday}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Total logged today</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
            <Activity className="size-4 text-blue-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Sales Activities</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.salesEvents}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Sales operations logs</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
            <TrendingUp className="size-4 text-teal-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Inventory moves</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.inventoryEvents}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Ledger adjustments</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
            <Layers className="size-4 text-amber-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Manufacturing</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.mfgEvents}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Production events</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 border border-pink-100">
            <FileCheck2 className="size-4 text-pink-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Failed actions</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.failedActions}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Errors and exceptions</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
            <AlertTriangle className="size-4 text-rose-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded4c3] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Critical alerts</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{kpiMetrics.criticalEvents}</h3>
            <p className="text-[9px] text-[#53645c] mt-0.5">Security alerts</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-100">
            <ShieldAlert className="size-4 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters Control Bar */}
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3ebdd] pb-3">
            <h3 className="text-sm font-bold text-[#18231f] flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#176b5d]" />
              Filters & Intelligence Controls
            </h3>
            <button 
              onClick={handleRefreshLogs} 
              className="text-xs text-[#176b5d] hover:text-[#1f806f] font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="size-3" />
              Reload Logs
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
              <input
                type="text"
                placeholder="Search log, user, entity ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-xs outline-none transition focus:border-[#176b5d]"
              />
            </div>

            {/* Event Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTHENTICATION">Authentication / Security</option>
                <option value="SALES">Sales Orders / Customers</option>
                <option value="PURCHASE">Purchase Orders / Vendors</option>
                <option value="MANUFACTURING">Manufacturing Orders / BoMs</option>
                <option value="INVENTORY">Inventory / Stock Ledger</option>
                <option value="SYSTEM">System Automations</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Actor Filter */}
            <div>
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Actors (Human & System)</option>
                <option value="HUMAN">Human Staff Actions</option>
                <option value="SYSTEM">SYSTEM Automations</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2 border-t border-[#f7f4ed]">
            
            {/* Specific User */}
            <div>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Responsible Users</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Entity Type */}
            <div>
              <select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Entity Types</option>
                {distinctEntityTypes.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Date Presets */}
            <div>
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-xs outline-none transition focus:border-[#176b5d]"
              >
                <option value="ALL">All Date History</option>
                <option value="TODAY">Today's Log Entries</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>
            </div>

          </div>
        </div>

        {/* Tabular List View */}
        {filteredLogs.length === 0 ? (
          <div className="rounded-2xl border border-[#ded4c3] bg-white p-12 text-center">
            <FileText className="size-12 text-[#68756e] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-[#18231f]">No matching audit logs</h4>
            <p className="text-xs text-[#53645c] mt-2">Adjust your filtering parameters above to browse other events.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#ded4c3] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-[#18231f]">
                <thead className="border-b border-[#ded4c3] bg-[#fbfaf6] text-xs font-bold uppercase tracking-wider text-[#68756e]">
                  <tr>
                    <th className="px-4 py-3.5 font-mono">ID</th>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Severity</th>
                    <th className="px-4 py-3.5">Operator</th>
                    <th className="px-4 py-3.5">Action Summary</th>
                    <th className="px-4 py-3.5">Entity</th>
                    <th className="px-4 py-3.5">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3ebdd] text-xs">
                  {filteredLogs.map((log) => {
                    const isSystem = log.is_system_event;
                    return (
                      <tr 
                        key={log.id} 
                        className="hover:bg-[#fbfaf6]/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-[#68756e]">
                          #{log.id}
                        </td>
                        <td className="px-4 py-3 text-[#53645c] font-semibold whitespace-nowrap">
                          {mounted ? `${formatEventDate(log.created_at)} ${formatEventTime(log.created_at)}` : "..."}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span 
                            className="rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider"
                            style={{ backgroundColor: categoryColors[log.event_category as keyof typeof categoryColors] || "#64748b" }}
                          >
                            {log.event_category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[log.severity]}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isSystem ? (
                            <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 w-fit">
                              <Sparkles className="size-2.5" />
                              SYSTEM
                            </span>
                          ) : (
                            <span className="rounded-md border border-[#c9dbd5] bg-[#eef7f3] px-2 py-0.5 text-[10px] font-bold text-[#176b5d] uppercase tracking-wider flex items-center gap-1 w-fit">
                              <User className="size-2.5" />
                              {log.user_name || "Unknown"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#18231f]">
                          {log.action_summary}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#53645c]">
                          <span className="capitalize">{log.entity_type.replace(/_/g, ' ')}</span>
                          <span className="ml-1.5 font-mono bg-[#f7f4ed] px-1 rounded-sm text-[#18231f]">
                            {log.entity_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.impact_type ? (
                            log.impact_type === "REVENUE" ? (
                              <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                +₹{Number(log.impact_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            ) : log.impact_type === "INVENTORY_IN" ? (
                              <span className="inline-flex rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                +{log.impact_value} units
                              </span>
                            ) : log.impact_type === "FINISHED_GOODS" ? (
                              <span className="inline-flex rounded-lg bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                +{log.impact_value} goods
                              </span>
                            ) : (
                              <span className="inline-flex rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {log.impact_value}
                              </span>
                            )
                          ) : (
                            <span className="text-[#68756e] font-semibold italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Details Side-Drawer overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedLog(null)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col justify-between z-10 border-l border-[#ded4c3] animate-slide-in">
            
            {/* Header */}
            <div className="p-6 border-b border-[#f3ebdd] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Event Inspection Drawer</span>
                <h3 className="text-base font-bold text-[#18231f] mt-1">Audit Record #{selectedLog.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="rounded-lg p-2 text-[#53645c] hover:bg-slate-100 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
              
              {/* Event Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#f3ebdd] pb-5">
                <div>
                  <span className="block text-[#68756e] font-semibold">Timestamp</span>
                  <span className="mt-1 block font-bold text-[#18231f]">
                    {mounted ? `${new Date(selectedLog.created_at).toLocaleString()}` : "..."}
                  </span>
                </div>
                <div>
                  <span className="block text-[#68756e] font-semibold">Event Severity</span>
                  <span className={`mt-1 inline-flex rounded border px-2 py-0.5 font-bold uppercase tracking-wide ${severityStyles[selectedLog.severity]}`}>
                    {selectedLog.severity}
                  </span>
                </div>
                <div>
                  <span className="block text-[#68756e] font-semibold">Entity Reference</span>
                  <span className="mt-1 block font-bold text-[#18231f] capitalize">{selectedLog.entity_type.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="block text-[#68756e] font-semibold">Record ID</span>
                  <span className="mt-1 block font-mono font-bold text-[#18231f] bg-[#f7f4ed] px-1 rounded-sm w-fit">{selectedLog.entity_id}</span>
                </div>
                <div>
                  <span className="block text-[#68756e] font-semibold">Responsible Actor</span>
                  <span className="mt-1 block font-bold text-[#18231f]">
                    {selectedLog.is_system_event ? "SYSTEM ENGINE" : selectedLog.user_name || "Unknown User"}
                  </span>
                </div>
                <div>
                  <span className="block text-[#68756e] font-semibold">User Role Group</span>
                  <span className="mt-1 block font-semibold text-[#53645c]">{selectedLog.user_role || "System Process"}</span>
                </div>
                {selectedLog.metadata?.ip && (
                  <div>
                    <span className="block text-[#68756e] font-semibold">IP Address</span>
                    <span className="mt-1 block font-mono text-[#18231f]">{selectedLog.metadata.ip}</span>
                  </div>
                )}
                {selectedLog.metadata?.userAgent && (
                  <div className="col-span-2">
                    <span className="block text-[#68756e] font-semibold">User Agent</span>
                    <span className="mt-1 block text-[#53645c] truncate" title={selectedLog.metadata.userAgent}>
                      {selectedLog.metadata.userAgent}
                    </span>
                  </div>
                )}
              </div>

              {/* GitHub-style changes comparison view */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#68756e] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5 text-[#176b5d]" />
                  Change comparison view (before / after)
                </h4>
                {renderChangeComparison(selectedLog.old_value, selectedLog.new_value)}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#f3ebdd] bg-[#fbfaf6] flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-xs font-bold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
