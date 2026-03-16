import { LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/features/dashboard/user/DashboardCard";
import { useEffect, useState } from "react";
import { PlatformStatsResponse } from "@/types/dashboard-types";
import { fetchDashboardPlatformStats } from "@/services/analytics-service";

const CARDS = [
    {
        label: "Total Points",
        icon: Users,
        key: "total_points" as const,
        gradient: "from-[#004C8F] to-[#1D6EC5]",
    },
    {
        label: "Rewards Redeemed",
        icon: Trophy,
        key: "rewards_redeemed" as const,
        gradient: "from-[#6D28D9] to-[#8B5CF6]",
    },
    {
        label: "Reviews Received",
        icon: LayoutGrid,
        key: "reviews_received" as const,
        gradient: "from-[#0D9488] to-[#0891B2]",
    },
    {
        label: "Active Users",
        icon: TrendingUp,
        key: "active_users" as const,
        gradient: "from-[#C2410C] to-[#F59E0B]",
    },
];

export default function DashboardStatsSection({ initialData }: { initialData?: PlatformStatsResponse | null }) {
    const [data, setData] = useState<PlatformStatsResponse | null>(initialData ?? null);
    const [loading, setLoading] = useState(!initialData);

    // Sync prop to state during render
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        if (initialData) {
            setData(initialData);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialData) return;

        async function load() {
            setLoading(true);
            const result = await fetchDashboardPlatformStats();
            setData(result);
            setLoading(false);
        }
        load();
    }, [initialData]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARDS.map((card) => (
                <DashboardCard
                    key={card.label}
                    label={card.label}
                    stat={data?.[card.key]}
                    icon={card.icon}
                    gradient={card.gradient}
                    loading={loading}
                />
            ))}
        </div>
    );
}
