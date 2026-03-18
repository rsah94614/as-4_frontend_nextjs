"use client";

import { useState, useMemo } from "react";
import {
    Search, RefreshCw, X,
    Loader2, MessageSquare, Zap, Calendar, AlertCircle,
} from "lucide-react";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { TeamSection } from "@/components/features/admin/reviews/TeamSection";
import { CalendarStrip } from "@/components/features/admin/reviews/UIHelpers";


export default function AdminReviewsPage() {
    const [search, setSearch] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const {
        employees, reviews, loading, error,
        month, year, setMonth, setYear,
        managers, getTeam, summary, refresh,
    } = useAdminReviews();

    const filteredManagers = useMemo(() => {
        const term = search.toLowerCase();
        return managers.filter((m) => {
            if (!term) return true;
            const team = getTeam(m.employee_id);
            return (
                m.username.toLowerCase().includes(term) ||
                team.some((e) => e.username.toLowerCase().includes(term))
            );
        });
    }, [managers, getTeam, search]);

    const toggleTeam = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-white">

                    {/* ── Page Header ── */}
                    <div className="bg-white border-b border-border px-8 md:px-10 py-5">
                        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                                    Recognition Admin
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Monitor team recognitions · Points credited automatically
                                </p>
                            </div>
                            <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                                <span style={{ color: "#E31837" }}>A</span>
                                <span style={{ color: "#004C8F" }}>abhar</span>
                            </span>
                        </div>
                    </div>



                    <div className="px-8 md:px-10 py-8 max-w-[1200px] mx-auto space-y-6">

                        {/* ── Summary Stats ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Reviews card */}
                            <div className="bg-white border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow overflow-hidden relative">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-muted flex items-center justify-center">
                                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                                    </span>
                                    Total Reviews
                                </p>
                                <p className="text-4xl font-black tracking-tight" style={{ color: "#004C8F" }}>
                                    {summary.totalReviews}
                                </p>
                            </div>

                            {/* Points card */}
                            <div className="bg-white border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow overflow-hidden relative">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Zap className="w-3 h-3 text-amber-400" />
                                    </span>
                                    Total Points Awarded
                                </p>
                                <p className="text-4xl font-black tracking-tight" style={{ color: "#004C8F" }}>
                                    {summary.totalPoints.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* ── Calendar Period ── */}
                        <div className="bg-white border border-border rounded-xl shadow-sm px-6 py-4 flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 shrink-0 border-r border-gray-100 pr-4">
                                <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                            </div>
                            <CalendarStrip
                                month={month}
                                year={year}
                                onChange={(m, y) => { setMonth(m); setYear(y); }}
                            />
                        </div>

                        {/* ── Toolbar ── */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <div className="relative max-w-xs flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search team or member…"
                                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-border text-sm font-medium text-foreground
                                        focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 bg-white"
                                />
                            </div>

                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold bg-muted text-foreground border border-border hover:bg-secondary transition-colors">
                                    <X className="w-3.5 h-3.5" /> Clear
                                </button>
                            )}

                            {/* Refresh */}
                            <button onClick={refresh}
                                className="ml-auto h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── Teams list ── */}
                        <div className="space-y-4 pb-12">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#004C8F", opacity: 0.3 }} />
                                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Loading reviews…</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-xl border border-border">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ background: "#E3183718" }}>
                                        <AlertCircle className="w-6 h-6" style={{ color: "#E31837" }} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-foreground">Failed to load</p>
                                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                    </div>
                                    <button onClick={refresh}
                                        className="px-6 h-10 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                                        style={{ background: "#E31837" }}>
                                        Retry
                                    </button>
                                </div>
                            ) : filteredManagers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-xl border border-dashed border-border">
                                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                                        <Search className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-foreground">No teams found</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {search ? "No matches for your search." : "No reviews for this period."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredManagers.map((mgr) => (
                                    <TeamSection
                                        key={mgr.employee_id}
                                        manager={mgr}
                                        members={getTeam(mgr.employee_id)}
                                        reviews={reviews}
                                        employees={employees}
                                        expanded={expandedIds.has(mgr.employee_id)}
                                        onToggle={() => toggleTeam(mgr.employee_id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </main>
        </>
    );
}