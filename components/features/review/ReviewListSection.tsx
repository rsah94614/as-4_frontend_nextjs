"use client"

import { Loader2, AlertCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import ReviewCard from "./ReviewCard"
import type { Review, ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"

interface ReviewListSectionProps {
    filteredReviews: Review[]
    myId: string
    categories: ReviewCategory[]
    loadingData: boolean
    dataError: string | null
    listTab: "all" | "given" | "received"
    setListTab: (tab: "all" | "given" | "received") => void
    page: number
    totalPages: number
    onCompose: () => void
    onLoadReviews: (pg: number) => void
}

const TABS = [
    { key: "all", label: "All" },
    { key: "given", label: "Given" },
    { key: "received", label: "Received" },
] as const

export default function ReviewListSection({
    filteredReviews,
    myId,
    categories,
    loadingData,
    dataError,
    listTab,
    setListTab,
    page,
    totalPages,
    onCompose,
    onLoadReviews,
}: ReviewListSectionProps) {
    return (
        <div>
            <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setListTab(tab.key)}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150",
                            listTab === tab.key
                                ? "bg-white text-[#004C8F] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loadingData && (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-7 h-7 animate-spin text-[#004C8F]/30" />
                </div>
            )}

            {!loadingData && dataError && (
                <div className="flex flex-col items-center py-16 gap-3 bg-white rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#E31837]/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-[#E31837]" />
                    </div>
                    <p className="text-sm text-gray-600">{dataError}</p>
                    <button
                        onClick={() => onLoadReviews(1)}
                        className="text-sm text-[#004C8F] font-semibold underline underline-offset-2 hover:text-[#E31837] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loadingData && !dataError && filteredReviews.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            {listTab === "given"
                                ? "No recognitions given yet"
                                : listTab === "received"
                                    ? "No recognitions received yet"
                                    : "No recognitions yet"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {listTab !== "received" && "Start by recognising a teammate's contribution."}
                        </p>
                    </div>
                    {listTab !== "received" && (
                        <button
                            onClick={onCompose}
                            className="text-sm text-white font-semibold bg-[#E31837] hover:bg-[#c41230] px-5 py-2.5 rounded-lg transition-colors"
                        >
                            Write a Recognition
                        </button>
                    )}
                </div>
            )}

            {!loadingData && !dataError && filteredReviews.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReviews.map((r) => (
                            <ReviewCard
                                key={r.review_id}
                                review={r}
                                myId={myId}
                                categories={categories}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                disabled={page <= 1}
                                onClick={() => onLoadReviews(page - 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={15} />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => onLoadReviews(pg)}
                                        className={cn(
                                            "w-9 h-9 rounded-lg text-sm font-semibold transition-all",
                                            pg === page
                                                ? "bg-[#004C8F] text-white"
                                                : "text-gray-500 hover:bg-gray-100"
                                        )}
                                    >
                                        {pg}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={page >= totalPages}
                                onClick={() => onLoadReviews(page + 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}