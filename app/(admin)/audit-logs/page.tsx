"use client";

import { useState } from "react";
import { ClipboardList, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditLog } from "@/types/audit-types";

// Modular Components from global features directory
import { PageShell, InfoBanner } from "@/components/features/admin/audit-logs/UIHelpers";
import { AuditFilterPanel } from "@/components/features/admin/audit-logs/AuditFilters";
import { AuditTable } from "@/components/features/admin/audit-logs/AuditTable";
import { AuditDetailModal } from "@/components/features/admin/audit-logs/AuditDetailModal";

export default function AuditLogsPage() {
  const {
    logs,
    pagination,
    loading,
    error,
    filters,
    setPage,
    applyFilters,
    clearFilters,
  } = useAuditLogs();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const hasActiveFilters = !!(
    filters.tableName ||
    filters.operationType ||
    filters.performedBy ||
    filters.startDate ||
    filters.endDate
  );

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
          {filters.tableName && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              Table: {filters.tableName}
            </span>
          )}
          {filters.operationType && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              Action: {filters.operationType}
            </span>
          )}
          {filters.performedBy && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              By: {filters.performedBy.slice(0, 8)}…
            </span>
          )}
          {filters.startDate && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              From: {new Date(filters.startDate).toLocaleDateString()}
            </span>
          )}
          {filters.endDate && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
              To: {new Date(filters.endDate).toLocaleDateString()}
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