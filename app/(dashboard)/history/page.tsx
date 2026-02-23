"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowUpRight, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/services/auth-service";

interface RewardCatalog {
    reward_name: string;
    reward_code: string;
}

interface HistoryItem {
    history_id: string;
    points: number;
    comment?: string;
    granted_at: string;
    reward_catalog?: RewardCatalog;
}

interface PaginatedHistoryResponse {
    data: HistoryItem[];
    total_items: number;
    page: number;
    size: number;
}

const REWARDS_API = process.env.NEXT_PUBLIC_REWARDS_API_URL;

export default function HistoryPage() {
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("Point History");
    const [selectedType, setSelectedType] = useState("Transaction Type");

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const PAGE_SIZE = 10;

    const periodOptions = ["Points History", "Review History", "Redeem History"];
    const typeOptions = ["All", "Gift Voucher", "Spot Award", "Merchandises"];

    useEffect(() => {
        fetchHistory(page);
    }, [page]);

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
            setHistory(json.data);
            setTotalItems(json.total_items);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function getMessage(item: HistoryItem): string {
        const name = item.reward_catalog?.reward_name ?? "a reward";
        return `You redeemed "${name}"`;
    }

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    return (
        <div className="bg-white rounded-2xl md:rounded-4xl min-h-screen shadow-2xs">
            <div className="p-4 sm:p-6 md:p-8">
                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Point History Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setPeriodDropdownOpen(!periodDropdownOpen);
                                setTypeDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {selectedPeriod}
                            <ChevronDown className={`w-4 h-4 transition-transform ${periodDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {periodDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                {periodOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedPeriod(option);
                                            setPeriodDropdownOpen(false);
                                        }}
                                        className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transaction Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setTypeDropdownOpen(!typeDropdownOpen);
                                setPeriodDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {selectedType}
                            <ChevronDown className={`w-4 h-4 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {typeDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                {typeOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedType(option);
                                            setTypeDropdownOpen(false);
                                        }}
                                        className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* History Cards */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="text-center py-12">
                            <p className="text-sm text-red-500">{error}</p>
                            <button
                                onClick={() => fetchHistory(page)}
                                className="mt-3 text-sm text-indigo-600 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && history.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-400">No history found.</p>
                        </div>
                    )}

                    {/* Data */}
                    {!loading && !error && history.map((item) => (
                        <div
                            key={item.history_id}
                            className="bg-white rounded-xl border p-3 sm:p-5 flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <ArrowUpRight className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate sm:whitespace-normal">
                                        {getMessage(item)}
                                    </p>
                                    {item.comment && (
                                        <p className="text-xs text-gray-400 truncate">{item.comment}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(item.granted_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold flex-shrink-0 text-red-500">
                                -{item.points}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm rounded-full border text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm rounded-full border text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}