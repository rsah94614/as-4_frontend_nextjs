"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/features/dashboard/DashboardCard";
import DashboardRecognitionSection from "@/components/features/dashboard/DashboardRecognitionSection";
import DashboardLeaderboardSection from "@/components/features/dashboard/DashboardLeaderboardSection";
import { DASHBOARD_CARDS } from "@/components/features/dashboard/dashboard-cards.config";
import {
    fetchDashboardSummary,
    type DashboardSummaryResponse,
} from "@/services/analytics-service";

export default function DashboardPage() {
    const [data, setData] = useState<DashboardSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardSummary().then((result) => {
            setData(result);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {DASHBOARD_CARDS.map((card) => (
                    <DashboardCard
                        key={card.label}
                        label={card.label}
                        icon={card.icon}
                        iconBgColor={card.color}
                        stat={data?.platform_stats?.[card.statKey]}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Recent Reviews & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
                <DashboardRecognitionSection
                    reviews={data?.recent_reviews ?? []}
                    loading={loading}
                />
                <DashboardLeaderboardSection
                    entries={data?.leaderboard ?? []}
                    loading={loading}
                />
            </div>
        </div>
    );
}