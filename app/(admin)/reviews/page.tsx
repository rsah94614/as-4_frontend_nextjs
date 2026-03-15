"use client";

import { useState, useMemo } from "react";
import {
    Search, RefreshCw, X, ChevronDown, ChevronUp,
    Loader2, MessageSquare, Zap, Calendar, AlertCircle,
} from "lucide-react";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { TeamSection } from "@/components/features/admin/reviews/TeamSection";
import { CalendarStrip } from "@/components/features/admin/reviews/UIHelpers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminReviewsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch]           = useState("");
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

    const handleExpandAll   = () => setExpandedIds(new Set(filteredManagers.map((m) => m.employee_id)));
    const handleCollapseAll = () => setExpandedIds(new Set());
    const toggleTeam = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-white">

                    {/* ── Page Header ── */}
                    <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
                        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E31837" }}>
                                    Admin · Recognition
                                </p>
                                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                                    Recognition Admin
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    Monitor team recognitions · Points credited automatically
                                </p>
                            </div>
                            <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                                <span style={{ color: "#E31837" }}>A</span>
                                <span style={{ color: "#004C8F" }}>abhar</span>
                            </span>
                        </div>
                    </div>

                    {/* Red accent line */}
                    <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

                    <div className="px-8 md:px-10 py-8 max-w-[1200px] mx-auto space-y-6">

                        {/* ── Summary Stats ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Reviews card */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "#004C8F" }} />
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <MessageSquare className="w-3 h-3 text-gray-400" />
                                    </span>
                                    Total Reviews
                                </p>
                                <p className="text-4xl font-black tracking-tight" style={{ color: "#004C8F" }}>
                                    {summary.totalReviews}
                                </p>
                            </div>

                            {/* Points card */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "#E31837" }} />
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
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
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 shrink-0 border-r border-gray-100 pr-4">
                                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</span>
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search team or member…"
                                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800
                                        focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 bg-white"
                                />
                            </div>

                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors">
                                    <X className="w-3.5 h-3.5" /> Clear
                                </button>
                            )}

                            {/* Expand / Collapse */}
                            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 gap-1 shadow-sm">
                                <button onClick={handleExpandAll}
                                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-widest transition-colors">
                                    <ChevronDown className="w-3.5 h-3.5" /> Expand all
                                </button>
                                <div className="w-px h-4 bg-gray-100" />
                                <button onClick={handleCollapseAll}
                                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-widest transition-colors">
                                    <ChevronUp className="w-3.5 h-3.5" /> Collapse all
                                </button>
                            </div>

                            {/* Refresh */}
                            <button onClick={refresh}
                                className="ml-auto h-10 w-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
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
                                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-xl border border-gray-200">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ background: "#E3183718" }}>
                                        <AlertCircle className="w-6 h-6" style={{ color: "#E31837" }} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800">Failed to load</p>
                                        <p className="text-sm text-gray-400 mt-1">{error}</p>
                                    </div>
                                    <button onClick={refresh}
                                        className="px-6 h-10 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                                        style={{ background: "#E31837" }}>
                                        Retry
                                    </button>
                                </div>
                            ) : filteredManagers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-xl border border-dashed border-gray-200">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Search className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-600">No teams found</p>
                                        <p className="text-xs text-gray-400 mt-1">
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
            </div>
        </div>
    );
}