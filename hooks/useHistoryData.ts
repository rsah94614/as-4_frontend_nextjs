"use client";

import { useEffect, useMemo, useState } from "react";
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

const FETCH_BATCH_SIZE = 100;

const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");
const walletClient = createAuthenticatedClient("/api/proxy/wallet");

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

function walletDebitToHistoryItem(txn: Transaction): HistoryItem {
    return {
        history_id: txn.transaction_id,
        points: txn.amount,
        comment: txn.description ?? "Reward redeemed",
        granted_at: txn.transaction_at,
        reward_catalog: {
            reward_name: txn.description ?? "Reward redeemed",
            reward_code: "WALLET-REDEEM",
        },
    };
}

function isLikelyDuplicateRedemption(
    rewardsHistoryItem: HistoryItem,
    walletHistoryItem: HistoryItem
): boolean {
    if (!rewardsHistoryItem.reward_catalog || !walletHistoryItem.reward_catalog) {
        return false;
    }

    const timeDiffMs = Math.abs(
        new Date(rewardsHistoryItem.granted_at).getTime() -
            new Date(walletHistoryItem.granted_at).getTime()
    );

    return rewardsHistoryItem.points === walletHistoryItem.points && timeDiffMs <= 5 * 60 * 1000;
}

export function useHistoryData() {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("All History");
    const [selectedType, setSelectedType] = useState<TypeFilter>("All");

    const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [cachedWalletId, setCachedWalletId] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setPage(1);
    }, [selectedPeriod, selectedType]);

    useEffect(() => {
        if (selectedPeriod === "Points History" && selectedType !== "All") {
            setSelectedType("All");
        }
    }, [selectedPeriod, selectedType]);

    async function fetchAllRewardHistory(): Promise<HistoryItem[]> {
        let currentPage = 1;
        let totalRewardItems = 0;
        const rewardItems: HistoryItem[] = [];

        do {
            const response = await rewardsClient.get<PaginatedHistoryResponse>(
                `/history/me?page=${currentPage}&size=${FETCH_BATCH_SIZE}`
            );
            const pageItems = response.data.data || [];
            totalRewardItems = response.data.total_items || 0;
            rewardItems.push(...pageItems);
            currentPage += 1;

            if (pageItems.length === 0) {
                break;
            }
        } while (rewardItems.length < totalRewardItems);

        return rewardItems;
    }

    async function fetchAllWalletHistory(employeeId?: string): Promise<{
        pointItems: HistoryItem[];
        walletRedemptionItems: HistoryItem[];
    }> {
        if (!employeeId) {
            return {
                pointItems: [],
                walletRedemptionItems: [],
            };
        }

        try {
            let walletId = cachedWalletId;

            if (!walletId) {
                const walletRes = await walletClient.get<WalletData>(`/employees/${employeeId}`);
                walletId = walletRes.data.wallet_id;
                setCachedWalletId(walletId);
            }

            if (!walletId) {
                return {
                    pointItems: [],
                    walletRedemptionItems: [],
                };
            }

            let currentPage = 1;
            let totalTransactions = 0;
            const transactions: Transaction[] = [];

            do {
                const txnRes = await walletClient.get<TransactionListResponse>(
                    `/transactions?wallet_id=${walletId}&page=${currentPage}&limit=${FETCH_BATCH_SIZE}`
                );
                const pageTransactions = txnRes.data.transactions || [];
                totalTransactions = txnRes.data.total ?? 0;
                transactions.push(...pageTransactions);
                currentPage += 1;

                if (pageTransactions.length === 0) {
                    break;
                }
            } while (transactions.length < totalTransactions);

            return {
                pointItems: transactions
                    .filter((txn) => txn.transaction_type.is_credit)
                    .map(transactionToHistoryItem),
                walletRedemptionItems: transactions
                    .filter((txn) => !txn.transaction_type.is_credit)
                    .map(walletDebitToHistoryItem),
            };
        } catch (err) {
            console.warn("Failed to fetch wallet transactions", err);
            return {
                pointItems: [],
                walletRedemptionItems: [],
            };
        }
    }

    async function fetchHistory() {
        setLoading(true);
        setError(null);

        try {
            const user = auth.getUser();

            const [redemptionItems, walletData] = await Promise.all([
                fetchAllRewardHistory(),
                fetchAllWalletHistory(user?.employee_id),
            ]);

            const fallbackRedemptionItems = walletData.walletRedemptionItems.filter(
                (walletItem) =>
                    !redemptionItems.some((rewardItem) =>
                        isLikelyDuplicateRedemption(rewardItem, walletItem)
                    )
            );

            const merged = [
                ...redemptionItems,
                ...fallbackRedemptionItems,
                ...walletData.pointItems,
            ].sort(
                (a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
            );

            setAllHistory(merged);
        } catch (err) {
            setError(extractErrorMessage(err, "Something went wrong fetching history"));
        } finally {
            setLoading(false);
        }
    }

    const filteredHistory = useMemo(
        () =>
            allHistory.filter(
                (item) =>
                    matchesPeriod(item, selectedPeriod) &&
                    matchesType(item, selectedType)
            ),
        [allHistory, selectedPeriod, selectedType]
    );

    const totalItems = filteredHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const paginatedHistory = useMemo(() => {
        const startIndex = (page - 1) * PAGE_SIZE;
        return filteredHistory.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredHistory, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    function clearFilters() {
        setSelectedPeriod("All History");
        setSelectedType("All");
    }

    return {
        selectedPeriod,
        setSelectedPeriod,
        selectedType,
        setSelectedType,
        clearFilters,
        allHistory,
        filteredHistory,
        paginatedHistory,
        loading,
        error,
        page,
        setPage,
        totalItems,
        totalPages,
        retry: fetchHistory,
    };
}
