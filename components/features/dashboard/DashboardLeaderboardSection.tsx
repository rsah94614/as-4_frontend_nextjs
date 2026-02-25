"use client";

import React from "react";
import DashboardLeaderboardCard from "./DashboardLeaderboardCard";
import type { LeaderboardEntry } from "@/services/analytics-service";

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

interface DashboardLeaderboardSectionProps {
    entries: LeaderboardEntry[];
    loading: boolean;
}

const DashboardLeaderboardSection = ({
    entries,
    loading,
}: DashboardLeaderboardSectionProps) => {
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
                {loading &&
                    Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-3xl bg-slate-100 animate-pulse"
                        />
                    ))}

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