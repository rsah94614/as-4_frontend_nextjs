"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Users, UserCheck, UserX, TrendingUp, Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchParticipation } from "@/services/analytics-service";
import type { ParticipationResponse } from "@/types/dashboard-types";

const DEPT_COLORS = ["#004C8F", "#1D6EC5", "#5B9BD5", "#93C5FD", "#1E40AF", "#2563EB", "#3B82F6", "#60A5FA"];

function ParticipationSkeleton() {
    return (
        <Card className="rounded-3xl border-0 shadow-none h-full animate-pulse">
            <CardHeader className="pb-2">
                <Skeleton className="h-4 w-44 rounded-lg" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Skeleton className="w-64 h-64 rounded-full" />
                        <div className="flex flex-wrap justify-center gap-3">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-3 w-28 rounded-full" />)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 self-center">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
                                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <Skeleton className="h-4 w-12 rounded" />
                                    <Skeleton className="h-3 w-28 rounded" />
                                    <Skeleton className="h-2.5 w-20 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 pt-5 border-t border-muted">
                    <Skeleton className="h-3 w-44 rounded mb-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border bg-muted/30">
                                <Skeleton className="h-3 w-16 rounded" />
                                <Skeleton className="h-7 w-12 rounded" />
                                <Skeleton className="h-2.5 w-20 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ParticipationError({ onRetry }: { onRetry: () => void }) {
    return (
        <Card className="rounded-3xl border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-1.5">
                    <p className="text-base font-bold text-gray-900">Could not load participation data</p>
                    <p className="text-sm text-gray-500 max-w-xs">Check your connection or try again.</p>
                </div>
                <Button size="sm" onClick={onRetry} className="gap-2 font-bold rounded-lg bg-[#004C8F] text-white hover:bg-[#003A70] px-5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try again
                </Button>
            </CardContent>
        </Card>
    );
}

type LoadState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ok"; data: ParticipationResponse };

export default function AdminParticipationSection() {
    const [state, setState] = useState<LoadState>({ status: "loading" });

    // `triggerLoad` increments a counter; the effect reacts to the counter change.
    // This means the effect body never calls setState — the fetch .then() does.
    const [loadTick, setLoadTick] = useState(0);
    const load = useCallback(() => setLoadTick(t => t + 1), []);

    useEffect(() => {
        let cancelled = false;
        fetchParticipation().then((res) => {
            if (cancelled) return;
            setState(res ? { status: "ok", data: res } : { status: "error" });
        });
        return () => { cancelled = true; };
    }, [loadTick]); // re-runs whenever load() is called

    if (state.status === "loading") return <ParticipationSkeleton />;
    if (state.status === "error")   return <ParticipationError onRetry={load} />;

    const { data } = state;
    const s = data.stats;
    const activePct = Math.round(s.participation_rate);

    const PIE_COLORS = ["#004C8F", "#1D6EC5", "#93C5FD", "#e5e7eb"];
    const pieData = (data.pie ?? []).map((slice, i) => ({
        name:  slice.name,
        value: slice.value,
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    const avgDelta = s.avg_reviews_per_employee - s.avg_reviews_last_month;
    const stats = [
        { label: "Total Employees",        value: s.total_employees,          sub: "across all teams",                                                icon: Users,      color: "bg-[#EEF4FB] text-[#004C8F]" },
        { label: "Active Participants",    value: s.active_participants,      sub: `${activePct}% participation`,                                     icon: UserCheck,  color: "bg-[#DBEAFE] text-[#1D6EC5]" },
        { label: "Non-Participants",       value: s.non_participants,         sub: `${100 - activePct}% of workforce`,                                icon: UserX,      color: "bg-red-100 text-red-600"      },
        { label: "Avg Reviews / Employee", value: s.avg_reviews_per_employee, sub: `${avgDelta >= 0 ? "+" : ""}${avgDelta.toFixed(1)} vs last month`, icon: TrendingUp, color: "bg-[#BFDBFE] text-[#004C8F]" },
    ];

    return (
        <Card className="rounded-3xl border-0 shadow-none h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-[#004C8F]" />
                    Participation Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 delay-100">
                        <div className="relative w-full">
                            <ResponsiveContainer width="100%" height={380}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={110} outerRadius={155} paddingAngle={3} dataKey="value" isAnimationActive animationBegin={100} animationDuration={800}>
                                        {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, ""]} contentStyle={{ borderRadius: "10px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-3xl font-bold text-gray-900">{activePct}%</p>
                                <p className="text-xs text-muted-foreground font-medium">Active</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
                            {pieData.map(({ name, color }) => (
                                <div key={name} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-[10px] text-muted-foreground">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 self-center">
                        {stats.map(({ label, value, sub, icon: Icon, color }, i) => (
                            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold text-gray-900 leading-tight">
                                        {typeof value === "number" && !Number.isInteger(value) ? value.toFixed(1) : value}
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                                    <p className="text-[10px] text-muted-foreground/70 truncate">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {(data.by_department ?? []).length > 0 && (
                    <div className="mt-6 pt-5 border-t border-muted animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                            Participation by Department
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {(data.by_department ?? []).map(({ name, rate, active, total }, i) => (
                                <div key={name ?? i} className="flex flex-col gap-2 p-3 rounded-xl border bg-muted/30 animate-in fade-in zoom-in-95 duration-300" style={{ animationDelay: `${300 + i * 50}ms` }}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                                        <span className="text-xs font-semibold text-gray-700 truncate">{name}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 leading-none">{rate}%</p>
                                    <p className="text-[11px] text-muted-foreground">{active} of {total} active</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}