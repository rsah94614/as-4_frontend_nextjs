"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Loader2, Flag, Star, X, ChevronDown, ChevronUp,
  MessageSquare, TrendingUp, Calendar
} from "lucide-react"
import { fetchWithAuth } from "@/lib/auth"
import Navbar  from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

// ─── Env vars ─────────────────────────────────────────────────────────────────
// FIX: Employee service runs on 8002, not 8003
const EMPLOYEE_API    = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL    || "http://localhost:8002"
const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005"

const FLAG_RATING = 2

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  employee_id:       string
  username:          string
  email:             string
  designation_name?: string
  department_name?:  string
  manager_id?:       string
  is_active:         boolean
}

interface Review {
  review_id:   string
  reviewer_id: string
  receiver_id: string
  rating:      number
  comment:     string
  image_url?:  string | null
  video_url?:  string | null
  status_id:   string
  review_at:   string
  created_at:  string
  created_by:  string
  updated_at:  string
  updated_by:  string
}

// ─── Calendar Strip ───────────────────────────────────────────────────────────
function CalendarStrip({ month, year, onChange }: {
  month: number; year: number; onChange: (m: number, y: number) => void
}) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const prev = () => month === 0  ? onChange(11, year - 1) : onChange(month - 1, year)
  const next = () => month === 11 ? onChange(0,  year + 1) : onChange(month + 1, year)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1 flex-wrap">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => onChange(i, year)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              i === month ? "bg-orange-500 text-white shadow" : "text-slate-500 hover:bg-slate-100"
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
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
    </div>
  )
}

