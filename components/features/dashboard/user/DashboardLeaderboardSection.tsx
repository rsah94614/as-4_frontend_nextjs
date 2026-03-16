"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLeaderboardCard from "./DashboardLeaderboardCard";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";
import type { LeaderboardEntryResponse } from "@/types/dashboard-types";

const AVATAR_COLORS = [
    "bg-[#004C8F]", "bg-[#6D28D9]", "bg-[#0D9488]",
    "bg-[#C2410C]", "bg-[#0891B2]", "bg-[#BE185D]",
    "bg-[#1E40AF]", "bg-[#065F46]", "bg-[#92400E]", "bg-[#3730A3]",
];

function userInitials(username: string): string {
    const parts = username.split(/[._\s-]+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return username.slice(0, 2).toUpperCase();
}

// ─── Podium slot config ────────────────────────────────────────────────────────

const PODIUM_CONFIG = {
    1: {
        platformH: "h-20",
        platformBg: "bg-gradient-to-t from-amber-500 to-amber-400",
        avatarSize: "h-14 w-14",
        avatarRing: "ring-2 ring-amber-400 ring-offset-2",
        nameSize: "text-sm font-bold",
        ptsSize: "text-xs",
        order: "order-2",
    },
    2: {
        platformH: "h-14",
        platformBg: "bg-gradient-to-t from-slate-400 to-slate-300",
        avatarSize: "h-11 w-11",
        avatarRing: "ring-2 ring-slate-300 ring-offset-2",
        nameSize: "text-xs font-bold",
        ptsSize: "text-[10px]",
        order: "order-1",
    },
    3: {
        platformH: "h-10",
        platformBg: "bg-gradient-to-t from-amber-700 to-amber-600",
        avatarSize: "h-11 w-11",
        avatarRing: "ring-2 ring-amber-600 ring-offset-2",
        nameSize: "text-xs font-bold",
        ptsSize: "text-[10px]",
        order: "order-3",
    },
} as const;

interface PodiumEntry {
    rank: number;
    name: string;
    initials: string;
    points: number;
    color: string;
    image: string | null;
}

function PodiumSlot({ entry }: { entry: PodiumEntry }) {
    const c = PODIUM_CONFIG[entry.rank as keyof typeof PODIUM_CONFIG];

    return (
        <div className={`flex flex-col items-center flex-1 ${c.order}`}>
            {/* Crown for #1 */}
            {entry.rank === 1 && (
                <Crown className="w-5 h-5 text-amber-400 mb-1 fill-amber-400" />
            )}

            {/* Avatar */}
            <Avatar className={`${c.avatarSize} ${c.avatarRing} mb-2 shrink-0`}>
                <AvatarFallback className={`${entry.color} text-white text-xs font-bold`}>
                    {entry.initials}
                </AvatarFallback>
            </Avatar>

            {/* Name */}
            <p className={`${c.nameSize} text-gray-800 truncate w-full text-center px-1 mb-0.5 leading-tight`}>
                {entry.name}
            </p>

            {/* Points */}
            <p className={`${c.ptsSize} text-gray-500 mb-2 tabular-nums`}>
                {entry.points.toLocaleString()} pts
            </p>

            {/* Platform block */}
            <div className={`w-full rounded-t-xl ${c.platformH} ${c.platformBg} flex items-start justify-center pt-2`}>
                <span className="text-white/80 font-black text-base leading-none">
                    #{entry.rank}
                </span>
            </div>
        </div>
    );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Podium skeleton — mirrors [rank2 | rank1 | rank3] layout exactly */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-4 pt-6 pb-0">
                <div className="flex items-end justify-center gap-2">

                    {/* Rank 2 — order-1, h-11 avatar, h-14 platform, no crown */}
                    <div className="flex flex-col items-center flex-1 order-1">
                        <Skeleton className="h-11 w-11 rounded-full mb-2" />
                        <Skeleton className="h-3 w-14 rounded mb-1" />
                        <Skeleton className="h-2.5 w-10 rounded mb-2" />
                        <Skeleton className="h-14 w-full rounded-t-xl" />
                    </div>

                    {/* Rank 1 — order-2, crown + h-14 avatar, h-20 platform */}
                    <div className="flex flex-col items-center flex-1 order-2">
                        <Skeleton className="h-5 w-5 rounded-md mb-1" />
                        <Skeleton className="h-14 w-14 rounded-full mb-2" />
                        <Skeleton className="h-3 w-16 rounded mb-1" />
                        <Skeleton className="h-2.5 w-12 rounded mb-2" />
                        <Skeleton className="h-20 w-full rounded-t-xl" />
                    </div>

                    {/* Rank 3 — order-3, h-11 avatar, h-10 platform, no crown */}
                    <div className="flex flex-col items-center flex-1 order-3">
                        <Skeleton className="h-11 w-11 rounded-full mb-2" />
                        <Skeleton className="h-3 w-14 rounded mb-1" />
                        <Skeleton className="h-2.5 w-10 rounded mb-2" />
                        <Skeleton className="h-10 w-full rounded-t-xl" />
                    </div>

                </div>
            </div>

            {/* List skeleton — mirrors DashboardLeaderboardCard exactly */}
            <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
                {[4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2">
                        <Skeleton className="h-3 w-5 rounded shrink-0" />
                        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                        <Skeleton className="h-3 flex-1 max-w-[110px] rounded" />
                        <Skeleton className="h-3 w-12 rounded shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

const DashboardLeaderboardSection = ({ initialData }: { initialData?: LeaderboardEntryResponse[] | null }) => {
    const [entries, setEntries] = useState<LeaderboardEntryResponse[]>(initialData ?? []);
    const [loading, setLoading] = useState(!initialData);

    // Sync prop to state during render
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        if (initialData) {
            setEntries(initialData);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialData) return;

        async function load() {
            setLoading(true);
            const result = await fetchDashboardLeaderboard();
            setEntries(result ?? []);
            setLoading(false);
        }
        load();
    }, [initialData]);

    const mapped = entries.map((entry, i) => ({
        rank: entry.rank,
        name: entry.username,
        initials: userInitials(entry.username),
        points: entry.total_earned_points,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        image: null,
    }));

    const top3 = mapped.filter((e) => e.rank <= 3);
    const rest = mapped.filter((e) => e.rank > 3);

    return (
        <section className="lg:col-span-2 flex flex-col gap-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
                <p className="text-xs text-gray-400 mt-0.5">Top performers this period</p>
            </div>

            {loading && <LeaderboardSkeleton />}

            {!loading && mapped.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="text-sm font-semibold text-gray-700">No data yet</p>
                </div>
            )}

            {!loading && mapped.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Podium */}
                    {top3.length > 0 && (
                        <div className="bg-gradient-to-b from-gray-50 to-white px-4 pt-6 pb-0">
                            <div className="flex items-end justify-center gap-2">
                                {/* Render in visual order: 2, 1, 3 */}
                                {[2, 1, 3].map((r) => {
                                    const entry = top3.find((e) => e.rank === r);
                                    return entry ? <PodiumSlot key={r} entry={entry} /> : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Ranked list for 4–10 */}
                    {rest.length > 0 && (
                        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
                            {rest.map((entry) => (
                                <DashboardLeaderboardCard key={entry.rank} {...entry} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default DashboardLeaderboardSection;
