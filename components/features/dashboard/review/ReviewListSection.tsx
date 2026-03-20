"use client"

import { AlertCircle, MessageSquare } from "lucide-react"
import ReviewCard from "./RecognitionHistoryCard"
import { ReviewListSkeleton } from "./ReviewPageSkeleton"
import type { Review, ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaginationControls from "@/components/shared/PaginationControls"

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
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                            hasPrevious={page > 1}
                            hasNext={page < totalPages}
                            onPageChange={onLoadReviews}
                            className="mt-10"
                        />
                    )}
                </>
            )}
        </div>
    )
}
