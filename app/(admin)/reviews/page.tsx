"use client";

import { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Flag,
  X,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Modular Components
import { CalendarStrip, Stars } from "@/components/features/admin/reviews/UIHelpers";
import { TeamSection } from "@/components/features/admin/reviews/TeamSection";

const FLAG_RATING = 2;

export default function AdminReviewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    employees,
    reviews,
    loading,
    error,
    month,
    year,
    setMonth,
    setYear,
    managers,
    getTeam,
    summary,
    refresh,
  } = useAdminReviews();

  const [search, setSearch] = useState("");
  const [showFlagged, setShowFlagged] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredManagers = useMemo(() => {
    const term = search.toLowerCase();
    return managers.filter((m) => {
      const team = getTeam(m.employee_id);
      const match =
        !term ||
        m.username.toLowerCase().includes(term) ||
        team.some((e) => e.username.toLowerCase().includes(term));
      const flag =
        !showFlagged ||
        (() => {
          const ids = new Set([m.employee_id, ...team.map((x) => x.employee_id)]);
          return reviews.some(
            (r) => ids.has(r.receiver_id) && r.rating <= FLAG_RATING
          );
        })();
      return match && flag;
    });
  }, [managers, getTeam, search, showFlagged, reviews]);

  const handleExpandAll = () => {
    setExpandedIds(new Set(filteredManagers.map((m) => m.employee_id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const toggleTeam = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black">
                Reviews
              </h1>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">
                Monitor peer reviews by team. Ratings ≤ {FLAG_RATING} are automatically flagged.
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <Card className="rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                  <MessageSquare className="w-3 h-3" />
                </div>
                Total Reviews
              </p>
              <p className="text-4xl font-black text-black tracking-tight">
                {summary.totalReviews}
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 text-black">
                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-500 transition-colors">
                  <TrendingUp className="w-3 h-3" />
                </div>
                Avg Rating
              </p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-black text-black tracking-tight underline decoration-amber-200 decoration-4 underline-offset-8">
                  {summary.overallAvg > 0 ? summary.overallAvg.toFixed(1) : "—"}
                </p>
                {summary.overallAvg > 0 && (
                  <Stars value={Math.round(summary.overallAvg)} size="md" />
                )}
              </div>
            </Card>

            <Button
              variant="ghost"
              onClick={() => setShowFlagged((v) => !v)}
              className={cn(
                "h-auto justify-start rounded-3xl border shadow-sm p-6 cursor-pointer transition-all active:scale-[0.98] text-left relative overflow-hidden group border-slate-100",
                showFlagged
                  ? "bg-red-50 border-red-200 ring-2 ring-red-100 hover:bg-red-50"
                  : "bg-white hover:border-red-200 hover:bg-white"
              )}
            >
              <div className="w-full">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2",
                  showFlagged ? "text-red-500" : "text-slate-400"
                )}>
                  <div className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center transition-colors",
                    showFlagged ? "bg-red-100 text-red-600 shadow-sm" : "bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-400"
                  )}>
                    <Flag className="w-3 h-3" />
                  </div>
                  Flagged Content
                </p>
                <p className={cn(
                  "text-4xl font-black tracking-tight transition-colors",
                  showFlagged ? "text-red-600" : "text-black"
                )}>
                  {summary.flaggedTotal}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-80 whitespace-normal">
                  {showFlagged ? "Showing flagged → Click to reset" : "Click to highlight risky content"}
                </p>
              </div>
            </Button>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-4 flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
            <div className="flex items-center gap-3 flex-shrink-0 border-r border-slate-100 pr-4">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Period</span>
            </div>
            <CalendarStrip
              month={month}
              year={year}
              onChange={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <div className="relative max-w-xs flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team or member..."
                className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white shadow-sm transition-all"
              />
            </div>
            {(search || showFlagged) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setShowFlagged(false);
                }}
                className="flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-black bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition-all active:scale-95"
              >
                <X className="w-4 h-4" /> Clear filters
              </Button>
            )}
            <div className="flex items-center bg-white rounded-2xl border border-slate-200 p-1 gap-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="px-4 py-2 h-9 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors active:scale-95 uppercase tracking-widest"
              >
                EXPAND ALL
              </Button>
              <div className="w-px h-4 bg-slate-100" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="px-4 py-2 h-9 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors active:scale-95 uppercase tracking-widest"
              >
                COLLAPSE ALL
              </Button>
            </div>

            <Button
              variant="default"
              size="icon"
              onClick={refresh}
              className="h-11 w-11 rounded-2xl bg-black text-white hover:bg-slate-800 transition-all shadow-md active:rotate-180 duration-500 ml-auto active:scale-95 border-none"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Teams list */}
          <div className="space-y-4 pb-12 animate-in fade-in duration-700 delay-400">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest animate-pulse">Synchronizing reviews...</p>
              </div>
            ) : error ? (
              <Card className="flex flex-col items-center justify-center py-24 gap-4 bg-red-50 border border-red-100 rounded-[3rem] shadow-sm">
                <div className="w-16 h-16 rounded-[2rem] bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                  <Flag className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-red-900 font-black text-xl tracking-tight">Connection Interrupt</p>
                  <p className="text-red-600/80 font-bold text-sm tracking-wide mt-1 uppercase text-[11px]">{error}</p>
                </div>
                <Button
                  onClick={refresh}
                  className="px-8 py-6 h-12 bg-red-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 border-none"
                >
                  RETRY SYNC
                </Button>
              </Card>
            ) : filteredManagers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 text-sm bg-white rounded-[3rem] border border-dashed border-slate-200 gap-4">
                <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Grid Empty</p>
                  <p className="font-bold text-slate-400/60 lowercase tracking-widest text-xs">
                    {showFlagged
                      ? "No teams with flagged reviews this period."
                      : "No matches found for your current search."}
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
        </main>
      </div>
    </div>
  );
}