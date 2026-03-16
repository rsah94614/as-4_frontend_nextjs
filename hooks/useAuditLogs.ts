"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAuditLogs } from "@/services/org-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { AuditLog, AuditFilters } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";

export function useAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Active Filter state (applied to API)
    const [filters, setFilters] = useState<AuditFilters>({
        tableName: "",
        operationType: "",
        performedBy: "",
        startDate: "",
        endDate: "",
    });

    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, pagination } = await fetchAuditLogs({
                page,
                limit: 50,
                ...(filters.tableName      && { table_name:      filters.tableName }),
                ...(filters.operationType  && { operation_type:  filters.operationType }),
                ...(filters.performedBy    && { performed_by:    filters.performedBy }),
                ...(filters.startDate      && { start_date:      new Date(filters.startDate).toISOString() }),
                ...(filters.endDate        && { end_date:        new Date(filters.endDate).toISOString() }),
            });
            setLogs(data);
            setPagination(pagination ?? null);
        } catch (err) {
            const detail = extractErrorMessage(err, "Failed to load audit logs.");
            const s = (err as { response?: { status?: number } })?.response?.status;
            setError(
                s === 401
                    ? "Your session has expired. Please log in again."
                    : detail
            );
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const applyFilters = (newFilters: AuditFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            tableName: "",
            operationType: "",
            performedBy: "",
            startDate: "",
            endDate: "",
        });
        setPage(1);
    };

    return {
        logs,
        pagination,
        loading,
        error,
        filters,
        page,
        setPage,
        applyFilters,
        clearFilters,
        refresh: fetchLogs,
    };
}
