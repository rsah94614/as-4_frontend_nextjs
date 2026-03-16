"use client";

import { useState, useEffect, useMemo } from "react";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import { auth } from "@/services/auth-service";
import { matchesPeriod, matchesType } from "../lib/history-utils";
import { PAGE_SIZE } from "../components/features/history/constants";
import type {
    HistoryItem,
    PaginatedHistoryResponse,
    PeriodFilter,
    TypeFilter,
} from "../types/history-types";

// ── Proxy clients ────────────────────────────────────────────────────────────
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");
const walletClient  = createAuthenticatedClient("/api/proxy/wallet");

// ── Wallet transaction types (mirrors backend) ──────────────────────────────
interface TransactionType {
    type_id: string;
    code: string;
    name: string;
    is_credit: boolean;
}

interface Transaction {
    transaction_id: string;
    wallet_id: string;
    amount: number;
    transaction_type: TransactionType;
    description: string | null;
    transaction_at: string;
}

interface TransactionListResponse {
    page: number;
    limit: number;
    total: number;
    transactions: Transaction[];
}

interface WalletData {
    wallet_id: string;
    employee_id: string;
    available_points: number;
}

/**
 * Convert a credit (points-earned) transaction into a HistoryItem shape.
 * These items have NO `reward_catalog`, so matchesPeriod("Points History")
 * returns true for them.
 */
function transactionToHistoryItem(txn: Transaction): HistoryItem {
    return {
        history_id: txn.transaction_id,
        points: txn.amount,
        comment: txn.description ?? "Points earned",
        granted_at: txn.transaction_at,
        // No reward_catalog → "Points History" filter will include these
        reward_catalog: undefined,
    };
}

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
            // 1. Fetch reward redemption history (items WITH reward_catalog)
            const rewardsRes = await rewardsClient.get<PaginatedHistoryResponse>(
                `/history/me?page=${pageNum}&size=${PAGE_SIZE}`
            );
            const redemptionItems: HistoryItem[] = rewardsRes.data.data;

            // 2. Fetch credit transactions (points earned) from wallet service
            let pointsItems: HistoryItem[] = [];
            try {
                const user = auth.getUser();
                if (user?.employee_id) {
                    const walletRes = await walletClient.get<WalletData>(
                        `/employees/${user.employee_id}`
                    );
                    const walletId = walletRes.data.wallet_id;

                    if (walletId) {
                        const txnRes = await walletClient.get<TransactionListResponse>(
                            `/transactions?wallet_id=${walletId}&page=${pageNum}&limit=${PAGE_SIZE}`
                        );
                        // Only include credit (points-earned) transactions
                        pointsItems = txnRes.data.transactions
                            .filter((txn) => txn.transaction_type.is_credit)
                            .map(transactionToHistoryItem);
                    }
                }
            } catch (err) {
                // Wallet fetch failed — still show redemption history
                console.warn("Failed to fetch wallet transactions for points history", err);
            }

            // 3. Merge both sources, sort by date descending
            const merged = [...redemptionItems, ...pointsItems].sort(
                (a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
            );

            setAllHistory(merged);
            // Total items = redemption total + points items fetched
            setTotalItems(
                rewardsRes.data.total_items + pointsItems.length
            );
        } catch (err) {
            // 4. Handle Axios errors properly using the extraction utility
            setError(extractErrorMessage(err, "Something went wrong fetching history"));
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