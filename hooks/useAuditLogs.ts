"use client";

import { useState, useEffect, useCallback } from "react";
import orgApiClient from "@/services/org-api-client";
import { extractErrorMessage } from "@/lib/error-utils";
import { AuditLog, AuditFilters, AuditLogsResponse } from "@/types/audit-types";
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
            const params: Record<string, string | number> = { page, limit: 50 };
            if (filters.tableName) params.table_name = filters.tableName;
            if (filters.operationType) params.operation_type = filters.operationType;
            if (filters.performedBy) params.performed_by = filters.performedBy;
            if (filters.startDate) params.start_date = new Date(filters.startDate).toISOString();
            if (filters.endDate) params.end_date = new Date(filters.endDate).toISOString();

            const res = await orgApiClient.get<AuditLogsResponse>("/audit-logs", { params });
            setLogs(res.data.data ?? []);
            setPagination(res.data.pagination ?? null);
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
