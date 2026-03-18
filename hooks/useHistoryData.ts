"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import { auth } from "@/services/auth-service";
import { matchesPeriod, matchesType } from "@/lib/history-utils";
import { PAGE_SIZE } from "@/components/features/dashboard/history/constants";
import type {
    HistoryItem,
    PaginatedHistoryResponse,
    PeriodFilter,
    TypeFilter,
} from "@/types/history-types";

// ── Proxy clients ────────────────────────────────────────────────────────────
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");
const walletClient = createAuthenticatedClient("/api/proxy/wallet");

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

function transactionToHistoryItem(txn: Transaction): HistoryItem {
    return {
        history_id: txn.transaction_id,
        points: txn.amount,
        comment: txn.description ?? "Points earned",
        granted_at: txn.transaction_at,
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

    // Use a ref so caching the wallet ID doesn't trigger a re-render mid-fetch
    const cachedWalletIdRef = useRef<string | null>(null);

    // ── Fetch history ─────────────────────────────────────────────────────────
    const fetchHistory = useCallback(async (pageNum: number) => {
        setLoading(true);
        setError(null);
        try {
            const user = auth.getUser();

            // 1. Fetch reward redemptions — handled gracefully so a missing/failing
            //    endpoint doesn't block the wallet transaction data from showing.
            const rewardsPromise = (async (): Promise<{ items: HistoryItem[]; total: number }> => {
                try {
                    const res = await rewardsClient.get<PaginatedHistoryResponse>(
                        `/history/me?page=${pageNum}&size=${PAGE_SIZE}`
                    );
                    return {
                        items: res.data.data ?? [],
                        total: res.data.total_items ?? 0,
                    };
                } catch {
                    return { items: [], total: 0 };
                }
            })();

            // 2. Fetch wallet credit transactions concurrently
            const walletTxnPromise = (async (): Promise<{ items: HistoryItem[]; total: number }> => {
                if (!user?.employee_id) return { items: [], total: 0 };

                try {
                    // Only fetch wallet_id once; reuse from ref on subsequent calls
                    if (!cachedWalletIdRef.current) {
                        const walletRes = await walletClient.get<WalletData>(
                            `/employees/${user.employee_id}`
                        );
                        cachedWalletIdRef.current = walletRes.data.wallet_id;
                    }

                    const wId = cachedWalletIdRef.current;
                    if (wId) {
                        const txnRes = await walletClient.get<TransactionListResponse>(
                            `/transactions?wallet_id=${wId}&page=${pageNum}&limit=${PAGE_SIZE}`
                        );
                        const items = txnRes.data.transactions
                            .filter((txn) => txn.transaction_type.is_credit)
                            .map(transactionToHistoryItem);
                        return { items, total: txnRes.data.total };
                    }
                } catch (err) {
                    console.warn("Failed to fetch wallet transactions", err);
                }
                return { items: [], total: 0 };
            })();

            // 3. Await both concurrently — neither can crash the other
            const [rewardsResult, walletResult] = await Promise.all([
                rewardsPromise,
                walletTxnPromise,
            ]);

            // 4. Merge and sort by date descending
            const merged = [...rewardsResult.items, ...walletResult.items].sort(
                (a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
            );

            setAllHistory(merged);
            setTotalItems(rewardsResult.total + walletResult.total);
        } catch (err) {
            setError(extractErrorMessage(err, "Something went wrong fetching history"));
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch on page change ──────────────────────────────────────────────────
    useEffect(() => {
        fetchHistory(page);
    }, [page, fetchHistory]);

    // ── Reset to page 1 when filters change ──────────────────────────────────
    // Filtering is client-side so no re-fetch needed; resetting page to 1
    // is enough (and will trigger a re-fetch if page was > 1).
    useEffect(() => {
        setPage(1);
    }, [selectedPeriod, selectedType]);

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

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

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
