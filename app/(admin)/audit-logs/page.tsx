"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLog, AuditFilters, OperationType } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import orgApiClient from "@/services/org-api-client";

// Modular Components from global features directory
import { PageShell, InfoBanner } from "@/components/features/admin/audit-logs/UIHelpers";
import { AuditFilterPanel } from "@/components/features/admin/audit-logs/AuditFilters";
import { AuditTable } from "@/components/features/admin/audit-logs/AuditTable";
import { AuditDetailModal } from "@/components/features/admin/audit-logs/AuditDetailModal";

// Raw shape returned by the API — mapped to PaginationMeta before storing
interface ApiPagination { total: number; page: number; limit: number; }

export default function AuditLogsPage() {
  const [logs, setLogs]             = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
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

  const hasActiveFilters = !!(tableName || operationType || performedBy || startDate || endDate);

  // Active filters object (passed to child components that expect a filters shape)
  const filters: AuditFilters = { tableName, operationType, performedBy, startDate, endDate };

  const applyFilters = (next: AuditFilters) => {
    setTableName(next.tableName);
    setOperationType(next.operationType);
    setPerformedBy(next.performedBy);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    setPage(1);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    applyFilters({ tableName: "", operationType: "", performedBy: "", startDate: "", endDate: "" });
  };

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

      const res = await orgApiClient.get<{ data: AuditLog[]; pagination: ApiPagination }>("/audit-logs", { params });
      setLogs(res.data.data ?? []);
      const p = res.data.pagination;
      setPagination(p ? {
        current_page:  p.page,
        per_page:      p.limit,
        total:         p.total,
        total_pages:   Math.max(1, Math.ceil(p.total / p.limit)),
        has_next:      p.page < Math.ceil(p.total / p.limit),
        has_previous:  p.page > 1,
      } : null);
    } catch (e: unknown) {
      const s = (e as { response?: { status?: number } })?.response?.status;
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
              {loading
                ? "Loading…"
                : pagination
                  ? `${pagination.total.toLocaleString()} total records`
                  : "System activity log"}
            </p>
          </div>
        </div>
        <Button
          variant={filtersOpen || hasActiveFilters ? "secondary" : "outline"}
          onClick={() => setFiltersOpen((f) => !f)}
          className="w-full sm:w-auto"
        >
          <Filter className="w-4 h-4" />
          {filtersOpen ? "Hide Filters" : "Filter Logs"}
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-teal-500" />}
        </Button>
      </div>

      {/* ── Admin info banner ── */}
      <InfoBanner>
        Audit logs are <strong>read-only</strong> records of every action taken in the system — who
        did what, when, and on which record. Use the filters below to investigate specific events.
        Logs cannot be deleted or edited.
      </InfoBanner>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <AuditFilterPanel
          initialFilters={filters}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 font-medium">Active filters:</span>
          {tableName && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              Table: {tableName}
            </span>
          )}
          {operationType && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              Action: {operationType}
            </span>
          )}
          {performedBy && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              By: {performedBy.slice(0, 8)}…
            </span>
          )}
          {startDate && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              From: {new Date(startDate).toLocaleDateString()}
            </span>
          )}
          {endDate && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              To: {new Date(endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border bg-red-50 border-red-200 text-red-800 text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ── Content ── */}
      <AuditTable
        logs={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onViewDetails={setSelectedLog}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Detail Modal ── */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </PageShell>
  );
}