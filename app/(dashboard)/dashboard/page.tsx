"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/features/dashboard/DashboardCard";
import DashboardRecognitionSection from "@/components/features/dashboard/DashboardRecogntionSection";
import DashboardLeaderboardSection from "@/components/features/dashboard/DashboardLeaderboardSection";
import {
  fetchDashboardSummary,
  type DashboardSummaryResponse,
  type LeaderboardEntry,
  type RecentReview,
} from "@/services/analytics-service";

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatGrowth(pct: number | null): string | undefined {
  if (pct === null || pct === undefined) return undefined;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}%`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await fetchDashboardSummary();
      setData(result);
      setLoading(false);
    }
    load();
  }, []);

  const stats = data?.platform_stats;

  const cards = [
    {
      label: "Total Points:",
      value: formatNumber(stats?.total_points.value ?? null),
      icon: Users,
      color: "bg-[#FFE69C]",
      change: formatGrowth(stats?.total_points.growth_percent ?? null),
      loading,
    },
    {
      label: "Rewards Redeemed:",
      value: formatNumber(stats?.rewards_redeemed.value ?? null),
      icon: Trophy,
      color: "bg-[#EED9FF]",
      change: formatGrowth(stats?.rewards_redeemed.growth_percent ?? null),
      loading,
    },
    {
      label: "Reviews Received:",
      value: formatNumber(stats?.reviews_received.value ?? null),
      icon: LayoutGrid,
      color: "bg-[#D1FFD7]",
      change: formatGrowth(stats?.reviews_received.growth_percent ?? null),
      loading,
    },
    {
      label: "Active Users:",
      value: formatNumber(stats?.active_users.value ?? null),
      icon: TrendingUp,
      color: "bg-[#DFDFFF]",
      change: formatGrowth(stats?.active_users.growth_percent ?? null),
      loading,
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <DashboardCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            iconBgColor={card.color}
            change={card.change}
          />
        ))}
      </div>

      {/* Recent Recognitions & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* Recent Reviews – wider (3 of 5 cols) */}
        <DashboardRecognitionSection
          reviews={data?.recent_reviews ?? []}
          loading={loading}
        />

        {/* Leaderboard – narrower (2 of 5 cols) */}
        <DashboardLeaderboardSection
          entries={data?.leaderboard ?? []}
          loading={loading}
        />
      </div>
    </div>
  );
}