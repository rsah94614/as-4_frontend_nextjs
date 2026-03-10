"use client";

import { useState, useEffect, useCallback } from "react";
import { designationService } from "@/services/designation-service";
import {
    Designation,
    DesignationListResponse,
} from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";

export function useDesignations() {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const loadDesignations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: DesignationListResponse = await designationService.list({
                page,
                limit: 20,
            });
            setDesignations(res.data);
            setPagination(res.pagination);
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load designations.";
            setError(detail);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadDesignations();
    }, [loadDesignations]);

    const refresh = () => loadDesignations();

    return {
        designations,
        pagination,
        loading,
        error,
        page,
        setPage,
        search,
        setSearch,
        refresh,
    };
}
