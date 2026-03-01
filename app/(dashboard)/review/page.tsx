"use client"

/**
 * Review Page — Employee-facing
 *
 * Covers all Recognition Service endpoints:
 *   GET  /v1/review-categories  — category picker
 *   GET  /v1/reviews            — list my reviews (given + received)
 *   GET  /v1/reviews/{id}       — review detail (for edit pre-fill)
 *   POST /v1/reviews            — create review
 *   PUT  /v1/reviews/{id}       — edit own review
 *
 * Business rules surfaced in UI:
 *   - Monthly quota = team size (backend-enforced, shown in header)
 *   - Duplicate-pair guard (already reviewed this month → disabled)
 *   - Self-review blocked
 *   - Category required (DB-driven, not hardcoded)
 */

import { useState, useEffect, useCallback, useRef } from "react"
import axiosClient from "@/services/api-client"
import {
  Star, Send, Pencil, X, ChevronDown,
  MessageSquare, Clock, ArrowLeft, Check,
  AlertCircle, Loader2, Tag, Users, RotateCcw,
  Image as ImageIcon, Video
} from "lucide-react"
import { uploadToStorage } from "@/services/cloudinary"
import { getTeamMembersForUI, type TeamMember } from "@/services/employee-service"
import { requireAuthenticatedUserId } from "@/lib/api-utils"


// ─── Config ───────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewCategory {
  category_id: string
  category_code: string
  category_name: string
  multiplier: number
  description?: string | null
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
  review_at: string
  category_id?: string | null
  category_ids?: string[] | null
  category_code?: string | null
  category_codes?: string[] | null
  raw_points?: number | null
  category_tags?: { category_id: string; category_code: string; multiplier_snapshot: number }[] | null
}

type ViewMode = "list" | "compose" | "edit"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Below Average", 3: "Good", 4: "Great", 5: "Exceptional"
}

const RATING_COLORS: Record<number, string> = {
  1: "text-red-500", 2: "text-orange-400", 3: "text-amber-500",
  4: "text-green-600", 5: "text-indigo-600"
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}



// ─── Sub-components ───────────────────────────────────────────────────────────

function StarPicker({ value, onChange, disabled }: {
  value: number; onChange: (v: number) => void; disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" disabled={disabled}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-1.5 rounded-xl hover:bg-amber-50 transition-colors disabled:cursor-not-allowed">
          <Star size={22}
            className={`transition-transform duration-150
              ${i <= (hover || value) ? "fill-amber-400 text-amber-400 scale-110" : "fill-gray-100 text-gray-200"}`} />
        </button>
      ))}
    </div>
  )
}

