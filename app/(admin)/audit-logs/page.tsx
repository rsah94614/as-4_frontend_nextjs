"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Search, ChevronLeft, ChevronRight,
  AlertCircle, Eye, X, RotateCcw, Info, Filter,
  ArrowUpCircle, PencilLine, Trash2
} from "lucide-react";
import orgApiClient from "@/services/org-api-client";
import type { AuditLog, AuditPagination, OperationType } from "@/types";
import { AUDIT_OPERATION_TYPES } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

const OPERATION_TYPES = AUDIT_OPERATION_TYPES;

// ─── Design tokens ────────────────────────────────────────────────────────────

const OP_META: Record<OperationType, { pill: string; icon: React.ReactNode; label: string }> = {
  INSERT: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <ArrowUpCircle className="w-3 h-3" />,
    label: "Created",
  },
  UPDATE: {
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <PencilLine className="w-3 h-3" />,
    label: "Updated",
  },
  DELETE: {
    pill: "bg-red-50 text-red-700 border-red-200",
    icon: <Trash2 className="w-3 h-3" />,
    label: "Deleted",
  },
};

type ApiError = {
  response?: {
    status?: number;
  };
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  return (error as ApiError).response?.status;
}

// ─── Shared components ────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 mb-6">
      <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-700 leading-relaxed">{children}</p>
    </div>
  );
}

