"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Review Stats Section ─────────────────────────────────────────────────────

interface ReviewStatsSectionProps {
    givenThisMonth: number
    uniquePeopleCount: number
    totalReviews: number
    loading?: boolean
}

function ReviewStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {[0, 1].map((i) => (
                <Card key={i} className="rounded-2xl border-0 shadow-none">
                    <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-4 w-36" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function ReviewStatsSection({
    givenThisMonth,
    uniquePeopleCount,
    totalReviews,
    loading,
}: ReviewStatsSectionProps) {
    if (loading) return <ReviewStatsSkeleton />

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Card className="rounded-2xl border-0 shadow-none bg-indigo-200/60 border-indigo-200/40">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-500">Given This Month</p>
                    <h2 className="text-3xl font-semibold mt-2 text-gray-900">{givenThisMonth}</h2>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                        <span>Unique people</span>
                        <span>{uniquePeopleCount}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-none bg-green-200/60 border-green-200/40">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-500">Total Reviews</p>
                    <h2 className="text-3xl font-semibold mt-2 text-gray-900">{totalReviews}</h2>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                        <span>Given &amp; received</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