// ─── Single review row ────────────────────────────────────────────────────────
function ReviewRow({ review, employees }: { review: Review; employees: Employee[] }) {
  const flagged  = review.rating <= FLAG_RATING
  const reviewer = employees.find(e => e.employee_id === review.reviewer_id)

  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 border ${
      flagged ? "bg-red-50/60 border-red-100" : "bg-white border-slate-100"
    }`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
        flagged ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
      }`}>
        {(reviewer?.username ?? "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-black">{reviewer?.username ?? "Unknown"}</span>
          <Stars value={review.rating} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            flagged
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
  // FIX: reviews where this member is the RECEIVER (not reviewer)
  const memberReviews = reviews.filter(r => r.receiver_id === member.employee_id)
  if (memberReviews.length === 0) return null

  const avg     = memberReviews.reduce((s, r) => s + r.rating, 0) / memberReviews.length
  const flagged = memberReviews.filter(r => r.rating <= FLAG_RATING).length

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
          flagged > 0 ? "bg-red-50" : "bg-slate-50"
        } hover:brightness-95`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
          isManager ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-600"
        }`}>
          {member.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-bold text-black flex-1 text-left">{member.username}</span>
        {isManager && (
          <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
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
  // FIX: Count reviews for all team members (manager + reports) as RECEIVERS
  const teamIds     = useMemo(
    () => new Set([manager.employee_id, ...members.map(m => m.employee_id)]),
    [manager.employee_id, members]
  )
  const teamReviews  = reviews.filter(r => teamIds.has(r.receiver_id))
  const flaggedCount = teamReviews.filter(r => r.rating <= FLAG_RATING).length
  const totalCount   = teamReviews.length
  const avg          = totalCount > 0
    ? teamReviews.reduce((s, r) => s + r.rating, 0) / totalCount
    : 0

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      flaggedCount > 0 ? "border-red-100" : "border-slate-100"
    }`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/50 transition text-left">
        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-black truncate">{manager.username}</p>
            <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0">
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
  const [employees,   setEmployees]   = useState<Employee[]>([])
  const [allReviews,  setAllReviews]  = useState<Review[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [search,      setSearch]      = useState("")
  const [showFlagged, setShowFlagged] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [month,       setMonth]       = useState(new Date().getMonth())
  const [year,        setYear]        = useState(new Date().getFullYear())

  // ── Paginated fetchers — backend caps both services at le=100 ─────────────
  // Employee service: param is `limit` (max 100)
  // Recognition service: param is `page_size` (max 100)

  async function fetchAllEmployees(): Promise<Employee[]> {
    const PAGE_SIZE = 100
    const all: Employee[] = []
    let page = 1
    while (true) {
      const res = await fetchWithAuth(
        `${EMPLOYEE_API}/v1/employees?limit=${PAGE_SIZE}&page=${page}`
      )
      if (!res.ok) throw new Error(`Failed to fetch employees (${res.status})`)
      const data = await res.json()
      const rows: Employee[] = data.data ?? []
      all.push(...rows)
      if (page >= (data.pagination?.total_pages ?? 1)) break
      page++
    }
    return all
  }

  async function fetchAllReviews(): Promise<Review[]> {
    const PAGE_SIZE = 100
    const all: Review[] = []
    let page = 1
    while (true) {
      const res = await fetchWithAuth(
        `${RECOGNITION_API}/v1/reviews?page=${page}&page_size=${PAGE_SIZE}`
      )
      if (!res.ok) {
        console.warn(`Reviews fetch returned ${res.status}`)
        break
      }
      const data = await res.json()
      const rows: Review[] = data.data ?? []
      all.push(...rows)
      if (page >= (data.pagination?.total_pages ?? 1)) break
      page++
    }
    return all
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [employees, reviews] = await Promise.all([
        fetchAllEmployees(),
        fetchAllReviews(),
      ])
      setEmployees(employees)
      setAllReviews(reviews)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Filter reviews by selected month/year (memoised) ──────────────────────
  // FIX: wrap in useMemo so derived arrays are stable references
  const reviews = useMemo(() =>
    allReviews.filter(r => {
      const d = new Date(r.review_at)
      return d.getMonth() === month && d.getFullYear() === year
    }),
    [allReviews, month, year]
  )

  // ── Build team structure (memoised) ───────────────────────────────────────
  // FIX: derive managers from employees whose employee_id appears as someone
  // else's manager_id — stable with useMemo
  const { managers, getTeam } = useMemo(() => {
    const managersSet = new Set(
      employees.map(e => e.manager_id).filter((id): id is string => !!id)
    )
    const mgrs = employees.filter(e => managersSet.has(e.employee_id))
    const get  = (id: string) => employees.filter(e => e.manager_id === id)
    return { managers: mgrs, getTeam: get }
  }, [employees])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalReviews = reviews.length
  const flaggedTotal = reviews.filter(r => r.rating <= FLAG_RATING).length
  const overallAvg   = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : 0

  // ── Filtered managers (memoised) ──────────────────────────────────────────
  // FIX: useMemo prevents re-running expensive filter on every render
  const filteredManagers = useMemo(() => {
    const term = search.toLowerCase()
    return managers.filter(m => {
      const team  = getTeam(m.employee_id)
      const match = !term
        || m.username.toLowerCase().includes(term)
        || team.some(e => e.username.toLowerCase().includes(term))
      const flag  = !showFlagged || (() => {
        const ids = new Set([m.employee_id, ...team.map(x => x.employee_id)])
        return reviews.some(r => ids.has(r.receiver_id) && r.rating <= FLAG_RATING)
      })()
      return match && flag
    })
  }, [managers, getTeam, search, showFlagged, reviews])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Reviews</h1>
            <p className="text-slate-500 font-medium">
              Monitor peer reviews by team. Ratings ≤ {FLAG_RATING} are automatically flagged.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Total Reviews
              </p>
              <p className="text-3xl font-bold text-black">{totalReviews}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Avg Rating
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold text-black">
                  {overallAvg > 0 ? overallAvg.toFixed(1) : "—"}
                </p>
                {overallAvg > 0 && <Stars value={Math.round(overallAvg)} size="md" />}
              </div>
            </div>
            <div
              onClick={() => setShowFlagged(v => !v)}
              className={`rounded-2xl border shadow-sm p-5 cursor-pointer transition-all select-none ${
                showFlagged
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-slate-100 hover:border-red-200"
              }`}
            >
              <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Flag className="w-3 h-3" /> Flagged
              </p>
              <p className="text-3xl font-bold text-red-500">{flaggedTotal}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {showFlagged ? "Showing flagged only — click to reset" : "Click to filter"}
              </p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Period</span>
            </div>
            <CalendarStrip
              month={month}
              year={year}
              onChange={(m, y) => { setMonth(m); setYear(y) }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search team or member..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>
            {(search || showFlagged) && (
              <button
                onClick={() => { setSearch(""); setShowFlagged(false) }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={() => setExpandedIds(new Set(filteredManagers.map(m => m.employee_id)))}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-black hover:bg-slate-50 transition"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedIds(new Set())}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-black hover:bg-slate-50 transition"
            >
              Collapse All
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-500 hover:border-orange-300 transition ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Teams list */}
          <div className="space-y-3 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <p className="text-slate-500 text-sm">{error}</p>
                <button onClick={fetchData} className="text-sm text-orange-500 underline">
                  Try again
                </button>
              </div>
            ) : filteredManagers.length === 0 ? (
              <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                {showFlagged
                  ? "No teams with flagged reviews this period."
                  : "No teams found."
                }
              </div>
            ) : filteredManagers.map(mgr => (
              <TeamSection
                key={mgr.employee_id}
                manager={mgr}
                members={getTeam(mgr.employee_id)}
                reviews={reviews}
                employees={employees}
                expanded={expandedIds.has(mgr.employee_id)}
                onToggle={() => {
                  setExpandedIds(prev => {
                    const next = new Set(prev)
                    next.has(mgr.employee_id)
                      ? next.delete(mgr.employee_id)
                      : next.add(mgr.employee_id)
                    return next
                  })
                }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}