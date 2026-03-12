"use client";

import { useState, useEffect, useMemo } from "react";
// 1. Swap fetchWithAuth for our Axios client builder
import { createAuthenticatedClient } from "@/lib/api-utils";
import { matchesPeriod, matchesType } from "./history-utils";
import { PAGE_SIZE } from "./constants";
import type {
    HistoryItem,
    PaginatedHistoryResponse,
    PeriodFilter,
    TypeFilter,
} from "./types";

// 2. Create the proxy client
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");

export function useHistoryData() {
    // ── Filter state ──────────────────────────────────────────────────────────
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("All History");
    const [selectedType, setSelectedType] = useState<TypeFilter>("All");

    // ── Data state ────────────────────────────────────────────────────────────
    const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // ── Fetch on page change ──────────────────────────────────────────────────
    useEffect(() => {
        fetchHistory(page);
    }, [page]);

    // ── Reset to page 1 when filters change ──────────────────────────────────
    useEffect(() => {
        setPage(1);
    }, [selectedPeriod, selectedType]);

    async function fetchHistory(pageNum: number) {
        setLoading(true);
        setError(null);
        try {
            // 3. Use the Axios client with relative paths
            const res = await rewardsClient.get<PaginatedHistoryResponse>(
                `/history/me?page=${pageNum}&size=${PAGE_SIZE}`
            );

            // Axios automatically resolves JSON into the `.data` property
            // and throws an error automatically if the status is not 2xx.
            setAllHistory(res.data.data);
            setTotalItems(res.data.total_items);
            
        } catch (err: unknown) {
            // 4. Handle Axios errors properly to extract backend details
            const e = err as { response?: { data?: { detail?: string } }, message?: string };
            setError(e.response?.data?.detail || e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    // ── Client-side filtering ─────────────────────────────────────────────────
    const filteredHistory = useMemo(
        () =>
            allHistory.filter(
                (item) =>
                    matchesPeriod(item, selectedPeriod) &&
                    matchesType(item, selectedType)
            ),
        [allHistory, selectedPeriod, selectedType]
    );

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    function clearFilters() {
        setSelectedPeriod("All History");
        setSelectedType("All");
    }

    return {
        // filters
        selectedPeriod,
        setSelectedPeriod,
        selectedType,
        setSelectedType,
        clearFilters,
        // data
        allHistory,
        filteredHistory,
        loading,
        error,
        page,
        setPage,
        totalItems,
        totalPages,
        retry: () => fetchHistory(page),
    };
}