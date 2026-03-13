"use client";

import { useState, useMemo } from "react";
import {
  Search, RefreshCw, X, ChevronDown, ChevronUp,
  Loader2, MessageSquare, Zap, Calendar, AlertCircle,
} from "lucide-react";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TeamSection } from "@/components/features/admin/reviews/TeamSection";
import { CalendarStrip } from "@/components/features/admin/reviews/UIHelpers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminReviewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleExpandAll = () =>
    setExpandedIds(new Set(filteredManagers.map((m) => m.employee_id)));
  const handleCollapseAll = () => setExpandedIds(new Set());
  const toggleTeam = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
              <Card className="rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-gray-400" />
                  </span>
                  Total Reviews
                </p>
                <p className="text-4xl font-black tracking-tight" style={{ color: "#004C8F" }}>
                  {summary.totalReviews}
                </p>
              </Card>

              <Card className="rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-amber-400" />
                  </span>
                  Total Points Awarded
                </p>
                <p className="text-4xl font-black tracking-tight" style={{ color: "#004C8F" }}>
                  {summary.totalPoints.toFixed(0)}
                </p>
              </Card>
            </div>

            {/* ── Calendar ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-shrink-0 border-r border-gray-100 pr-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Period
                </span>
              </div>
              <CalendarStrip
                month={month}
                year={year}
                onChange={(m, y) => { setMonth(m); setYear(y); }}
              />
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative max-w-xs flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#004C8F] transition-colors pointer-events-none z-10" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search team or member…"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus-visible:ring-1 focus-visible:ring-[#004C8F]/20 focus-visible:border-[#004C8F]/40 bg-white shadow-sm"
                />
              </div>

              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" /> Clear
                </Button>
              )}

              <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 gap-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandAll}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-widest"
                >
                  <ChevronDown className="w-3.5 h-3.5" /> Expand all
                </Button>
                <div className="w-px h-4 bg-gray-100" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-widest"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Collapse all
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                className="h-11 w-11 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* ── Teams list ── */}
            <div className="space-y-4 pb-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#004C8F", opacity: 0.3 }} />
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    Loading reviews…
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#E31837" + "18" }}>
                    <AlertCircle className="w-6 h-6" style={{ color: "#E31837" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Failed to load</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                  </div>
                  <Button
                    onClick={refresh}
                    className="px-6 h-10 rounded-xl text-sm font-bold text-white border-none"
                    style={{ background: "#E31837" }}
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredManagers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
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