"use client"

import { AlertCircle, MessageSquare, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import ReviewCard from "./RecognitionHistoryCard"
import { ReviewListSkeleton } from "./ReviewPageSkeleton"
import type { Review, ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Helper to generate pagination window
function getPaginationArray(current: number, total: number) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    if (current <= 4) {
        return [1, 2, 3, 4, 5, "...", total]
    }

    if (current >= total - 3) {
        return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    }

    return [1, "...", current - 1, current, current + 1, "...", total]
}

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
    const paginationItems = getPaginationArray(page, totalPages)

    return (
        <div>
            <Tabs 
                value={listTab} 
                onValueChange={(val) => setListTab(val as "all" | "given" | "received")}
                className="mb-6 sm:mb-8"
            >
                <TabsList className="bg-gray-100 p-1 h-auto">
                    {TABS.map((tab) => (
                        <TabsTrigger 
                            key={tab.key} 
                            value={tab.key}
                            className={cn(
                                "px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 data-[state=active]:bg-white data-[state=active]:text-[#004C8F] data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {loadingData && <ReviewListSkeleton />}

            {!loadingData && dataError && (
                <div className="flex flex-col items-center py-16 gap-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#E31837]/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-[#E31837]" />
                    </div>
                    <p className="text-sm text-gray-600">{dataError}</p>
                    <Button 
                        variant="link" 
                        onClick={() => onLoadReviews(1)}
                        className="text-[#004C8F] font-semibold hover:text-[#E31837]"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {!loadingData && !dataError && filteredReviews.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
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
                        <p className="text-xs text-gray-400 mt-1 mb-4">
                            {listTab !== "received" && "Start by recognising a teammate's contribution."}
                        </p>
                    </div>
                    {listTab !== "received" && (
                        <Button 
                            onClick={onCompose}
                            className="bg-[#E31837] hover:bg-[#c41230] text-white px-6 font-semibold shadow-sm"
                        >
                            Write a Recognition
                        </Button>
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
                        <div className="flex items-center justify-center gap-1.5 mt-10">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page <= 1}
                                onClick={() => onLoadReviews(page - 1)}
                                className="w-9 h-9 border-gray-200 text-gray-500 hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {paginationItems.map((item, idx) => {
                                    if (item === "...") {
                                        return (
                                            <div key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400">
                                                <MoreHorizontal size={16} />
                                            </div>
                                        )
                                    }
                                    
                                    const pg = item as number;
                                    const isActive = pg === page;
                                    
                                    return (
                                        <Button
                                            key={pg}
                                            variant={isActive ? "default" : "ghost"}
                                            onClick={() => onLoadReviews(pg)}
                                            className={cn(
                                                "w-9 h-9 p-0 font-semibold text-sm",
                                                isActive 
                                                    ? "bg-[#004C8F] text-white hover:bg-[#003a6e]" 
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            )}
                                        >
                                            {pg}
                                        </Button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page >= totalPages}
                                onClick={() => onLoadReviews(page + 1)}
                                className="w-9 h-9 border-gray-200 text-gray-500 hover:bg-gray-50"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}