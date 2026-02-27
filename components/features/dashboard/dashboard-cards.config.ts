import { Users, Trophy, LayoutGrid, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardCardConfig {
    label: string;
    statKey: "total_points" | "rewards_redeemed" | "reviews_received" | "active_users";
    icon: LucideIcon;
    color: string;
}

export const DASHBOARD_CARDS: DashboardCardConfig[] = [
    {
        label: "Total Points",
        statKey: "total_points",
        icon: Users,
        color: "bg-[#FFE69C]",
    },
    {
        label: "Rewards Redeemed",
        statKey: "rewards_redeemed",
        icon: Trophy,
        color: "bg-[#EED9FF]",
    },
    {
        label: "Reviews Received",
        statKey: "reviews_received",
        icon: LayoutGrid,
        color: "bg-[#D1FFD7]",
    },
    {
        label: "Active Users",
        statKey: "active_users",
        icon: TrendingUp,
        color: "bg-[#DFDFFF]",
    },
];