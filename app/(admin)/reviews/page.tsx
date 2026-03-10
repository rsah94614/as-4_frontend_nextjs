"use client";

import { useState, useMemo } from "react";
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Loader2, Flag, Star, X, ChevronDown, ChevronUp,
  MessageSquare, TrendingUp, Calendar
} from "lucide-react"
import { createAuthenticatedClient } from "@/lib/api-utils"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

// ─── Proxy clients ────────────────────────────────────────────────────────────
const employeeClient    = createAuthenticatedClient("/api/proxy/employees")
const recognitionClient = createAuthenticatedClient("/api/proxy/recognition")

const FLAG_RATING = 2

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  employee_id: string
  username: string
  email: string
  designation_name?: string
  department_name?: string
  manager_id?: string
  is_active: boolean
}

interface Review {
  review_id: string
  reviewer_id: string
  receiver_id: string
  rating: number
  comment: string
  image_url?: string | null
  video_url?: string | null
  status_id: string
  review_at: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

// ─── Calendar Strip ───────────────────────────────────────────────────────────
function CalendarStrip({ month, year, onChange }: {
  month: number; year: number; onChange: (m: number, y: number) => void
}) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const prev = () => month === 0 ? onChange(11, year - 1) : onChange(month - 1, year)
  const next = () => month === 11 ? onChange(0, year + 1) : onChange(month + 1, year)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1 flex-wrap">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => onChange(i, year)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${i === month ? "bg-purple-700 text-white shadow" : "text-slate-500 hover:bg-slate-100"
              }`}>
            {m}
          </button>
        ))}
      </div>
      <button onClick={next} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1 ml-1">
        <button onClick={() => onChange(month, year - 1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition">◂</button>
        <span className="text-sm font-bold text-black px-1">{year}</span>
        <button onClick={() => onChange(month, year + 1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold transition">▸</button>
      </div>
    </div>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${cls} ${i <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
    </div>
  )
}

// ─── Single review row ────────────────────────────────────────────────────────
function ReviewRow({ review, employees }: { review: Review; employees: Employee[] }) {
  const flagged = review.rating <= FLAG_RATING
  const reviewer = employees.find(e => e.employee_id === review.reviewer_id)

  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 border ${flagged ? "bg-red-50/60 border-red-100" : "bg-white border-slate-100"
      }`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${flagged ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
        }`}>
        {(reviewer?.username ?? "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-black">{reviewer?.username ?? "Unknown"}</span>
          <Stars value={review.rating} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flagged
            ? "bg-red-100 text-red-600"
            : review.rating >= 4
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
            }`}>{review.rating}/5</span>
          {flagged && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              <Flag className="w-2.5 h-2.5" /> Flagged
            </span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">
            {new Date(review.review_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
          </span>
        </div>
        {review.comment && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{review.comment}</p>
        )}
      </div>
    </div>
  )
}