function CategoryCard({
  cat, selected, onClick, disabled
}: { cat: ReviewCategory; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`relative flex flex-col gap-1.5 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 w-full
        ${disabled && !selected ? 'opacity-40 cursor-not-allowed' : ''}
        ${selected
          ? `border-indigo-500 bg-indigo-50/60 shadow-sm`
          : `border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm`}`}
    >
      <span className={`text-sm font-semibold leading-snug ${selected ? "text-indigo-700" : "text-gray-800"}`}>
        {cat.category_name}
      </span>
      {cat.description && (
        <span className="text-[11px] text-gray-400 leading-snug line-clamp-1">{cat.description}</span>
      )}
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
          <Check size={11} className="text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

function ReviewCard({
  review, myId, categories, onEdit
}: { review: Review; myId: string; categories: ReviewCategory[]; onEdit: (r: Review) => void }) {
  const isMine = review.reviewer_id === myId
  const catNames = (review.category_ids ?? (review.category_id ? [review.category_id] : []))
    .map(id => categories.find(c => c.category_id === id)?.category_name)
    .filter(Boolean) as string[]
  const catCodesFromResponse = review.category_codes ?? (review.category_code ? [review.category_code] : [])
  const displayCats = catNames.length > 0 ? catNames : catCodesFromResponse

  return (
    <div className={`group relative rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden`}>

      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full
              ${isMine ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
              {isMine ? "Given" : "Received"}
            </span>
            {displayCats.length > 0 && displayCats.map((name, i) => (
              <span key={i} className="text-[10px] font-medium bg-white text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag size={9} />{name}
              </span>
            ))}
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={14}
                className={s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
            ))}
          </div>
          <span className={`text-xs font-semibold ${RATING_COLORS[review.rating]}`}>
            {RATING_LABELS[review.rating]}
          </span>
        </div>

        {/* Comment */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

        {/* Media */}
        {(review.image_url || review.video_url) && (
          <div className="flex gap-3 mt-2.5">
            {review.image_url && (
              <a href={review.image_url} target="_blank" rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                <ImageIcon size={10} /> Image
              </a>
            )}
            {review.video_url && (
              <a href={review.video_url} target="_blank" rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                <Video size={10} /> Video
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Clock size={10} />{fmtDate(review.review_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

function Toast({ msg, kind, onClose }: {
  msg: string; kind: "success" | "error" | "warning"; onClose: () => void
}) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-amber-500"
  }[kind]
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-white text-sm font-medium
      shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 ${colors}`}>
      {msg}
      <button onClick={onClose} className="hover:opacity-70"><X size={14} /></button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewPage() {

  // ── Identity
  const [myId] = useState<string>(() => {
    try { return requireAuthenticatedUserId() } catch { return "" }
  })

  // ── Data
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<ReviewCategory[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null)
  const [totalReviews, setTotalReviews] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // ── Navigation
  const [view, setView] = useState<ViewMode>("compose")
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // ── Form
  const [receiverId, setReceiverId] = useState("")
  const [receiverOpen, setReceiverOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // ── UI
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" | "warning" } | null>(null)
  const [listTab, setListTab] = useState<"all" | "given" | "received">("all")

  // ── Derived monthly stats
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const givenThisMonth = reviews.filter(r =>
    r.reviewer_id === myId && new Date(r.review_at) >= monthStart
  ).length
  const reviewedThisMonth = new Set(
    reviews
      .filter(r => r.reviewer_id === myId && new Date(r.review_at) >= monthStart)
      .map(r => r.receiver_id)
  )


  // ── Load helpers ───────────────────────────────────────────────────────────

  const loadReviews = useCallback(async (pg = 1) => {
    try {
      const res = await axiosClient.get<{
        data: Review[];
        pagination: { total: number; total_pages: number }
      }>(`${API}/v1/reviews?page=${pg}&page_size=20`)
      setReviews(res.data.data)
      setTotalReviews(res.data.pagination.total)
      setTotalPages(res.data.pagination.total_pages)
      setPage(pg)
    } catch {
      setDataError("Failed to load reviews. Check your connection.")
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoadingData(true)
      try {
        const [catRes, teamRes] = await Promise.allSettled([
          axiosClient.get<{ data: ReviewCategory[] }>(
            `${API}/v1/review-categories?page=1&page_size=100&active_only=true`
          ),
          getTeamMembersForUI(),
        ])
        if (catRes.status === "fulfilled") setCategories(catRes.value.data.data ?? [])
        if (teamRes.status === "fulfilled") {
          setTeamMembers(teamRes.value.teamMembers)
          setTeamLeader(teamRes.value.teamLeader)
        }
        await loadReviews(1)
      } finally {
        setLoadingData(false)
      }
    }
    init()
  }, [loadReviews])

  // ── Navigation helpers ─────────────────────────────────────────────────────

  function openCompose() {
    setReceiverId(""); setRating(0); setCategoryIds([]); setComment(""); setFiles([])
    setEditingReview(null); setView("compose")
  }

  function openEdit(r: Review) {
    setReceiverId(r.receiver_id)
    setRating(r.rating)
    setCategoryIds(
      r.category_ids
      ?? (r.category_id ? [r.category_id] : [])
    )
    setComment(r.comment)
    setFiles([])
    setEditingReview(r)
    setView("edit")
  }

  function backToList() { setView("list"); setEditingReview(null) }

  // ── Derived form state ─────────────────────────────────────────────────────


  const allReceivers = [
    ...(teamLeader ? [{ ...teamLeader, isManager: true as const }] : []),
    ...teamMembers.map(m => ({ ...m, isManager: false as const })),
  ]

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (view === "compose" && !receiverId) {
      setToast({ msg: "Select who to review.", kind: "error" }); return
    }
    if (categoryIds.length === 0) {
      setToast({ msg: "Select at least one recognition category.", kind: "error" }); return
    }
    if (rating === 0) {
      setToast({ msg: "Give a star rating.", kind: "error" }); return
    }
    if (comment.trim().length < 10) {
      setToast({ msg: "Comment needs at least 10 characters.", kind: "error" }); return
    }

    setSubmitting(true)
    try {
      // Upload attachments → Cloudinary URLs
      let imageUrl: string | undefined, videoUrl: string | undefined
      for (const f of files) {
        const { url } = await uploadToStorage(f)
        if (f.type.startsWith("image") && !imageUrl) imageUrl = url
        if (f.type.startsWith("video") && !videoUrl) videoUrl = url
      }

      if (view === "edit" && editingReview) {
        // PUT — only send changed fields
        const patch: Record<string, unknown> = {}
        if (rating !== editingReview.rating) patch.rating = rating
        if (categoryIds.sort().join() !== (editingReview.category_ids ?? [editingReview.category_id]).filter(Boolean).sort().join()) patch.category_ids = categoryIds
        if (comment.trim() !== editingReview.comment) patch.comment = comment.trim()
        if (imageUrl) patch.image_url = imageUrl
        if (videoUrl) patch.video_url = videoUrl

        if (Object.keys(patch).length === 0) {
          setToast({ msg: "No changes to save.", kind: "warning" })
          setSubmitting(false); return
        }
        await axiosClient.put(`${API}/v1/reviews/${editingReview.review_id}`, patch)
        setToast({ msg: "Review updated. Points recalculated automatically.", kind: "success" })
      } else {
        // POST — all required fields
        await axiosClient.post(`${API}/v1/reviews`, {
          receiver_id: receiverId,
          rating,
          category_ids: categoryIds,
          comment: comment.trim(),
          ...(imageUrl && { image_url: imageUrl }),
          ...(videoUrl && { video_url: videoUrl }),
        })
        setToast({ msg: "Review submitted! Points credited to their wallet. 🎉", kind: "success" })
      }

      await loadReviews(1)
      backToList()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
        ?? (err instanceof Error ? err.message : "Submission failed.")
      setToast({ msg: detail, kind: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filteredReviews = reviews.filter(r => {
    if (listTab === "given") return r.reviewer_id === myId
    if (listTab === "received") return r.receiver_id === myId
    return true
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <button onClick={backToList}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-[22px] font-semibold text-gray-900">
                {view === "list" ? "Reviews" : view === "edit" ? "Edit Review" : "Write a Review"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {view === "list"
                  ? "Recognise colleagues · track your feedback"
                  : view === "edit"
                    ? "Update your review"
                    : "Give honest, constructive feedback to a teammate"
                }
              </p>
            </div>
          </div>
          {view !== "compose" && view !== "edit" && (
            <button onClick={openCompose}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm
                    px-5 py-2.5 rounded-full shadow-sm transition-all">
              <Pencil size={14} /> Write Review
            </button>
          )}
        </div>

        {/* ── Stats (list only) ─────────────────────────────────────── */}
        {view === "list" && !loadingData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6 bg-indigo-200/60 border border-indigo-200/40">
              <p className="text-sm text-gray-500">Given This Month</p>
              <h2 className="text-3xl font-semibold mt-2 text-gray-900">{givenThisMonth}</h2>
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>Unique people</span>
                <span>{reviewedThisMonth.size}</span>
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-green-200/60 border border-green-200/40">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <h2 className="text-3xl font-semibold mt-2 text-gray-900">{totalReviews}</h2>
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>Given &amp; received</span>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPOSE / EDIT FORM ──────────────────────────────────── */}
        {(view === "compose" || view === "edit") && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Form inputs ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Who to review (compose only) */}
              {view === "compose" && (
                <div className="rounded-2xl border border-gray-100 p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={15} className="text-indigo-600" /> Who are you reviewing?
                    <span className="text-red-400 font-normal text-xs ml-auto">required</span>
                  </label>
                  <div className="relative">
                    <button type="button"
                      onClick={() => setReceiverOpen(o => !o)}
                      className={`w-full flex items-center gap-3 rounded-xl border bg-gray-50 px-4 py-3 text-left transition-all
                            ${receiverOpen ? "ring-2 ring-indigo-300 border-transparent" : "border-gray-200 hover:border-gray-300"}`}>
                      {(() => {
                        const m = allReceivers.find(x => x.id === receiverId)
                        if (m) return (
                          <>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                                  ${m.isManager ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                              <p className="text-xs text-gray-400">{m.designation ?? (m.isManager ? "Manager" : "Team Member")}</p>
                            </div>
                          </>
                        )
                        return (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Users size={14} className="text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-400">Select a team member…</span>
                          </>
                        )
                      })()}
                      <ChevronDown size={16} className={`text-gray-400 ml-auto flex-shrink-0 transition-transform duration-200
                            ${receiverOpen ? "rotate-180" : ""}`} />
                    </button>

                    {receiverOpen && (
                      <div className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                        {allReceivers.length === 0
                          ? <p className="text-sm text-gray-400 p-5 text-center">No team members found.</p>
                          : allReceivers.map(m => {
                            const done = reviewedThisMonth.has(m.id)
                            return (
                              <button key={m.id} type="button" disabled={done}
                                onClick={() => { setReceiverId(m.id); setReceiverOpen(false) }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                                      ${done ? "opacity-40 cursor-not-allowed bg-gray-50" : "hover:bg-indigo-50 cursor-pointer"}
                                      ${receiverId === m.id ? "bg-indigo-50" : ""}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0
                                      ${m.isManager ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                                  <p className="text-xs text-gray-400">{m.designation ?? (m.isManager ? "Manager" : "")}</p>
                                </div>
                                {done && (
                                  <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    Reviewed
                                  </span>
                                )}
                              </button>
                            )
                          })
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Star rating */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star size={15} className="text-amber-400" /> Star Rating
                  <span className="text-red-400 font-normal text-xs ml-auto">required</span>
                </label>
                <StarPicker value={rating} onChange={setRating} disabled={submitting} />
                {rating > 0 && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                    <span className={`text-sm font-semibold ${RATING_COLORS[rating]}`}>{RATING_LABELS[rating]}</span>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag size={15} className="text-indigo-600" /> Recognition Category
                  <span className="text-gray-400 font-normal text-xs ml-auto">
                    {categoryIds.length}/5 selected
                    <span className="text-red-400 ml-1">· min 1</span>
                  </span>
                </label>
                {categories.length === 0
                  ? <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> Loading categories…</div>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map(cat => {
                      const isSelected = categoryIds.includes(cat.category_id)
                      const atMax = categoryIds.length >= 5 && !isSelected
                      return (
                        <CategoryCard key={cat.category_id} cat={cat}
                          selected={isSelected}
                          disabled={atMax}
                          onClick={() => {
                            setCategoryIds(prev =>
                              prev.includes(cat.category_id)
                                ? prev.filter(id => id !== cat.category_id)
                                : [...prev, cat.category_id]
                            )
                          }} />
                      )
                    })}
                  </div>
                }
              </div>

              {/* Comment */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare size={15} className="text-indigo-600" /> Your Feedback
                  </label>
                  <span className={`text-xs tabular-nums ${comment.length > 1900 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                    {comment.length}/2000
                  </span>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  disabled={submitting} rows={5} maxLength={2000}
                  placeholder="Be specific — describe what they did, the impact it had, and why it matters. Min 10 characters."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                        resize-none transition-all" />
              </div>

              {/* Attachments */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Attachments
                  <span className="font-normal text-gray-400 ml-2 text-xs">optional · image or video</span>
                </label>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs">
                        {f.type.startsWith("video") ? <Video size={12} className="text-purple-500" /> : <ImageIcon size={12} className="text-blue-500" />}
                        <span className="max-w-[120px] truncate text-gray-600">{f.name}</span>
                        <button type="button" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}>
                          <X size={12} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {files.length < 2 && (
                  <>
                    <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                      onChange={e => {
                        const picked = Array.from(e.target.files ?? [])
                        setFiles(prev => [...prev, ...picked].slice(0, 2))
                        if (fileRef.current) fileRef.current.value = ""
                      }} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-xl px-4 py-2.5
                            hover:bg-indigo-50 transition-colors">
                      + Add file
                    </button>
                  </>
                )}
              </div>

              {/* Submit button */}
              <button type="submit" disabled={submitting}
                className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700
                      text-white font-medium text-sm py-3.5 shadow-sm
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" />{view === "edit" ? "Saving…" : "Submitting…"}</>
                  : view === "edit"
                    ? <><RotateCcw size={15} />Save Changes</>
                    : <><Send size={15} />Submit Review</>
                }
              </button>
            </div>

            {/* ── Right: Guidelines ── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Guidelines */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-2.5">Review Guidelines</p>
                <ul className="space-y-1.5 text-xs text-amber-800">
                  <li className="flex items-start gap-1.5"><Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />Be specific about actions and their impact</li>
                  <li className="flex items-start gap-1.5"><Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />One review per teammate per month</li>
                  <li className="flex items-start gap-1.5"><Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />You cannot review yourself</li>
                  <li className="flex items-start gap-1.5"><Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />Recognition is credited automatically</li>
                  <li className="flex items-start gap-1.5"><Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />You can edit your own reviews anytime</li>
                </ul>
              </div>
            </div>
          </form>
        )}

        {/* ── LIST VIEW ──────────────────────────────────────────────── */}
        {view === "list" && (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-2 mb-6">
              {(["all", "given", "received"] as const).map(tab => (
                <button key={tab} onClick={() => setListTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize
                        ${listTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loadingData && (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            )}

            {/* Error */}
            {!loadingData && dataError && (
              <div className="flex flex-col items-center py-20 gap-3">
                <AlertCircle className="w-10 h-10 text-red-300" />
                <p className="text-gray-500 text-sm">{dataError}</p>
                <button onClick={() => loadReviews(1)} className="text-sm text-indigo-500 underline">Retry</button>
              </div>
            )}

            {/* Empty */}
            {!loadingData && !dataError && filteredReviews.length === 0 && (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-indigo-300" strokeWidth={1.5} />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {listTab === "given" ? "You haven't given any reviews yet."
                    : listTab === "received" ? "You haven't received any reviews yet."
                      : "No reviews yet."}
                </p>
                {listTab !== "received" && (
                  <button onClick={openCompose}
                    className="text-sm text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition">
                    Write your first review →
                  </button>
                )}
              </div>
            )}

            {/* Cards grid */}
            {!loadingData && !dataError && filteredReviews.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReviews.map(r => (
                    <ReviewCard key={r.review_id} review={r} myId={myId}
                      categories={categories} onEdit={openEdit} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pb-4">
                    <button disabled={page <= 1} onClick={() => loadReviews(page - 1)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600
                            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      ← Prev
                    </button>
                    <span className="text-sm text-gray-500 font-medium tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <button disabled={page >= totalPages} onClick={() => loadReviews(page + 1)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600
                            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && <Toast msg={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />}
    </div>
  )
}
