"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  Users, ChevronDown, ChevronUp, Star, Award, Calendar, Filter, X,
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Plus
} from "lucide-react"
import { createAuthenticatedClient, extractApiError } from "@/lib/api-utils"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

// ─── Proxy clients ────────────────────────────────────────────────────────────
const employeeClient = createAuthenticatedClient("/api/proxy/employees")
const recognitionClient = createAuthenticatedClient("/api/proxy/recognition")
const authClient = createAuthenticatedClient("/api/proxy/auth")

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  employee_id: string
  username: string
  email: string
  designation_id?: string
  designation_name?: string
  department_id?: string
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

interface BulkRowResult {
  row: number
  username?: string
  email?: string
  status: "success" | "error"
  error?: string
  employee_id?: string
}

interface BulkImportResult {
  total: number
  succeeded: number
  failed: number
  results: BulkRowResult[]
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────
function BulkImportModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function downloadTemplate() {
    const csv = [
      "username,email,password,designation_id,department_id,manager_id",
      "jdoe,jdoe@company.com,Password123,550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002,",
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function pickFile(f: File) {
    const name = f.name.toLowerCase()
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      setUploadError("Only .csv and .xlsx files are supported.")
      return
    }
    setFile(f)
    setUploadError(null)
    setResult(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      // FIX: was axiosClient.post(`${AUTH_API}/v1/auth/bulk-import`, ...)
      // Now routes through proxy. Note: override Content-Type so axios sets
      // multipart boundary correctly for FormData.
      const res = await authClient.post("/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const data = res.data
      setResult(data as BulkImportResult)
      if (data.succeeded > 0) onSuccess()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string | { msg?: string; loc?: string[] }[] } }; message?: string }
      const detail = axiosErr.response?.data?.detail
      if (Array.isArray(detail)) {
        setUploadError(
          detail
            .map((e: { msg?: string; loc?: string[] }) =>
              [e.loc?.slice(1).join(" → "), e.msg].filter(Boolean).join(": ")
            )
            .join(" | ")
        )
      } else if (typeof detail === "string") {
        setUploadError(detail)
      } else {
        setUploadError(extractApiError(err, "Upload failed"))
      }
    } finally {
      setUploading(false)
    }
  }

  function reset() {
    setFile(null)
    setResult(null)
    setUploadError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <p className="font-bold text-black text-sm">Bulk Import Employees</p>
              <p className="text-[11px] text-slate-400">Upload a CSV or XLSX file</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Required columns + template download */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-black">Required columns</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                username, email, password, designation_id, department_id
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                optional: manager_id
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-purple-300 hover:text-purple-700 transition flex-shrink-0"
            >
              <Download className="w-3 h-3" /> Template
            </button>
          </div>

          {/* Drop zone */}
          {!result && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${dragOver
                ? "border-purple-400 bg-purple-50"
                : file
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
                }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={e => e.target.files?.[0] && pickFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-black truncate max-w-[260px]">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">Drop file here or click to browse</p>
                    <p className="text-xs text-slate-400">.csv or .xlsx</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error banner */}
          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{uploadError}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  Total <span className="text-black">{result.total}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="w-3 h-3" /> {result.succeeded} succeeded
                </span>
                {result.failed > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-xs font-semibold text-red-600">
                    <AlertCircle className="w-3 h-3" /> {result.failed} failed
                  </span>
                )}
              </div>
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-56 overflow-y-auto">
                {result.results.map(r => (
                  <div
                    key={r.row}
                    className={`flex items-start gap-3 px-4 py-2.5 ${r.status === "error" ? "bg-red-50/50" : ""}`}
                  >
                    <span className="text-[10px] font-bold text-slate-300 w-8 flex-shrink-0 pt-0.5">
                      R{r.row}
                    </span>
                    {r.status === "success"
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {r.username || "—"}{" "}
                        <span className="font-normal text-slate-400">{r.email}</span>
                      </p>
                      {r.status === "error" && (
                        <p className="text-[11px] text-red-500 mt-0.5">{r.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          {result ? (
            <>
              <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Import Another
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 transition">
                Done
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                  : <><Upload className="w-4 h-4" /> Import</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Employee Modal ───────────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onSuccess, allEmployees }: {
  onClose: () => void
  onSuccess: () => void
  allEmployees: Employee[]
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    date_of_birth: "",
    designation_id: "",
    department_id: "",
    manager_id: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const designations = useMemo(() => {
    const map = new Map<string, { id: string, name: string }>()
    allEmployees.forEach(emp => {
      if (emp.designation_id && emp.designation_name) {
        map.set(emp.designation_id, { id: emp.designation_id, name: emp.designation_name })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allEmployees])

  const departments = useMemo(() => {
    const map = new Map<string, { id: string, name: string }>()
    allEmployees.forEach(emp => {
      if (emp.department_id && emp.department_name) {
        map.set(emp.department_id, { id: emp.department_id, name: emp.department_name })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allEmployees])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // FIX: was fetchWithAuth(`${AUTH_API}/v1/auth/signup`, ...)
      // Now routes through proxy: /api/proxy/auth/signup
      await authClient.post("/signup", {
        username: form.username,
        email: form.email,
        password: form.password,
        date_of_birth: form.date_of_birth,
        designation_id: form.designation_id,
        department_id: form.department_id,
        manager_id: form.manager_id || null,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(extractApiError(err, "Failed to add employee"))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldCls = "block w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-300 outline-none bg-white text-black transition-all"
  const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <p className="font-bold text-black text-sm">Add New Employee</p>
              <p className="text-[11px] text-slate-400">Fill in the details to register</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Username</label>
              <input
                required
                placeholder="e.g. johndoe"
                className={fieldCls}
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                required
                type="email"
                placeholder="john@company.com"
                className={fieldCls}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Temporary Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className={fieldCls}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input
                required
                type="date"
                className={fieldCls}
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Department</label>
                <select
                  required
                  className={fieldCls}
                  value={form.department_id}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                >
                  <option value="">Select...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Designation</label>
                <select
                  required
                  className={fieldCls}
                  value={form.designation_id}
                  onChange={e => setForm({ ...form, designation_id: e.target.value })}
                >
                  <option value="">Select...</option>
                  {designations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Manager (Optional)</label>
              <select
                className={fieldCls}
                value={form.manager_id}
                onChange={e => setForm({ ...form, manager_id: e.target.value })}
              >
                <option value="">No Manager</option>
                {allEmployees.filter(e => e.is_active).map(e => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.username} ({e.department_name})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            form="add-employee-form"
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  )
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
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${i === month ? "bg-purple-700 text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
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
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs font-semibold text-black ml-1">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  )
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────
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
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold text-black">{manager.username}&apos;s Team</p>
          <p className="text-xs font-bold text-slate-800">{MONTH_NAMES[month]} {year}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mb-1">Team Avg Rating</p>
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
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${idx === 0 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                  {m.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">{m.username}</p>
                  <p className="text-[10px] text-slate-400 truncate">{m.designation_name || "—"}</p>
                </div>
                {idx === 0 && (
                  <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Lead</span>
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
    <div className={`bg-white rounded-2xl border transition-all ${selected ? "border-purple-300 shadow-md" : "border-slate-100 shadow-sm"}`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => { onSelect(); onToggle() }}>
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
          {manager.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-black truncate">{manager.username}</p>
            <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">Manager</span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            {manager.designation_name || "—"} · {manager.department_name || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" />{members.length}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
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
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)

  async function fetchAllEmployees(): Promise<Employee[]> {
    const PAGE_SIZE = 100
    const all: Employee[] = []
    let page = 1
    while (true) {
      // FIX: was fetchWithAuth(`${EMPLOYEE_API}/v1/employees?...`) — direct call + wrong path
      // Employee list route is /list, not /. Now uses proxy client.
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

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [employees, reviews] = await Promise.all([fetchAllEmployees(), fetchAllReviews()])
      setAllEmployees(employees)
      setAllReviews(reviews)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = fetchAll

  useEffect(() => { fetchAll() }, [fetchAll])

  const filteredReviews = useMemo(() =>
    allReviews.filter(r => {
      const d = new Date(r.review_at)
      return d.getMonth() === month && d.getFullYear() === year
    }), [allReviews, month, year])

  const statsMap = useMemo((): Record<string, MemberStats> => {
    const map: Record<string, MemberStats> = {}
    filteredReviews.forEach(r => {
      if (!map[r.receiver_id]) map[r.receiver_id] = { avg_rating: 0, review_count: 0 }
      const prev = map[r.receiver_id]
      const total = prev.avg_rating * prev.review_count + r.rating
      prev.review_count += 1
      prev.avg_rating = total / prev.review_count
    })
    return map
  }, [filteredReviews])

  const { managers, getTeam, deptOptions } = useMemo(() => {
    const managersSet = new Set(allEmployees.map(e => e.manager_id).filter((id): id is string => !!id))
    const mgrs = allEmployees.filter(e => managersSet.has(e.employee_id))
    const get = (id: string) => allEmployees.filter(e => e.manager_id === id)
    const opts = Array.from(new Set(allEmployees.map(e => e.department_name).filter((d): d is string => !!d)))
    return { managers: mgrs, getTeam: get, deptOptions: opts }
  }, [allEmployees])

  const filteredManagers = useMemo(() => {
    const term = search.toLowerCase();
    return managers.filter((m) => {
      const team = getTeam(m.employee_id);
      const match =
        !term ||
        m.username.toLowerCase().includes(term) ||
        m.designation_name?.toLowerCase().includes(term) ||
        team.some(
          (e) =>
            e.username.toLowerCase().includes(term) ||
            e.designation_name?.toLowerCase().includes(term)
        );
      const dept =
        !deptFilter ||
        m.department_name === deptFilter ||
        team.some((e) => e.department_name === deptFilter);
      return match && dept;
    });
  }, [managers, getTeam, search, deptFilter]);

  const selectedManager = useMemo(
    () => allEmployees.find((e) => e.employee_id === selectedMgrId) ?? null,
    [allEmployees, selectedMgrId]
  );

  const selectedTeam = useMemo(
    () => (selectedMgrId ? getTeam(selectedMgrId) : []),
    [selectedMgrId, getTeam]
  );

  const toggleExpand = (id: string) => {
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                  Teams
                </h1>
                <p className="text-slate-500 font-medium">
                  Browse employees organised by team hierarchy.
                </p>
              </div>
              {/* <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </button>
              </div> */}
            </div>

            {/* Calendar & Period */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Period
                </span>
              </div>
              <CalendarStrip
                month={month}
                year={year}
                onChange={(m, y) => {
                  setMonth(m);
                  setYear(y);
                }}
              />
              <button
                onClick={refresh}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-all ml-auto active:rotate-180 duration-500"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or designation..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all shadow-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none transition-all shadow-sm"
                >
                  <option value="">All Departments</option>
                  {deptOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {(search || deptFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDeptFilter("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition active:scale-95"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 hover:border-purple-300 transition"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </button>
              </div>
            </div>

            {/* Content Layout */}
            <div className="flex gap-4 items-start">
              {/* Left: Team List */}
              <div className="flex-1 min-w-0 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                    <p className="text-slate-400 font-medium text-sm animate-pulse">Loading team hierarchy...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4 bg-red-50/50 rounded-3xl border border-red-100">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                      <X className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-red-900 font-bold">Failed to load teams</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <button
                      onClick={refresh}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition active:scale-95"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 gap-3">
                    <Users className="w-10 h-10 text-slate-200" />
                    <p className="text-slate-400 font-medium">No teams match your criteria.</p>
                  </div>
                ) : (
                  filteredManagers.map((mgr) => (
                    <TeamCard
                      key={mgr.employee_id}
                      manager={mgr}
                      members={getTeam(mgr.employee_id)}
                      expanded={expandedIds.has(mgr.employee_id)}
                      selected={selectedMgrId === mgr.employee_id}
                      onToggle={() => toggleExpand(mgr.employee_id)}
                      onSelect={() => setSelectedMgrId(mgr.employee_id)}
                    />
                  ))
                )}
              </div>

              {/* Right: Stats Panel */}
              <div className="w-80 flex-shrink-0 sticky top-6 self-start bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-black text-sm tracking-tight">Team Performance</span>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <StatsPanel
                    manager={selectedManager}
                    members={selectedTeam}
                    statsMap={statsMap}
                    month={month}
                    year={year}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {bulkModalOpen && (
        <BulkImportModal
          onClose={() => setBulkModalOpen(false)}
          onSuccess={refresh}
        />
      )}

      {addModalOpen && (
        <AddEmployeeModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={refresh}
          allEmployees={allEmployees}
        />
      )}
    </div>
  );
}