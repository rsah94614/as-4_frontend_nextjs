"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  Users, ChevronDown, ChevronUp, Star, Award, Calendar, Filter, X
} from "lucide-react"
import { fetchWithAuth } from "@/services/auth-service"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

// ─── Env vars ─────────────────────────────────────────────────────────────────
// FIX: Employee service runs on 8002, not 8003
const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || "http://localhost:8002"
const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  employee_id: string
  username: string
  email: string
  designation_name?: string
  department_name?: string
  manager_id?: string
  is_active: boolean
  date_of_joining: string
}

interface Review {
  review_id: string
  reviewer_id: string
  receiver_id: string
  rating: number
  comment: string
  review_at: string
}

interface MemberStats {
  avg_rating: number
  review_count: number
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
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${i === month ? "bg-orange-500 text-white shadow" : "text-slate-500 hover:bg-slate-100"
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
function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
          }`} />
      ))}
      <span className="text-xs font-semibold text-black ml-1">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  )
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────
// FIX: receives statsMap directly (computed in parent via useMemo, not useCallback)
function StatsPanel({ manager, members, statsMap, month, year }: {
  manager: Employee | null
  members: Employee[]
  statsMap: Record<string, MemberStats>
  month: number
  year: number
}) {
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  if (!manager) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Users className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Click a team to view stats</p>
      </div>
    )
  }

  const all = [manager, ...members]
  const rated = all.filter(m => (statsMap[m.employee_id]?.review_count ?? 0) > 0)
  const teamAvg = rated.length > 0
    ? rated.reduce((s, m) => s + (statsMap[m.employee_id]?.avg_rating ?? 0), 0) / rated.length
    : 0

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold text-black">{manager.username}&apos;s Team</p>
          <p className="text-[10px] text-slate-400">{MONTH_NAMES[month]} {year}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mb-1">
          Team Avg Rating
        </p>
        <Stars value={Number(teamAvg.toFixed(1))} />
        <p className="text-[10px] text-slate-400 mt-1">
          {rated.length} of {all.length} member{all.length !== 1 ? "s" : ""} reviewed
        </p>
      </div>

      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Members</p>

      <div className="space-y-2">
        {all.map((m, idx) => {
          const s = statsMap[m.employee_id]
          return (
            <div key={m.employee_id} className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${idx === 0 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                  }`}>
                  {m.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">{m.username}</p>
                  <p className="text-[10px] text-slate-400 truncate">{m.designation_name || "—"}</p>
                </div>
                {idx === 0 && (
                  <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Lead
                  </span>
                )}
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[9px] text-slate-400 mb-0.5">
                  Avg Rating {s?.review_count ? `(${s.review_count} reviews)` : "(no reviews)"}
                </p>
                <Stars value={s?.avg_rating ?? 0} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Team Card ────────────────────────────────────────────────────────────────
function TeamCard({ manager, members, expanded, selected, onToggle, onSelect }: {
  manager: Employee; members: Employee[]
  expanded: boolean; selected: boolean
  onToggle: () => void; onSelect: () => void
}) {
  return (
    <div className={`bg-white rounded-2xl border transition-all ${selected ? "border-orange-300 shadow-md" : "border-slate-100 shadow-sm"
      }`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => { onSelect(); onToggle() }}
      >
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-black truncate">{manager.username}</p>
            <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0">
              Manager
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            {manager.designation_name || "—"} · {manager.department_name || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" />{members.length}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {members.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No direct reports</p>
          ) : members.map(emp => (
            <div key={emp.employee_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {emp.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{emp.username}</p>
                <p className="text-xs text-slate-400 truncate">{emp.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-black">{emp.designation_name || "—"}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}>
                  {emp.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminTeamsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedMgrId, setSelectedMgrId] = useState<string | null>(null)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  // ── Paginated fetchers — backend caps both services at le=100 ─────────────
  // Employee service: param is `limit` (max 100)
  // Recognition service: param is `page_size` (max 100)
  // We loop through all pages and concatenate results.

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
        // 403 = non-admin; silently return what we have
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

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [employees, reviews] = await Promise.all([
        fetchAllEmployees(),
        fetchAllReviews(),
      ])
      setAllEmployees(employees)
      setAllReviews(reviews)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Filter reviews client-side by month/year (memoised) ───────────────────
  const filteredReviews = useMemo(() =>
    allReviews.filter(r => {
      const d = new Date(r.review_at)
      return d.getMonth() === month && d.getFullYear() === year
    }),
    [allReviews, month, year]
  )

  // ── Compute per-member stats from filtered reviews (memoised) ─────────────
  // FIX: was incorrectly wrapped in useCallback() then immediately called with ()
  // which meant it was calling useCallback's return value (a function), not the map.
  // Now it's a plain useMemo returning the map object directly.
  const statsMap = useMemo((): Record<string, MemberStats> => {
    const map: Record<string, MemberStats> = {}
    filteredReviews.forEach(r => {
      if (!map[r.receiver_id]) {
        map[r.receiver_id] = { avg_rating: 0, review_count: 0 }
      }
      const prev = map[r.receiver_id]
      const total = prev.avg_rating * prev.review_count + r.rating
      prev.review_count += 1
      prev.avg_rating = total / prev.review_count
    })
    return map
  }, [filteredReviews])

  // ── Build team structure (memoised) ───────────────────────────────────────
  const { managers, getTeam, deptOptions } = useMemo(() => {
    const managersSet = new Set(
      allEmployees.map(e => e.manager_id).filter((id): id is string => !!id)
    )
    const mgrs = allEmployees.filter(e => managersSet.has(e.employee_id))
    const get = (id: string) => allEmployees.filter(e => e.manager_id === id)
    const opts = Array.from(
      new Set(allEmployees.map(e => e.department_name).filter((d): d is string => !!d))
    )
    return { managers: mgrs, getTeam: get, deptOptions: opts }
  }, [allEmployees])

  // ── Filter managers by search + dept (memoised) ───────────────────────────
  const filteredManagers = useMemo(() => {
    const term = search.toLowerCase()
    return managers.filter(m => {
      const team = getTeam(m.employee_id)
      const match = !term
        || m.username.toLowerCase().includes(term)
        || m.designation_name?.toLowerCase().includes(term)
        || team.some(e =>
          e.username.toLowerCase().includes(term) ||
          e.designation_name?.toLowerCase().includes(term)
        )
      const dept = !deptFilter
        || m.department_name === deptFilter
        || team.some(e => e.department_name === deptFilter)
      return match && dept
    })
  }, [managers, getTeam, search, deptFilter])

  const selectedManager = useMemo(
    () => allEmployees.find(e => e.employee_id === selectedMgrId) ?? null,
    [allEmployees, selectedMgrId]
  )
  const selectedTeam = useMemo(
    () => selectedMgrId ? getTeam(selectedMgrId) : [],
    [selectedMgrId, getTeam]
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black">Teams</h1>
              <p className="text-slate-500 font-medium">
                Browse employees organised by team hierarchy.
              </p>
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

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or designation..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white appearance-none"
                >
                  <option value="">All Departments</option>
                  {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {(search || deptFilter) && (
                <button
                  onClick={() => { setSearch(""); setDeptFilter("") }}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <button
                onClick={fetchAll}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-500 hover:border-orange-300 transition ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Two-column layout */}
            <div className="flex gap-4 items-start">
              {/* Left: team list */}
              <div className="flex-1 min-w-0 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button onClick={fetchAll} className="text-sm text-orange-500 underline">
                      Try again
                    </button>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                    No teams found.
                  </div>
                ) : filteredManagers.map(mgr => (
                  <TeamCard
                    key={mgr.employee_id}
                    manager={mgr}
                    members={getTeam(mgr.employee_id)}
                    expanded={expandedIds.has(mgr.employee_id)}
                    selected={selectedMgrId === mgr.employee_id}
                    onToggle={() => {
                      setExpandedIds(prev => {
                        const next = new Set(prev)
                        next.has(mgr.employee_id)
                          ? next.delete(mgr.employee_id)
                          : next.add(mgr.employee_id)
                        return next
                      })
                    }}
                    onSelect={() => setSelectedMgrId(mgr.employee_id)}
                  />
                ))}
              </div>

              {/* Right: stats panel — sticky relative to the main scroller */}
              <div className="w-72 flex-shrink-0 sticky top-6 self-start bg-white rounded-2xl border border-slate-100 shadow-sm overflow-y-auto max-h-[calc(100vh-6rem)]">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-black text-sm">Team Stats</span>
                </div>
                <StatsPanel
                  manager={selectedManager}
                  members={selectedTeam}
                  statsMap={statsMap}
                  month={month}
                  year={year}
                />
              </div>
            </div>
          </div>{/* end flex flex-col gap-4 */}
        </main>
      </div>
    </div>
  )
}