"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

/* ── Skeleton for the compose form (left column) ── */
function ComposeFormSkeleton() {
    return (
        <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-px w-6" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-px w-6" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                </div>
            </div>

            <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Step 01: Receiver */}
                <div>
                    <Skeleton className="h-3 w-40 mb-3" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* Step 02: Categories */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-3 w-44" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Step 03: Feedback */}
                <div>
                    <Skeleton className="h-3 w-28 mb-3" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>

                {/* Attachments */}
                <div>
                    <Skeleton className="h-3 w-44 mb-3" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            </CardContent>

            {/* Submit bar */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
        </Card>
    )
}

/* ── Skeleton for the sidebar (right column) ── */
function SidebarSkeleton() {
    return (
        <div className="space-y-4">
            {/* Activity card */}
            <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-200 flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <div className="divide-y divide-gray-100">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-4">
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-2.5 w-20" />
                            </div>
                            <Skeleton className="h-7 w-8" />
                        </div>
                    ))}
                </div>
            </Card>

            {/* How It Works card */}
            <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-200 flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <div className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 px-5 py-3.5">
                            <Skeleton className="h-3 w-6 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-2.5 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

/* ── Skeleton for a single review card ── */
function ReviewCardSkeleton() {
    return (
        <Card className="rounded-xl overflow-hidden border-gray-200">
            <div className="h-0.5 w-full bg-gray-100" />
            <CardContent className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                </div>
                {/* Category tags */}
                <div className="flex gap-1.5 mb-3">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                {/* Comment */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <Skeleton className="h-2.5 w-24" />
                </div>
            </CardContent>
        </Card>
    )
}

/* ── Skeleton for the review list section ── */
export function ReviewListSkeleton() {
    return (
        <div>
            {/* Tabs */}
            <div className="mb-8">
                <Skeleton className="h-10 w-56 rounded-lg" />
            </div>
            {/* Card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ReviewCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

/* ── Full page skeleton ── */
export default function ReviewPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <ComposeFormSkeleton />
            </div>
            <SidebarSkeleton />
        </div>
    )
}
