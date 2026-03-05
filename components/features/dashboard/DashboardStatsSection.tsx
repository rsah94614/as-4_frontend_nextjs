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
            stat: data?.total_points,
            icon: Users,
            color: "bg-[#FFE69C]",
        },
        {
            label: "Rewards Redeemed:",
            stat: data?.rewards_redeemed,
            icon: Trophy,
            color: "bg-[#EED9FF]"
        },
        {
            label: "Reviews Received:",
            stat: data?.reviews_received,
            icon: LayoutGrid,
            color: "bg-[#D1FFD7]"
        },
        {
            label: "Active Users:",
            stat: data?.active_users,
            icon: TrendingUp,
            color: "bg-[#DFDFFF]"
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
