"use client";

import React, { useEffect, useState } from "react";
import DashboardRecognitionCard from "./DashboardRecognitionCard";
import { fetchWithAuth } from "@/services/auth-service";

const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005";
const EMPLOYEE_API    = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL    || "http://localhost:8003";

const AVATAR_COLORS = [
    "bg-purple-500", "bg-blue-500", "bg-orange-500",
    "bg-emerald-500", "bg-pink-500",
];

interface RecognitionItem {
    id: string;
    from: string;
    fromInitials: string;
    to: string;
    toInitials: string;
    message: string;
    points: number;
    time: string;
    color: string;
    image: string | null;
}

interface RawRecognition {
    recognition_id?: string;
    id?: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    points?: number;
    created_at: string;
}

interface EmployeeInfo {
    employee_id: string;
    first_name: string;
    last_name: string;
    profile_image?: string | null;
}

function initials(first: string, last: string): string {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
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
    const [items, setItems] = useState<RecognitionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // 1. Fetch recent recognitions
                const recRes = await fetchWithAuth(
                    `${RECOGNITION_API}/v1/recognitions?page=1&page_size=5`
                );
                if (!recRes.ok) return;
                const recJson = await recRes.json();
                const recognitions: RawRecognition[] = recJson.data ?? recJson.recognitions ?? recJson.items ?? [];

                // 2. Collect unique employee IDs
                const employeeIds = Array.from(
                    new Set(
                        recognitions.flatMap((r) => [r.sender_id, r.receiver_id])
                    )
                );

                // 3. Fetch employee info for all IDs in parallel
                const employeeMap = new Map<string, EmployeeInfo>();
                await Promise.all(
                    employeeIds.map(async (empId) => {
                        try {
                            const empRes = await fetchWithAuth(
                                `${EMPLOYEE_API}/v1/employees/${empId}`
                            );
                            if (!empRes.ok) return;
                            const emp: EmployeeInfo = await empRes.json();
                            employeeMap.set(empId, emp);
                        } catch {
                            // ignore individual failures
                        }
                    })
                );

                // 4. Map recognitions to display items
                const mapped: RecognitionItem[] = recognitions.map((r, i) => {
                    const sender   = employeeMap.get(r.sender_id);
                    const receiver = employeeMap.get(r.receiver_id);

                    const fromName     = sender   ? `${sender.first_name} ${sender.last_name}`.trim()   : r.sender_id;
                    const toName       = receiver ? `${receiver.first_name} ${receiver.last_name}`.trim() : r.receiver_id;
                    const fromInitials = sender   ? initials(sender.first_name, sender.last_name) : "??";
                    const toInitials   = receiver ? initials(receiver.first_name, receiver.last_name) : "??";

                    return {
                        id:           r.recognition_id ?? r.id ?? String(i),
                        from:         fromName,
                        fromInitials,
                        to:           toName,
                        toInitials,
                        message:      r.message,
                        points:       r.points ?? 0,
                        time:         formatTime(r.created_at),
                        color:        AVATAR_COLORS[i % AVATAR_COLORS.length],
                        image:        sender?.profile_image ?? null,
                    };
                });

                setItems(mapped);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <section className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-none">
            <h2 className="text-2xl font-medium pb-4">Recent Recognitions</h2>

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
                        No recognitions yet.
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