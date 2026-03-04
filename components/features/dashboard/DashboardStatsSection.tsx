import { LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/features/dashboard/DashboardCard";
import { useEffect, useState } from "react";
import { PlatformStatsResponse } from "@/types/dashboard-types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
    fetchDashboardPlatformStats,
} from "@/services/analytics-service";

function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="rounded-3xl border-0 shadow-none h-full">
                    <CardContent className="px-6 py-4 flex flex-col gap-6">
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 space-y-2 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-9 w-20" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        </div>
                        <Skeleton className="h-4 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Compute growth_percent from this_month / last_month for DashboardCard's stat prop
function growthPct(thisMonth: number | null, lastMonth: number | null): number | null {
    if (thisMonth === null || lastMonth === null) return null;
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return parseFloat((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(0));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardStatsSection() {

    const [data, setData] = useState<PlatformStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await fetchDashboardPlatformStats();
            setData(result);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <DashboardStatsSkeleton />;


    const cards = [
        {
            label: "Total Points:",
            stat: {
                value: data?.total_points.value ?? null,
                growth_percent: growthPct(data?.total_points.this_month ?? null, data?.total_points.last_month ?? null),
            },
            icon: Users,
            color: "bg-[#FFE69C]",
        },
        {
            label: "Rewards Redeemed:",
            stat: {
                value: data?.rewards_redeemed.value ?? null,
                growth_percent: growthPct(data?.rewards_redeemed.this_month ?? null, data?.rewards_redeemed.last_month ?? null),
            },
            icon: Trophy,
            color: "bg-[#EED9FF]",
        },
        {
            label: "Reviews Received:",
            stat: {
                value: data?.reviews_received.value ?? null,
                growth_percent: growthPct(data?.reviews_received.this_month ?? null, data?.reviews_received.last_month ?? null),
            },
            icon: LayoutGrid,
            color: "bg-[#D1FFD7]",
        },
        {
            label: "Active Users:",
            stat: {
                value: data?.active_users.value ?? null,
                growth_percent: growthPct(data?.active_users.this_month ?? null, data?.active_users.last_month ?? null),
            },
            icon: TrendingUp,
            color: "bg-[#DFDFFF]",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cards.map((card) => (
                <DashboardCard
                    key={card.label}
                    label={card.label}
                    stat={card.stat}
                    icon={card.icon}
                    iconBgColor={card.color}
                />
            ))}
        </div>
    );
}
