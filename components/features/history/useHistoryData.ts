"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "@/services/auth-service";
import { matchesPeriod, matchesType } from "./history-utils";
import { PAGE_SIZE } from "./constants";
import type {
    HistoryItem,
    PaginatedHistoryResponse,
    PeriodFilter,
    TypeFilter,
} from "./types";

const REWARDS_API = process.env.NEXT_PUBLIC_REWARDS_API_URL;

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
            const res = await fetchWithAuth(
                `${REWARDS_API}/v1/rewards/history/me?page=${pageNum}&size=${PAGE_SIZE}`
            );

            if (!res.ok) {
                throw new Error(`Failed to fetch history (${res.status})`);
            }

            const json: PaginatedHistoryResponse = await res.json();
            setAllHistory(json.data);
            setTotalItems(json.total_items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
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
