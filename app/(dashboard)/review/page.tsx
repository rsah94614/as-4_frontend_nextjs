"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Paperclip, Loader2, AlertCircle, Pencil, Eye, X, CheckCircle2, RefreshCw } from "lucide-react"
import { createReview, reviewService } from "@/lib/reviewService"
import type { ReviewResponse } from "@/lib/reviewService"
import { getTeamMembersForUI, type TeamMember } from "@/lib/employeeService"
import { auth } from "@/lib/auth"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric"
  })
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

// ─── Star Rating (interactive) ────────────────────────────────────────────────
function StarPicker({ value, onChange, readonly = false }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`transition-all ${readonly ? "w-4 h-4" : "w-7 h-7 cursor-pointer"} ${s <= (readonly ? value : hovered || value)
            ? "fill-amber-400 text-amber-400"
            : "text-slate-200 fill-slate-200"
            }`}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
        />
      ))}
    </div>
  )
}

// ─── Rating Badge ─────────────────────────────────────────────────────────────
function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
      rating >= 3 ? "bg-amber-50 text-amber-700 border-amber-100" :
        "bg-red-50 text-red-600 border-red-100"
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      <Star className="w-2.5 h-2.5 fill-current" />{rating}/5
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-14 h-14 text-base" : size === "md" ? "w-10 h-10 text-sm" : "w-7 h-7 text-[10px]"
  return (
    <div className={`${s} rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {initials(name)}
    </div>
  )
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, title }: {
  open: boolean; onClose: () => void; children: React.ReactNode; title: string
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-bold text-lg text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Write / Edit Form (shared) ───────────────────────────────────────────────
function ReviewForm({
  receiverId, receiverName,
  initial, onSubmit, onCancel, mode
}: {
  receiverId: string; receiverName: string
  initial?: { rating: number; comment: string; image_url?: string | null; video_url?: string | null }
  onSubmit: (data: { rating: number; comment: string; files: File[] }) => Promise<void>
  onCancel: () => void
  mode: "create" | "edit"
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [comment, setComment] = useState(initial?.comment ?? "")
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const valid = Array.from(e.target.files).filter(f => {
      const t = f.type.split("/")[0]
      return t === "image" || t === "video"
    })
    setFiles(prev => [...prev, ...valid])
  }

  const handleSubmit = async () => {
    if (rating === 0) { setErr("Please select a rating"); return }
    if (comment.trim().length < 10) { setErr("Comment must be at least 10 characters"); return }
    if (comment.trim().length > 2000) { setErr("Comment must not exceed 2000 characters"); return }
    setBusy(true); setErr(null)
    try {
      await onSubmit({ rating, comment, files })
      setDone(true)
      setTimeout(onCancel, 1400)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="font-semibold text-black">
          {mode === "create" ? "Review submitted!" : "Review updated!"}
        </p>
        <p className="text-sm text-slate-500">Closing…</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Recipient */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
        <Avatar name={receiverName} size="md" />
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {mode === "create" ? "Reviewing" : "Edited review for"}
          </p>
          <p className="font-bold text-black">{receiverName}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Rating <span className="text-red-400">*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex justify-between">
          <span>Comment <span className="text-red-400">*</span></span>
          <span className={`font-normal normal-case ${comment.length > 1900 ? "text-red-400" : "text-slate-400"}`}>
            {comment.length}/2000
          </span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Write your review… (min 10 characters)"
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
      </div>

      {/* Existing media (edit mode) */}
      {mode === "edit" && (initial?.image_url || initial?.video_url) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Current Attachments</p>
          <div className="flex gap-2 flex-wrap">
            {initial?.image_url && (
              <img src={initial.image_url} alt="attachment" className="h-20 rounded-xl object-cover border border-slate-100" />
            )}
            {initial?.video_url && (
              <video src={initial.video_url} controls className="h-20 rounded-xl object-cover border border-slate-100" />
            )}
          </div>
        </div>
      )}

      {/* New file upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          {mode === "edit" ? "Replace Attachments" : "Attachments"} (Optional)
        </label>
        <label
          htmlFor={`upload-${receiverId}-${mode}`}
          className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition">
            <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 group-hover:text-orange-600">
              Click to attach photos or videos
            </p>
            <p className="text-xs text-slate-400">First image + first video are saved</p>

          </div>
        </label>
        <input id={`upload-${receiverId}-${mode}`} type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="hidden" />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-600 flex-1 truncate">{f.name}</span>
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2.5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : mode === "create" ? "Submit Review" : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

// ─── Review Detail Modal (GET /{id}) ─────────────────────────────────────────
function ReviewDetailModal({ reviewId, onClose, memberName, currentUserId, onEdit }: {
  reviewId: string | null
  onClose: () => void
  memberName: string
  currentUserId: string
  onEdit: (review: ReviewResponse) => void
}) {
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!reviewId) return
    setLoading(true); setErr(null); setReview(null)
    reviewService.getReview(reviewId)
      .then(setReview)
      .catch(e => setErr(e instanceof Error ? e.message : "Failed to load review"))
      .finally(() => setLoading(false))
  }, [reviewId])

  const isOwner = review?.reviewer_id === currentUserId

  return (
    <Modal open={!!reviewId} onClose={onClose} title="Review Detail">
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-slate-300" />
        </div>
      )}
      {err && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl p-3">
          <AlertCircle className="w-4 h-4" />{err}
        </div>
      )}
      {review && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={memberName} size="md" />
              <div>
                <p className="font-bold text-black">{memberName}</p>
                <p className="text-xs text-slate-400">{fmt(review.review_at)}</p>
              </div>
            </div>
            <RatingBadge rating={review.rating} />
          </div>

          {/* Stars */}
          <StarPicker value={review.rating} readonly />

          {/* Comment */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
          </div>

          {/* Media */}
          {(review.image_url || review.video_url) && (
            <div className="grid grid-cols-2 gap-3">
              {review.image_url && (
                <img src={review.image_url} alt="attachment" className="rounded-xl object-cover w-full h-28 border border-slate-100" />
              )}
              {review.video_url && (
                <video src={review.video_url} controls className="rounded-xl object-cover w-full h-28 border border-slate-100" />
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex gap-2 text-[10px] text-slate-400 font-medium pt-1">
            <span>Created {fmt(review.created_at)}</span>
            {review.updated_at !== review.created_at && (
              <><span>·</span><span>Edited {fmt(review.updated_at)}</span></>
            )}
          </div>

          {/* Edit button — only if current user is the reviewer */}
          {isOwner && (
            <button
              onClick={() => onEdit(review)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-orange-200 text-orange-600 font-semibold text-sm hover:bg-orange-50 transition"
            >
              <Pencil className="w-4 h-4" /> Edit This Review
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

// ─── Write New Review Card ────────────────────────────────────────────────────
function WriteReviewCard({ member, onSuccess }: { member: TeamMember; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async ({ rating, comment, files }: { rating: number; comment: string; files: File[] }) => {
    const fd = new FormData()
    fd.append("receiver_id", member.id)
    fd.append("rating", rating.toString())
    fd.append("comment", comment)
    files.forEach(f => fd.append("attachments", f))
    await createReview(fd)
    onSuccess()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all p-5 flex flex-col items-center gap-3 text-center"
      >
        <Avatar name={member.name} size="lg" />
        <div>
          <p className="font-bold text-sm text-black">{member.name}</p>
          {member.designation && (
            <p className="text-[11px] text-slate-400 mt-0.5">{member.designation}</p>
          )}
        </div>
        <span className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-orange-500 group-hover:text-orange-600">
          <Star className="w-3 h-3" /> Write Review
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Write a Review">
        <ReviewForm
          receiverId={member.id}
          receiverName={member.name}
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}

// ─── Review Row (for given/received lists) ────────────────────────────────────
function ReviewRow({
  review, nameMap, currentUserId,
  onView, onEdit
}: {
  review: ReviewResponse
  nameMap: Record<string, string>
  currentUserId: string
  onView: (id: string, name: string) => void
  onEdit: (review: ReviewResponse) => void
}) {
  const isGiven = review.reviewer_id === currentUserId
  const otherName = isGiven
    ? (nameMap[review.receiver_id] ?? "Someone")
    : (nameMap[review.reviewer_id] ?? "Someone")

  return (
    <div className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 hover:shadow-sm transition group">
      <Avatar name={otherName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-bold text-black">{otherName}</p>
          <RatingBadge rating={review.rating} />
          <span className="text-[10px] text-slate-400 ml-auto">{fmt(review.review_at)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{review.comment}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* View detail — GET /{id} */}
        <button
          onClick={() => onView(review.review_id, otherName)}
          className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-orange-500 flex items-center justify-center transition"
          title="View detail"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        {/* Edit — PUT /{id}, only for reviewer */}
        {isGiven && (
          <button
            onClick={() => onEdit(review)}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-orange-500 flex items-center justify-center transition"
            title="Edit review"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Edit Review Modal (PUT /{id}) ────────────────────────────────────────────
function EditReviewModal({ review, nameMap, onClose, onSuccess }: {
  review: ReviewResponse | null
  nameMap: Record<string, string>
  onClose: () => void
  onSuccess: () => void
}) {
  const receiverName = review ? (nameMap[review.receiver_id] ?? "Someone") : ""

  const handleSubmit = async ({ rating, comment, files }: { rating: number; comment: string; files: File[] }) => {
    if (!review) return
    // Upload files first if provided
    let imageUrl: string | undefined
    let videoUrl: string | undefined
    if (files.length > 0) {
      const { uploadFile } = await import("@/lib/reviewService")
      for (const f of files) {
        const kind = f.type.split("/")[0]
        if (kind === "image" && !imageUrl) imageUrl = await uploadFile(f)
        if (kind === "video" && !videoUrl) videoUrl = await uploadFile(f)
      }
    }

    await reviewService.updateReview(review.review_id, {
      rating,
      comment,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(videoUrl ? { video_url: videoUrl } : {}),
    })
    onSuccess()
  }

  return (
    <Modal open={!!review} onClose={onClose} title="Edit Review">
      {review && (
        <ReviewForm
          receiverId={review.receiver_id}
          receiverName={receiverName}
          mode="edit"
          initial={{
            rating: review.rating,
            comment: review.comment,
            image_url: review.image_url,
            video_url: review.video_url,
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, count }: { title: string; subtitle?: string; count?: number }) {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div>
        <h2 className="text-xl font-bold text-black">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {count !== undefined && (
        <span className="mb-0.5 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const [loggedInUser, setLoggedInUser] = useState<TeamMember | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null)
  const [allReviews, setAllReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail modal state (GET /{id})
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailName, setDetailName] = useState("")

  // Edit modal state (PUT /{id})
  const [editReview, setEditReview] = useState<ReviewResponse | null>(null)

  // ── Load data ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      if (!auth.isAuthenticated()) { window.location.href = "/login"; return }

      // Fetch team structure + all reviews in parallel
      const [teamData, reviewsData] = await Promise.all([
        getTeamMembersForUI(),
        (async () => {
          // Paginate through all reviews (backend max page_size=100)
          const all: ReviewResponse[] = []
          let page = 1
          const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005"
          const { fetchWithAuth } = await import("@/lib/auth")
          while (true) {
            const res = await fetchWithAuth(`${RECOGNITION_API}/v1/reviews?page=${page}&page_size=100`)
            if (!res.ok) break
            const data = await res.json()
            all.push(...(data.data ?? []))
            if (page >= (data.pagination?.total_pages ?? 1)) break
            page++
          }
          return all
        })()
      ])

      setLoggedInUser(teamData.loggedInUser)
      setTeamMembers(teamData.teamMembers)
      setTeamLeader(teamData.teamLeader)
      setAllReviews(reviewsData)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load data"
      setError(msg)
      if (msg.includes("Authentication")) window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Derived data ─────────────────────────────────────────────────────────
  const myId = loggedInUser?.id ?? ""

  // Build a name lookup from everyone we know about
  const nameMap: Record<string, string> = {}
    ;[...teamMembers, ...(teamLeader ? [teamLeader] : []), ...(loggedInUser ? [loggedInUser] : [])]
      .forEach(m => { nameMap[m.id] = m.name })

  const givenReviews = allReviews.filter(r => r.reviewer_id === myId)
  const receivedReviews = allReviews.filter(r => r.receiver_id === myId)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="font-semibold text-black">Something went wrong</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={loadAll} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <main className="max-w-5xl p-6 space-y-10">

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Reviews</h1>
            <p className="text-slate-500 font-medium mt-1">
              Write peer reviews and track your feedback history.
            </p>
          </div>
          <button
            onClick={loadAll}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-orange-500 hover:border-orange-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── SECTION 1: Your Team — write new reviews ──────────────────── */}
        {(teamMembers.length > 0 || teamLeader) && (
          <section>
            <SectionHeader
              title="Your Team"
              subtitle="Click a colleague to write them a review."
              count={teamMembers.length + (teamLeader ? 1 : 0)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {teamMembers.map(m => (
                <WriteReviewCard key={m.id} member={m} onSuccess={loadAll} />
              ))}
              {teamLeader && (
                <div className="relative">
                  <WriteReviewCard member={teamLeader} onSuccess={loadAll} />
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                    Lead
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── SECTION 2: Reviews I Gave — can edit ──────────────────────── */}
        <section>
          <SectionHeader
            title="Reviews You Gave"
            subtitle="Your submitted reviews. Click the pencil to edit any of them."
            count={givenReviews.length}
          />
          {givenReviews.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400">You haven&apos;t written any reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {givenReviews.map(r => (
                <ReviewRow
                  key={r.review_id}
                  review={r}
                  nameMap={nameMap}
                  currentUserId={myId}
                  onView={(id, name) => { setDetailId(id); setDetailName(name) }}
                  onEdit={r => setEditReview(r)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 3: Reviews I Received — read only ─────────────────── */}
        <section className="pb-8">
          <SectionHeader
            title="Reviews You Received"
            subtitle="Feedback from your colleagues."
            count={receivedReviews.length}
          />
          {receivedReviews.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400">No reviews received yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {receivedReviews.map(r => (
                <ReviewRow
                  key={r.review_id}
                  review={r}
                  nameMap={nameMap}
                  currentUserId={myId}
                  onView={(id, name) => { setDetailId(id); setDetailName(name) }}
                  onEdit={r => setEditReview(r)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ── Detail Modal — GET /v1/reviews/{id} ──────────────────────────── */}
      <ReviewDetailModal
        reviewId={detailId}
        onClose={() => { setDetailId(null); setDetailName("") }}
        memberName={detailName}
        currentUserId={myId}
        onEdit={r => { setDetailId(null); setDetailName(""); setEditReview(r) }}
      />

      {/* ── Edit Modal — PUT /v1/reviews/{id} ────────────────────────────── */}
      <EditReviewModal
        review={editReview}
        nameMap={nameMap}
        onClose={() => setEditReview(null)}
        onSuccess={() => { setEditReview(null); loadAll() }}
      />
    </div>
  )
}