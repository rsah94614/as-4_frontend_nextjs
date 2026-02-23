"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/features/dashboard/DashboardCard";
import DashboardRecognitionSection from "@/components/features/dashboard/DashboardRecogntionSection";
import DashboardLeaderboardSection from "@/components/features/dashboard/DashboardLeaderboardSection";
import { fetchWithAuth, auth } from "@/services/auth-service";

// ─── Config ───────────────────────────────────────────────────────────────────

const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005";
const EMPLOYEE_API    = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL    || "http://localhost:8003";
const WALLET_API      = process.env.NEXT_PUBLIC_WALLET_API_URL      || "http://localhost:8004";
const REWARDS_API     = process.env.NEXT_PUBLIC_REWARDS_API_URL     || "http://localhost:8006";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalPoints: number | null;
  rewardsRedeemed: number | null;
  activeReviews: number | null;
  activeUsers: number | null;
}

// ─── Fetchers (each returns null on failure so one bad service doesn't break all cards) ───

async function fetchTotalPoints(employeeId: string): Promise<number | null> {
  try {
    // Step 1: get wallet id for this employee
    const walletRes = await fetchWithAuth(
      `${WALLET_API}/v1/wallets/employees/${employeeId}`
    );
    if (!walletRes.ok) return null;
    const walletData = await walletRes.json();
    const walletId = walletData?.wallet_id ?? walletData?.id;
    if (!walletId) return null;

    // Step 2: get balance
    const balanceRes = await fetchWithAuth(
      `${WALLET_API}/v1/wallets/${walletId}/balance`
    );
    if (!balanceRes.ok) return null;
    const balanceData = await balanceRes.json();
    return balanceData?.balance ?? balanceData?.current_balance ?? balanceData?.available_points ?? null;
  } catch {
    return null;
  }
}

async function fetchRewardsRedeemed(): Promise<number | null> {
  try {
    const res = await fetchWithAuth(
      `${REWARDS_API}/v1/rewards/history/me?page=1&size=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.total_items ?? null;
  } catch {
    return null;
  }
}

async function fetchActiveReviews(): Promise<number | null> {
  try {
    const res = await fetchWithAuth(
      `${RECOGNITION_API}/v1/reviews?page=1&page_size=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.pagination?.total ?? null;
  } catch {
    return null;
  }
}

async function fetchActiveUsers(): Promise<number | null> {
  try {
    const res = await fetchWithAuth(
      `${EMPLOYEE_API}/v1/employees?page=1&limit=1&is_active=true`
    );
    if (!res.ok) return null;
    const json = await res.json();
    // EmployeeListResponse — check common pagination field names
    return (
      json?.pagination?.total ??
      json?.total ??
      json?.total_items ??
      null
    );
  } catch {
    return null;
  }
}

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints:     null,
    rewardsRedeemed: null,
    activeReviews:   null,
    activeUsers:     null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const employeeId = auth.getUser()?.employee_id;

      // Fetch all in parallel — individual failures return null, not throw
      const [totalPoints, rewardsRedeemed, activeReviews, activeUsers] =
        await Promise.all([
          employeeId ? fetchTotalPoints(employeeId) : Promise.resolve(null),
          fetchRewardsRedeemed(),
          fetchActiveReviews(),
          fetchActiveUsers(),
        ]);

      setStats({ totalPoints, rewardsRedeemed, activeReviews, activeUsers });
      setLoading(false);
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: "Total Points:",
      value: formatNumber(stats.totalPoints),
      icon: Users,
      color: "bg-[#FFE69C]",
      loading,
    },
    {
      label: "Rewards Redeemed:",
      value: formatNumber(stats.rewardsRedeemed),
      icon: Trophy,
      color: "bg-[#EED9FF]",
      loading,
    },
    {
      label: "Active Reviews:",
      value: formatNumber(stats.activeReviews),
      icon: LayoutGrid,
      color: "bg-[#D1FFD7]",
      loading,
    },
    {
      label: "Active Users:",
      value: formatNumber(stats.activeUsers),
      icon: TrendingUp,
      color: "bg-[#DFDFFF]",
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
            
          />
        ))}
      </div>

      {/* Recent Recognitions & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* Recent Recognitions – wider (3 of 5 cols) */}
        <DashboardRecognitionSection />

        {/* Leaderboard – narrower (2 of 5 cols) */}
        <DashboardLeaderboardSection />
      </div>
    </div>
  );
}