function OperationBadge({ op }: { op: string }) {
  const meta = OP_META[op as OperationType];
  if (!meta) return <span className="text-xs text-gray-400 font-mono">{op}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${meta.pill}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

function TableBadge({ name }: { name: string }) {
  return (
    <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
      {name}
    </span>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-mono">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition mt-0.5 shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function JsonBlock({ label, data, hint }: { label: string; data: unknown; hint?: string }) {
  if (!data) return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-xs text-gray-300 italic px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">{hint ?? "No data"}</p>
    </div>
  );
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
      <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonTableRow({ index }: { index: number }) {
  return (
    <tr className="border-b border-gray-100 animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <td className="px-5 py-4"><div className="h-6 w-24 bg-gray-100 rounded-lg" /></td>
      <td className="px-5 py-4"><div className="h-6 w-20 bg-gray-100 rounded-lg" /></td>
      <td className="px-5 py-4 hidden md:table-cell"><div className="h-4 w-48 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 hidden lg:table-cell"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-7 w-7 bg-gray-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="p-4 border-b border-gray-100 animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-100 rounded-lg" />
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-4 w-40 bg-gray-100 rounded" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-7 w-7 bg-gray-100 rounded-lg shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [logs, setLogs]             = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<AuditPagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [page, setPage]                   = useState(1);
  const [tableName, setTableName]         = useState("");
  const [operationType, setOperationType] = useState<OperationType | "">("");
  const [performedBy, setPerformedBy]     = useState("");
  const [startDate, setStartDate]         = useState("");
  const [endDate, setEndDate]             = useState("");

  // Staged filter state (only applied on Search click)
  const [staged, setStaged] = useState({ tableName: "", operationType: "" as OperationType | "", performedBy: "", startDate: "", endDate: "" });

  const hasActiveFilters = !!(tableName || operationType || performedBy || startDate || endDate);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit: 50 };
      if (tableName)     params.table_name     = tableName;
      if (operationType) params.operation_type = operationType;
      if (performedBy)   params.performed_by   = performedBy;
      if (startDate)     params.start_date     = new Date(startDate).toISOString();
      if (endDate)       params.end_date       = new Date(endDate).toISOString();

      const res = await orgApiClient.get<{ data: AuditLog[]; pagination: AuditPagination }>("/audit-logs", { params });
      setLogs(res.data.data ?? []);
      setPagination(res.data.pagination ?? null);
    } catch (e: unknown) {
      const s = getErrorStatus(e);
      setError(s === 401
        ? "Your session has expired. Please log in again."
        : "Could not load audit logs. Please check that the service is running."
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, tableName, operationType, performedBy, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const applyFilters = () => {
    setTableName(staged.tableName);
    setOperationType(staged.operationType);
    setPerformedBy(staged.performedBy);
    setStartDate(staged.startDate);
    setEndDate(staged.endDate);
    setPage(1);
  };

  const clearFilters = () => {
    const empty = { tableName: "", operationType: "" as OperationType | "", performedBy: "", startDate: "", endDate: "" };
    setStaged(empty);
    setTableName(""); setOperationType(""); setPerformedBy(""); setStartDate(""); setEndDate("");
    setPage(1);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition placeholder-gray-300 text-gray-800";

  return (
    <PageShell>
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : pagination ? `${pagination.total.toLocaleString()} total records` : "System activity log"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setFiltersOpen(f => !f)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 border text-sm font-semibold rounded-xl transition w-full sm:w-auto shrink-0 ${
            filtersOpen || hasActiveFilters
              ? "bg-teal-50 border-teal-200 text-teal-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <Filter className="w-4 h-4" />
          {filtersOpen ? "Hide Filters" : "Filter Logs"}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          )}
        </button>
      </div>

      {/* ── Admin info banner ── */}
      <InfoBanner>
        Audit logs are <strong>read-only</strong> records of every action taken in the system — who did what, when, and on which record.
        Use the filters below to investigate specific events. Logs cannot be deleted or edited.
      </InfoBanner>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700">Filter Logs</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition font-medium">
                <RotateCcw className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Table / Module
              </label>
              <input value={staged.tableName} onChange={e => setStaged(p => ({ ...p, tableName: e.target.value }))}
                placeholder="e.g. employees, departments" className={inputCls} />
              <p className="text-xs text-gray-300 mt-1">The database table that was changed</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Action Type
              </label>
              <select value={staged.operationType}
                onChange={e => setStaged(p => ({ ...p, operationType: e.target.value as OperationType | "" }))}
                className={`${inputCls} bg-white`}>
                <option value="">All actions</option>
                {OPERATION_TYPES.map((op) => (
                  <option key={op} value={op}>
                    {op === "INSERT" ? "Created" : op === "UPDATE" ? "Updated" : "Deleted"} ({op})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Performed By
              </label>
              <input value={staged.performedBy} onChange={e => setStaged(p => ({ ...p, performedBy: e.target.value }))}
                placeholder="Employee ID (UUID)" className={inputCls} />
              <p className="text-xs text-gray-300 mt-1">Paste the employee&apos;s ID from the Employees page</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                From Date &amp; Time
              </label>
              <input type="datetime-local" value={staged.startDate}
                onChange={e => setStaged(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                To Date &amp; Time
              </label>
              <input type="datetime-local" value={staged.endDate}
                onChange={e => setStaged(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex items-end">
              <button onClick={applyFilters}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-teal-200">
                <Search className="w-4 h-4" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 font-medium">Active filters:</span>
          {tableName && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">Table: {tableName}</span>}
          {operationType && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">Action: {operationType}</span>}
          {performedBy && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">By: {performedBy.slice(0, 8)}…</span>}
          {startDate && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">From: {new Date(startDate).toLocaleDateString()}</span>}
          {endDate && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">To: {new Date(endDate).toLocaleDateString()}</span>}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border bg-red-50 border-red-200 text-red-800 text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Table</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Record ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Done By</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">When</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} index={i} />)
                : logs.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="text-sm font-medium text-gray-400">No logs found</p>
                      <p className="text-xs text-gray-300 mt-1">{hasActiveFilters ? "Try changing or clearing your filters." : "No activity has been recorded yet."}</p>
                    </td>
                  </tr>
                )
                : logs.map(log => (
                  <tr key={log.audit_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4"><TableBadge name={log.table_name} /></td>
                    <td className="px-5 py-4"><OperationBadge op={log.operation_type} /></td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-400 truncate max-w-[140px] block" title={log.record_id}>
                        {log.record_id.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="font-mono text-xs text-gray-400 truncate max-w-[140px] block" title={log.performed_by}>
                        {log.performed_by.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-xs font-medium text-gray-700">{new Date(log.performed_at).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400 ml-1.5">{new Date(log.performed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedLog(log)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition"
                        title="View full details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : logs.length === 0
            ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-medium text-gray-400">No logs found</p>
                <p className="text-xs text-gray-300 mt-1">{hasActiveFilters ? "Try changing or clearing your filters." : "No activity recorded yet."}</p>
              </div>
            )
            : logs.map(log => (
              <button key={log.audit_id} onClick={() => setSelectedLog(log)}
                className="w-full text-left p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 active:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TableBadge name={log.table_name} />
                      <OperationBadge op={log.operation_type} />
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">{log.record_id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.performed_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>
              </button>
            ))
          }
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing page <span className="font-semibold text-gray-600">{pagination.current_page}</span> of <span className="font-semibold text-gray-600">{pagination.total_pages}</span>
              <span className="hidden sm:inline"> · {pagination.total.toLocaleString()} total entries</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.has_previous}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 disabled:border-gray-100">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 disabled:border-gray-100">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedLog && (
        <Modal
          title={`${OP_META[selectedLog.operation_type as OperationType]?.label ?? selectedLog.operation_type} on "${selectedLog.table_name}"`}
          subtitle={`Log ID: ${selectedLog.audit_id}`}
          onClose={() => setSelectedLog(null)}
        >
          {/* Summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              { label: "What happened", value: `${OP_META[selectedLog.operation_type as OperationType]?.label ?? selectedLog.operation_type} on ${selectedLog.table_name}` },
              { label: "When", value: new Date(selectedLog.performed_at).toLocaleString([], { dateStyle: "long", timeStyle: "medium" }) },
              { label: "Record ID", value: selectedLog.record_id, mono: true },
              { label: "Done by (Employee ID)", value: selectedLog.performed_by, mono: true },
              { label: "IP Address", value: selectedLog.ip_address ?? "Not recorded" },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-sm text-gray-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              What changed — <span className="normal-case font-normal text-gray-400">Before &amp; After comparison</span>
            </p>
            <JsonBlock label="Before (Old Values)" data={selectedLog.old_values}
              hint="No previous values — this was a new record creation." />
            <JsonBlock label="After (New Values)" data={selectedLog.new_values}
              hint="No new values — this record was deleted." />
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
