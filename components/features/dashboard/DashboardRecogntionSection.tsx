"use client";

import { useEffect, useState } from "react";
import DashboardRecognitionCard from "./DashboardRecognitionCard";
import { fetchDashboardRecentReviews } from "@/services/analytics-service";
import type { RecentReviewResponse } from "@/types/dashboard-types";

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

function formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

const DashboardRecognitionSection = () => {
    const [reviews, setReviews] = useState<RecentReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await fetchDashboardRecentReviews();
            setReviews(result ?? []);
            setLoading(false);
        }
        load();
    }, []);

    const items = reviews.map((r, i) => ({
        id: r.review_id,
        from: r.reviewer_name,
        fromInitials: userInitials(r.reviewer_name),
        to: "you",
        toInitials: "",
        message: r.comment,
        points: r.rating,
        time: formatTime(r.review_at),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        image: null,
    }));

    return (
        <section className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-none">
            <h2 className="text-2xl font-medium pb-4">Recent Reviews</h2>

            <div className="space-y-3">
                {loading &&
                    Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 rounded-3xl bg-slate-100 animate-pulse"
                        />
                    ))}

                {!loading && items.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No reviews yet.
                    </p>
                )}

                {!loading &&
                    items.map((item) => (
                        <DashboardRecognitionCard key={item.id} {...item} />
                    ))}
            </div>
        </section>
    );
};

export default DashboardRecognitionSection;