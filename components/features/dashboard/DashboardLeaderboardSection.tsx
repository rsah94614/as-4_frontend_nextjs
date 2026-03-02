"use client";

import { useEffect, useState } from "react";
import DashboardLeaderboardCard from "./DashboardLeaderboardCard";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";
import type { LeaderboardEntryResponse } from "@/types/dashboard-types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AVATAR_COLORS = [
    "bg-purple-500", "bg-blue-500", "bg-orange-500",
    "bg-emerald-500", "bg-pink-500",
];

function userInitials(username: string): string {
    const parts = username.split(/[._\s-]+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="border border-[#d9d9d9] shadow-none rounded-3xl">
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 shrink-0" />
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardLeaderboardSection = () => {
    const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await fetchDashboardLeaderboard();
            setEntries(result ?? []);
            setLoading(false);
        }
        load();
    }, []);

    const mapped = entries.map((entry, i) => ({
        rank: entry.rank,
        name: entry.username,
        initials: userInitials(entry.username),
        points: entry.total_earned_points,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        image: null,
    }));

    return (
        <section className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-none">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-medium pb-4">Leaderboard</h2>
            </div>

            <div className="space-y-3">
                {loading && <LeaderboardSkeleton />}

                {!loading && mapped.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No data available.
                    </p>
                )}

                {!loading &&
                    mapped.map((entry) => (
                        <DashboardLeaderboardCard key={entry.rank} {...entry} />
                    ))}
            </div>
        </section>
    );
};

export default DashboardLeaderboardSection;