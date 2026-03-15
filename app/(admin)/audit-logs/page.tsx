"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { AuditLog, AuditFilters } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import orgApiClient from "@/services/org-api-client";
import { AuditTable } from "@/components/features/admin/audit-logs/AuditTable";
import { AuditDetailModal } from "@/components/features/admin/audit-logs/AuditDetailModal";
import { AuditFilterPanel } from "@/components/features/admin/audit-logs/AuditFilters";

export default function AuditLogsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
        filters.tableName || filters.operationType ||
        filters.performedBy || filters.startDate || filters.endDate
    );

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string | number> = { page, limit: 10 };
            if (filters.tableName)     params.table_name     = filters.tableName;
            if (filters.operationType) params.operation_type = filters.operationType;
            // performed_by filter is UUID — only send if it looks like a UUID
            if (filters.performedBy)   params.performed_by   = filters.performedBy;
            if (filters.startDate)     params.start_date     = new Date(filters.startDate).toISOString();
            if (filters.endDate)       params.end_date       = new Date(filters.endDate).toISOString();

            const res = await orgApiClient.get<{
                data: AuditLog[];
                // Backend returns PaginationMeta directly (current_page, per_page, total, total_pages, has_next, has_previous)
                pagination: PaginationMeta;
            }>("/audit-logs", { params });

            setLogs(res.data.data ?? []);
            // Backend already returns the correct PaginationMeta shape — use it directly, no remapping
            setPagination(res.data.pagination ?? null);

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
    }, [page, filters]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

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
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#eef0f8" }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Blue header bar */}
                    <div
                        className="flex items-center justify-between px-6 py-4 rounded-xl"
                        style={{ backgroundColor: "#1a4ab5" }}
                    >
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-wide">Audit Logs</h1>
                            <p className="text-blue-200 text-xs mt-0.5">
                                {pagination ? `${pagination.total.toLocaleString()} total records` : "System activity history"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setFiltersOpen(f => !f)}
                                className="h-10 px-4 rounded-lg font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {filtersOpen ? "Hide Filters" : "Filter"}
                                {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-red-400 inline-block" />}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={fetchLogs}
                                className="h-10 w-10 p-0 rounded-lg border-white/30 text-white bg-white/10 hover:bg-white/20"
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Filter panel */}
                    {filtersOpen && (
                        <AuditFilterPanel
                            initialFilters={filters}
                            onApply={applyFilters}
                            onClear={clearFilters}
                        />
                    )}

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium" style={{ color: "#6b7280" }}>Active filters:</span>
                            {filters.tableName && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}>
                                    Module: {filters.tableName}
                                </span>
                            )}
                            {filters.operationType && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}>
                                    Action: {filters.operationType}
                                </span>
                            )}
                            {filters.performedBy && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}>
                                    Employee ID: {filters.performedBy.slice(0, 8)}…
                                </span>
                            )}
                            {filters.startDate && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}>
                                    From: {new Date(filters.startDate).toLocaleDateString()}
                                </span>
                            )}
                            {filters.endDate && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#eff6ff", color: "#1a4ab5", border: "1px solid #bfdbfe" }}>
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

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}>
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm">
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
            </div>

            <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
    );
}