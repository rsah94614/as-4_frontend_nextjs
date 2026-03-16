"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardRecognitionCard from "./DashboardRecognitionCard";
import { fetchDashboardRecentReviews } from "@/services/analytics-service";
import { userInitials, formatTime } from "@/lib/dashboard-utils";
import type { RecentReviewResponse } from "@/types/dashboard-types";

const AVATAR_COLORS = [
    "bg-[#004C8F]", "bg-[#6D28D9]", "bg-[#0D9488]",
    "bg-[#C2410C]", "bg-[#0891B2]",
];

function RecognitionSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex gap-1.5">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

const DashboardRecognitionSection = ({ initialData }: { initialData?: RecentReviewResponse[] | null }) => {
    const [reviews, setReviews] = useState<RecentReviewResponse[]>(initialData ?? []);
    const [loading, setLoading] = useState(!initialData);

    // Sync prop to state during render
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        if (initialData) {
            setReviews(initialData);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialData) return;

        async function load() {
            setLoading(true);
            const result = await fetchDashboardRecentReviews();
            setReviews(result ?? []);
            setLoading(false);
        }
        load();
    }, [initialData]);

    const items = reviews.map((r, i) => ({
        id: r.review_id,
        from: r.reviewer_name,
        fromInitials: userInitials(r.reviewer_name),
        to: "you",
        toInitials: "",
        message: r.comment,
        tags: r.tags ?? [],
        time: formatTime(r.review_at),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        image: null,
    }));

    return (
        <section className="lg:col-span-3 flex flex-col gap-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
                    <p className="text-xs text-gray-400 mt-0.5">What your peers are saying</p>
                </div>
                {!loading && items.length > 0 && (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {items.length} reviews
                    </span>
                )}
            </div>

            {/* Content */}
            {loading && <RecognitionSkeleton />}

            {!loading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Reviews from your peers will show up here.</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="space-y-3">
                    {items.map((item) => (
                        <DashboardRecognitionCard key={item.id} {...item} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default DashboardRecognitionSection;
