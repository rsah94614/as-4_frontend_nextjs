"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    ResponsiveContainer, AreaChart, CartesianGrid,
    XAxis, YAxis, Tooltip, Legend, Area,
} from "recharts";
import { fetchRecognitionTrend } from "@/services/analytics-service";
import type { TrendPoint, RecognitionTrendResponse } from "@/types/dashboard-types";

type Range = "3m" | "6m" | "1y";

const RANGES: { value: Range; label: string }[] = [
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
];

// Pre-computed stable skeleton bar heights — avoids Math.random() during render
const SKELETON_HEIGHTS = [58, 72, 45, 83, 61, 37, 76, 52, 68, 41, 87, 55];

type TrendState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ok"; data: TrendPoint[] };

function TrendSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40 rounded-lg" />
                    <Skeleton className="h-8 w-52 rounded-xl" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-1.5 h-[320px] pt-4">
                    {SKELETON_HEIGHTS.map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                            <Skeleton className="w-full rounded-t-sm animate-pulse" style={{ height: `${height}%` }} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminRecognitionTrendSection({ initialData }: { initialData?: RecognitionTrendResponse | null }) {
    const [range, setRange] = useState<Range>("6m");
    const [trendState, setTrendState] = useState<TrendState>(
        initialData ? { status: "ok", data: initialData.data } : { status: "loading" }
    );

    // Sync prop to state during render
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        if (range === "6m" && initialData) {
            setTrendState({ status: "ok", data: initialData.data });
        }
    }

    // The effect depends on `range` directly.
    const load = useCallback((r: Range) => {
        fetchRecognitionTrend(r).then((res) => {
            setTrendState(res ? { status: "ok", data: res.data } : { status: "error" });
        });
    }, []);

    const handleRangeChange = useCallback((newRange: Range) => {
        setTrendState({ status: "loading" });
        setRange(newRange);
    }, []);

    useEffect(() => {
        // Only load if range changed from default "6m" OR we don't have initialData
        if (range === "6m" && initialData) return;
        load(range);
    }, [range, load, initialData]);

    if (trendState.status === "loading") return <TrendSkeleton />;

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        Recognition Trend
                    </CardTitle>
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
                        {RANGES.map(r => (
                            <button
                                key={r.value}
                                onClick={() => handleRangeChange(r.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === r.value
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-muted-foreground hover:text-gray-700"
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {trendState.status === "error" ? (
                    <div className="flex flex-col items-center justify-center h-[320px] gap-4 text-center">
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-500">Could not load trend data.</p>
                        <Button size="sm" onClick={() => load(range)} className="gap-2 font-bold rounded-lg bg-gray-900 text-white hover:bg-gray-700 px-4">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry
                        </Button>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={trendState.data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradGiven" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                            <Area type="monotone" dataKey="given" name="Given" stroke="#7c3aed" strokeWidth={2} fill="url(#gradGiven)" dot={false} isAnimationActive animationDuration={600} />
                            <Area type="monotone" dataKey="received" name="Received" stroke="#3b82f6" strokeWidth={2} fill="url(#gradReceived)" dot={false} isAnimationActive animationDuration={600} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}