"use client"

import { Loader2, AlertCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReviewCard from "./ReviewCard"
import type { Review, ReviewCategory } from "@/types"
import { cn } from "@/lib/utils"

// ─── Review List Section ──────────────────────────────────────────────────────

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

const TABS = ["all", "given", "received"] as const

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
        <>
            {/* Tab bar */}
            <div className="flex items-center gap-2 mb-6">
                {TABS.map((tab) => (
                    <Button
                        key={tab}
                        variant={listTab === tab ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setListTab(tab)}
                        className={cn(
                            "rounded-full capitalize",
                            listTab === tab
                                ? "bg-purple-700 text-white shadow-sm hover:bg-purple-800"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Loading */}
            {loadingData && (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
            )}

            {/* Error */}
            {!loadingData && dataError && (
                <div className="flex flex-col items-center py-20 gap-3">
                    <AlertCircle className="w-10 h-10 text-red-300" />
                    <p className="text-gray-500 text-sm">{dataError}</p>
                    <button onClick={() => onLoadReviews(1)} className="text-sm text-purple-600 underline">
                        Retry
                    </button>
                </div>
            )}

            {/* Empty */}
            {!loadingData && !dataError && filteredReviews.length === 0 && (
                <div className="flex flex-col items-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-purple-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                        {listTab === "given"
                            ? "You haven't given any reviews yet."
                            : listTab === "received"
                                ? "You haven't received any reviews yet."
                                : "No reviews yet."}
                    </p>
                    {listTab !== "received" && (
                        <Button
                            variant="ghost"
                            onClick={onCompose}
                            className="text-sm text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 rounded-xl"
                        >
                            Write your first review →
                        </Button>
                    )}
                </div>
            )}

            {/* Cards grid */}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-4 pb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => onLoadReviews(page - 1)}
                                className="rounded-xl"
                            >
                                ← Prev
                            </Button>
                            <span className="text-sm text-gray-500 font-medium tabular-nums">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => onLoadReviews(page + 1)}
                                className="rounded-xl"
                            >
                                Next →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </>
    )
}
