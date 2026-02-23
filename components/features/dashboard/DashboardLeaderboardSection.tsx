"use client";

import React, { useEffect, useState } from "react";
import DashboardLeaderboardCard from "./DashboardLeaderboardCard";
import { fetchWithAuth } from "@/services/auth-service";

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || "http://localhost:8003";
const WALLET_API   = process.env.NEXT_PUBLIC_WALLET_API_URL   || "http://localhost:8004";

interface EmployeeInfo {
    employee_id: string;
    first_name: string;
    last_name: string;
    profile_image?: string | null;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    initials: string;
    points: number;
    color: string;
    image: string | null;
}

const AVATAR_COLORS = [
    "bg-purple-500", "bg-blue-500", "bg-orange-500",
    "bg-emerald-500", "bg-pink-500",
];

function initials(first: string, last: string): string {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const DashboardLeaderboardSection = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // 1. Fetch employees (broader set so sorting by points is meaningful)
                const empRes = await fetchWithAuth(
                    `${EMPLOYEE_API}/v1/employees?page=1&limit=20&is_active=true`
                );
                if (!empRes.ok) return;
                const empJson = await empRes.json();
                const employees: EmployeeInfo[] = empJson.data ?? empJson.employees ?? [];

                // 2. Fetch wallet balance for each in parallel
                const withPoints = await Promise.all(
                    employees.map(async (emp) => {
                        try {
                            const walletRes = await fetchWithAuth(
                                `${WALLET_API}/v1/wallets/employees/${emp.employee_id}`
                            );
                            if (!walletRes.ok) return { emp, points: 0 };
                            const walletData = await walletRes.json();
                            const walletId = walletData?.wallet_id ?? walletData?.id;
                            if (!walletId) return { emp, points: 0 };

                            const balRes = await fetchWithAuth(
                                `${WALLET_API}/v1/wallets/${walletId}/balance`
                            );
                            if (!balRes.ok) return { emp, points: 0 };
                            const balData = await balRes.json();
                            const points = balData?.balance ?? balData?.current_balance ?? 0;
                            return { emp, points };
                        } catch {
                            return { emp, points: 0 };
                        }
                    })
                );

                // 3. Sort by points descending, take top 5, then rank
                const sorted = withPoints
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 5)
                    .map(({ emp, points }, i) => ({
                        rank:     i + 1,
                        name:     `${emp.first_name} ${emp.last_name}`.trim(),
                        initials: initials(emp.first_name, emp.last_name),
                        points,
                        color:    AVATAR_COLORS[i % AVATAR_COLORS.length],
                        image:    emp.profile_image ?? null,
                    }));

                setEntries(sorted);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

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

                {!loading && entries.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No data available.
                    </p>
                )}

                {!loading &&
                    entries.map((entry) => (
                        <DashboardLeaderboardCard key={entry.rank} {...entry} />
                    ))}
            </div>
        </section>
    );
};

export default DashboardLeaderboardSection;