// ─── Member section ───────────────────────────────────────────────────────────
function MemberSection({ member, reviews, employees, isManager }: {
  member: Employee; reviews: Review[]; employees: Employee[]; isManager: boolean
}) {
  const [open, setOpen] = useState(false)
  const memberReviews = reviews.filter(r => r.receiver_id === member.employee_id)
  if (memberReviews.length === 0) return null

  const avg = memberReviews.reduce((s, r) => s + r.rating, 0) / memberReviews.length
  const flagged = memberReviews.filter(r => r.rating <= FLAG_RATING).length

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${flagged > 0 ? "bg-red-50" : "bg-slate-50"
          } hover:brightness-95`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isManager ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"
          }`}>
          {member.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-bold text-black flex-1 text-left">{member.username}</span>
        {isManager && (
          <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
            Manager
          </span>
        )}
        <Stars value={Math.round(avg)} />
        <span className="text-xs font-semibold text-black w-8 text-right">{avg.toFixed(1)}</span>
        {flagged > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
            <Flag className="w-2.5 h-2.5" />{flagged}
          </span>
        )}
        <span className="text-[10px] text-slate-400">({memberReviews.length})</span>
        {open
          ? <ChevronUp className="w-3 h-3 text-slate-400" />
          : <ChevronDown className="w-3 h-3 text-slate-400" />
        }
      </button>
      {open && (
        <div className="space-y-1.5 pl-3">
          {memberReviews.map(r => (
            <ReviewRow key={r.review_id} review={r} employees={employees} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Team section ─────────────────────────────────────────────────────────────
function TeamSection({ manager, members, reviews, employees, expanded, onToggle }: {
  manager: Employee; members: Employee[]; reviews: Review[]
  employees: Employee[]; expanded: boolean; onToggle: () => void
}) {
  const teamIds = useMemo(
    () => new Set([manager.employee_id, ...members.map(m => m.employee_id)]),
    [manager.employee_id, members]
  )
  const teamReviews = reviews.filter(r => teamIds.has(r.receiver_id))
  const flaggedCount = teamReviews.filter(r => r.rating <= FLAG_RATING).length
  const totalCount = teamReviews.length
  const avg = totalCount > 0
    ? teamReviews.reduce((s, r) => s + r.rating, 0) / totalCount
    : 0

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${flaggedCount > 0 ? "border-red-100" : "border-slate-100"
      }`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/50 transition text-left">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-black truncate">{manager.username}</p>
            <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">
              Manager
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {manager.department_name || "—"} · {members.length + 1} members
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
            <MessageSquare className="w-3 h-3 text-slate-400" />{totalCount}
          </span>
          {avg > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-black">{avg.toFixed(1)}</span>
            </span>
          )}
          {flaggedCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              <Flag className="w-3 h-3" />{flaggedCount} flagged
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {totalCount === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No reviews received this period.</p>
          ) : (
            [manager, ...members].map(member => (
              <MemberSection
                key={member.employee_id}
                member={member}
                reviews={reviews}
                employees={employees}
                isManager={member.employee_id === manager.employee_id}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminReviewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showFlagged, setShowFlagged] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  async function fetchAllEmployees(): Promise<Employee[]> {
    const PAGE_SIZE = 100
    const all: Employee[] = []
    let page = 1
    while (true) {
      // FIX: was fetchWithAuth(`${EMPLOYEE_API}/v1/employees?...`) — direct call + wrong path
      // Employee list route is /list. Now uses proxy client.
      const res = await employeeClient.get<{ data: Employee[]; pagination: { total_pages: number } }>(
        `/list?limit=${PAGE_SIZE}&page=${page}`
      )
      const rows = res.data.data ?? []
      all.push(...rows)
      if (page >= (res.data.pagination?.total_pages ?? 1)) break
      page++
    }
    return all
  }

  async function fetchAllReviews(): Promise<Review[]> {
    const PAGE_SIZE = 100
    const all: Review[] = []
    let page = 1
    while (true) {
      try {
        // FIX: was fetchWithAuth(`${RECOGNITION_API}/v1/reviews?...`) — direct call
        // Now uses proxy client.
        const res = await recognitionClient.get<{ data: Review[]; pagination: { total_pages: number } }>(
          `/reviews?page=${page}&page_size=${PAGE_SIZE}`
        )
        const rows = res.data.data ?? []
        all.push(...rows)
        if (page >= (res.data.pagination?.total_pages ?? 1)) break
        page++
      } catch (e) {
        console.warn("Reviews fetch failed:", e)
        break
      }
    }
    return all
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [emps, revs] = await Promise.all([fetchAllEmployees(), fetchAllReviews()])
      setEmployees(emps)
      setAllReviews(revs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const reviews = useMemo(() =>
    allReviews.filter(r => {
      const d = new Date(r.review_at)
      return d.getMonth() === month && d.getFullYear() === year
    }),
    [allReviews, month, year]
  )

  const { managers, getTeam } = useMemo(() => {
    const managersSet = new Set(
      employees.map(e => e.manager_id).filter((id): id is string => !!id)
    )
    const mgrs = employees.filter(e => managersSet.has(e.employee_id))
    const get = (id: string) => employees.filter(e => e.manager_id === id)
    return { managers: mgrs, getTeam: get }
  }, [employees])

  const totalReviews = reviews.length
  const flaggedTotal = reviews.filter(r => r.rating <= FLAG_RATING).length
  const overallAvg = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : 0

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