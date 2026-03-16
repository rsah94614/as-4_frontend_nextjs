"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchAllDashboardData, type DashboardData } from "@/services/analytics-service";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardHeroSection from "../features/dashboard/user/DashboardHeroSection";

const DashboardStatsSection = dynamic(() => import("../features/dashboard/user/DashboardStatsSection"), {
    loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>,
});
const DashboardRecognitionSection = dynamic(() => import("../features/dashboard/user/DashboardRecognitionSection"), {
    loading: () => <div className="lg:col-span-3 space-y-4">
        <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
        </div>
        <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
    </div>,
});
const DashboardLeaderboardSection = dynamic(() => import("../features/dashboard/user/DashboardLeaderboardSection"), {
    loading: () => <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-[480px] w-full rounded-2xl" />
    </div>,
});

export default function UserDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        async function load() {
            const result = await fetchAllDashboardData();
            setData(result);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            {/* Hero greeting */}
            <DashboardHeroSection />
            {/* Stats */}
            <DashboardStatsSection initialData={data?.platformStats} />

            {/* Reviews + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <DashboardRecognitionSection initialData={data?.recentReviews} />
                <DashboardLeaderboardSection initialData={data?.leaderboard} />
            </div>
        </div>
    );
}