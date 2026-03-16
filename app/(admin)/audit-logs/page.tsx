"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AuditLog, AuditFilters } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import { fetchAuditLogs } from "@/services/org-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { AuditTable } from "@/components/features/admin/audit-logs/AuditTable";
import { AuditDetailModal } from "@/components/features/admin/audit-logs/AuditDetailModal";
import { AuditFilterPanel } from "@/components/features/admin/audit-logs/AuditFilters";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState<AuditFilters>({
        tableName: "",
        operationType: "",
        performedBy: "",
        startDate: "",
        endDate: "",
    });

    const hasActiveFilters = !!(
        filters.tableName ||
        filters.operationType ||
        filters.performedBy ||
        filters.startDate ||
        filters.endDate
    );

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, pagination } = await fetchAuditLogs({
                page,
                limit: 10,
                ...(filters.tableName      && { table_name:      filters.tableName }),
                ...(filters.operationType  && { operation_type:  filters.operationType }),
                ...(filters.performedBy    && { performed_by:    filters.performedBy }),
                ...(filters.startDate      && { start_date:      new Date(filters.startDate).toISOString() }),
                ...(filters.endDate        && { end_date:        new Date(filters.endDate).toISOString() }),
            });
            setLogs(data);
            setPagination(pagination ?? null);
        } catch (e: unknown) {
            setError(extractErrorMessage(e, "Could not load audit logs. Please check that the service is running."));
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const applyFilters = (next: AuditFilters) => {
        setFilters(next);
        setPage(1);
        setFiltersOpen(false);
    };

    const clearFilters = () => {
        setFilters({ tableName: "", operationType: "", performedBy: "", startDate: "", endDate: "" });
        setPage(1);
    };

    return (
        <>
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 lg:px-6 py-4 rounded-xl"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-wide">Audit Logs</h1>
                        <p className="text-blue-200 text-xs mt-0.5">
                            {pagination ? `${pagination.total.toLocaleString()} total records` : "System activity history"}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen(f => !f)}
                            className="h-10 w-full sm:w-auto px-4 rounded-lg font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {filtersOpen ? "Hide Filters" : "Filter"}
                            {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-red-400 inline-block" />}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchLogs}
                            className="h-10 w-full sm:w-10 p-0 rounded-lg border-white/30 text-white bg-white/10 hover:bg-white/20"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {filtersOpen && (
                    <AuditFilterPanel initialFilters={filters} onApply={applyFilters} onClear={clearFilters} />
                )}

                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 overflow-x-hidden">
                        <span className="text-xs font-medium" style={{ color: "#6b7280" }}>
                            Active filters:
                        </span>
                        {filters.tableName && (
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium break-all"
                                style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}
                            >
                                Module: {filters.tableName}
                            </span>
                        )}
                        {filters.operationType && (
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium break-all"
                                style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}
                            >
                                Action: {filters.operationType}
                            </span>
                        )}
                        {filters.performedBy && (
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium break-all"
                                style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}
                            >
                                Employee ID: {filters.performedBy.slice(0, 8)}...
                            </span>
                        )}
                        {filters.startDate && (
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium break-all"
                                style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}
                            >
                                From: {new Date(filters.startDate).toLocaleDateString()}
                            </span>
                        )}
                        {filters.endDate && (
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium break-all"
                                style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}
                            >
                                To: {new Date(filters.endDate).toLocaleDateString()}
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full transition-all hover:bg-red-50"
                            style={{ color: "#e8192c", border: "1px solid #fecaca" }}
                        >
                            <X className="w-3 h-3" /> Clear all
                        </button>
                    </div>
                )}

                {error && (
                    <div
                        className="px-4 py-3 rounded-lg text-sm"
                        style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                    >
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <AuditTable
                        logs={logs}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={setPage}
                        onViewDetails={setSelectedLog}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>
            </main>
            <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        </>
    );
}
