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

    // Cache walletId so we don't re-fetch it on every pagination
    const [cachedWalletId, setCachedWalletId] = useState<string | null>(null);

    // ── Fetch on page change ──────────────────────────────────────────────────
    useEffect(() => {
        fetchHistory(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // ── Reset to page 1 when filters change ──────────────────────────────────
    useEffect(() => {
        setPage(1);
    }, [selectedPeriod, selectedType]);

    async function fetchHistory(pageNum: number) {
        setLoading(true);
        setError(null);
        try {
            const user = auth.getUser();
            
            // 1. Kick off rewards fetch immediately
            const rewardsPromise = rewardsClient.get<PaginatedHistoryResponse>(
                `/history/me?page=${pageNum}&size=${PAGE_SIZE}`
            );

            // 2. Fetch Wallet transactions concurrently
            const walletTxnPromise = (async () => {
                if (!user?.employee_id) return [];
                
                try {
                    let wId = cachedWalletId;
                    
                    // Only fetch wallet_id if we don't have it cached
                    if (!wId) {
                        const walletRes = await walletClient.get<WalletData>(
                            `/employees/${user.employee_id}`
                        );
                        wId = walletRes.data.wallet_id;
                        setCachedWalletId(wId);
                    }

                    if (wId) {
                        const txnRes = await walletClient.get<TransactionListResponse>(
                            `/transactions?wallet_id=${wId}&page=${pageNum}&limit=${PAGE_SIZE}`
                        );
                        return txnRes.data.transactions
                            .filter((txn) => txn.transaction_type.is_credit)
                            .map(transactionToHistoryItem);
                    }
                } catch (err) {
                    console.warn("Failed to fetch wallet transactions", err);
                }
                return [];
            })();

            // 3. Await both promises concurrently (eliminating waterfall)
            const [rewardsRes, pointsItems] = await Promise.all([
                rewardsPromise,
                walletTxnPromise
            ]);

            const redemptionItems: HistoryItem[] = rewardsRes.data.data || [];

            // 4. Merge and sort
            const merged = [...redemptionItems, ...pointsItems].sort(
                (a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
            );

            setAllHistory(merged);
            setTotalItems((rewardsRes.data.total_items || 0) + pointsItems.length);
        } catch (err) {
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