"use client"

import { useMemo, useState } from "react"
import {
    Star, Users, Tag, MessageSquare, Loader2,
    Send, RotateCcw, Check, X, Image as ImageIcon, Video,
    TrendingUp, Award, BarChart3, Clock,
    CheckCircle2, PenLine,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import StarPicker from "./StarPicker"
import CategoryPicker from "./CategoryPicker"
import ReceiverPicker from "./ReceiverPicker"
import type { Review, ReviewCategory, ViewMode, SubmittedReviewData } from "@/types/review-types"
import type { TeamMember } from "@/services/employee-service"
import { RATING_LABELS, RATING_COLORS, fmtDate } from "@/lib/review-utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Filter categories based on star rating and multiplier value */
function filterCategoriesByRating(categories: ReviewCategory[], rating: number): ReviewCategory[] {
    if (rating <= 0) return categories

    if (rating < 3) {

        return categories.filter((c) => c.multiplier < 1)
    } else {

        return categories.filter((c) => c.multiplier > 1)
    }
}

// ─── Review Compose Form ──────────────────────────────────────────────────────

interface ReviewComposeFormProps {
    view: ViewMode
    // Receiver
    allReceivers: (TeamMember & { isManager: boolean })[]
    receiverId: string
    onReceiverChange: (id: string) => void
    reviewedThisMonth: Set<string>
    // Rating
    rating: number
    onRatingChange: (r: number) => void
    // Categories
    categories: ReviewCategory[]
    categoryIds: string[]
    onCategoryIdsChange: React.Dispatch<React.SetStateAction<string[]>>
    // Comment
    comment: string
    onCommentChange: (c: string) => void
    // Files
    files: File[]
    onFilesChange: React.Dispatch<React.SetStateAction<File[]>>
    fileRef: React.RefObject<HTMLInputElement | null>
    // Submit
    submitting: boolean
    onSubmit: (e: React.FormEvent) => void
    // Stats
    givenThisMonth: number
    uniquePeopleCount: number
    totalReviews: number
    loadingStats?: boolean
    // Reviews for scrollable comments
    reviews: Review[]
    myId: string
    // Submitted state
    submittedData?: SubmittedReviewData | null
    onStartNew?: () => void
}

export default function ReviewComposeForm({
    view,
    allReceivers,
    receiverId,
    onReceiverChange,
    reviewedThisMonth,
    rating,
    onRatingChange,
    categories,
    categoryIds,
    onCategoryIdsChange,
    comment,
    onCommentChange,
    files,
    onFilesChange,
    fileRef,
    submitting,
    onSubmit,
    givenThisMonth,
    uniquePeopleCount,
    totalReviews,
    loadingStats,
    reviews,
    myId,
    submittedData,
    onStartNew,
}: ReviewComposeFormProps) {

    // ── Filter categories based on star rating ──
    const filteredCategories = useMemo(() => {
        const filtered = filterCategoriesByRating(categories, rating)
        // If filtering removes everything, fall back to showing all categories
        return filtered.length > 0 ? filtered : categories
    }, [categories, rating])

    const handleRatingChange = (newRating: number) => {
        onRatingChange(newRating)
        // Deselect any categories that will no longer be visible
        const filtered = filterCategoriesByRating(categories, newRating)
        const validSet = filtered.length > 0
            ? new Set(filtered.map((c) => c.category_id))
            : new Set(categories.map((c) => c.category_id))

        onCategoryIdsChange((prev) => prev.filter((id) => validSet.has(id)))
    }

    // ── My given reviews for scrollable comments ──
    const myGivenReviews = useMemo(() => {
        return reviews
            .filter((r) => r.reviewer_id === myId)
            .sort((a, b) => new Date(b.review_at).getTime() - new Date(a.review_at).getTime())
    }, [reviews, myId])

    // ── Expandable comments state ──
    const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)
    const [expandedSubmitted, setExpandedSubmitted] = useState(false)

    // ── Dynamic max categories ──
    const maxCategories = Math.min(filteredCategories.length, 5)

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Left: Form inputs ── */}
            <div className="lg:col-span-3 space-y-5">

                {/* ── Submitted Success State ── */}
                {view === "submitted" && submittedData && (
                    <Card className="rounded-2xl border border-green-100 shadow-none py-0 overflow-hidden">
                        {/* Success header */}
                        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 px-6 py-8 text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">Review Submitted!</h2>
                            <p className="text-sm text-green-100">Your feedback has been recorded successfully</p>
                        </div>

                        <CardContent className="p-6 space-y-4">
                            {/* Receiver */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Users size={16} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Reviewed</p>
                                    <p className="text-sm font-semibold text-gray-800">{submittedData.receiverName}</p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={16}
                                            className={
                                                s <= submittedData.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-gray-200 text-gray-200"
                                            }
                                        />
                                    ))}
                                </div>
                                <span className={`text-sm font-semibold ${RATING_COLORS[submittedData.rating]}`}>
                                    {RATING_LABELS[submittedData.rating]}
                                </span>
                            </div>

                            {/* Categories */}
                            {submittedData.categoryNames.length > 0 && (
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Categories</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {submittedData.categoryNames.map((name) => (
                                            <span
                                                key={name}
                                                className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full px-2.5 py-1"
                                            >
                                                <Tag size={10} />
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comment */}
                            {submittedData.comment && (
                                <div
                                    className="bg-gray-50 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100/80 transition-colors"
                                    onClick={() => setExpandedSubmitted((prev) => !prev)}
                                >
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Your Feedback</p>
                                    <p className={`text-sm text-gray-700 leading-relaxed ${expandedSubmitted ? "" : "line-clamp-4"}`}>
                                        {submittedData.comment}
                                    </p>
                                    {submittedData.comment.length > 200 && (
                                        <p className="text-[10px] text-purple-500 font-medium mt-1.5">
                                            {expandedSubmitted ? "Show less" : "Click to read more…"}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Submitted time */}
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                                <Clock size={11} />
                                {fmtDate(submittedData.submittedAt)}
                            </div>
                        </CardContent>

                        {/* Write Another Review button */}
                        <div className="px-6 pb-6">
                            <Button
                                type="button"
                                onClick={onStartNew}
                                className="w-full rounded-full bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm py-3.5 h-auto shadow-sm"
                            >
                                <PenLine size={15} />
                                Write Another Review
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Who to review (compose only) */}
                {view === "compose" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                        <CardContent className="p-5">
                            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users size={15} className="text-purple-700" /> Who are you reviewing?
                                <span className="text-red-500 font-bold text-sm ml-1">*</span>
                            </label>
                            <ReceiverPicker
                                allReceivers={allReceivers}
                                receiverId={receiverId}
                                onSelect={onReceiverChange}
                                reviewedThisMonth={reviewedThisMonth}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Star rating */}
                {view !== "submitted" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0 group/stars">
                        <CardContent className="p-5">
                            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Star size={15} className="text-amber-400" /> Star Rating
                                <span className="text-red-500 font-bold text-sm ml-1">*</span>
                            </label>
                            <StarPicker value={rating} onChange={handleRatingChange} disabled={submitting} />
                            <div className={`flex items-center gap-3 mt-3 pt-3 border-t transition-opacity duration-200 ${rating > 0
                                ? "border-gray-50 opacity-100"
                                : "border-transparent opacity-0 group-hover/stars:opacity-50"
                                }`}>
                                <span className={`text-sm font-semibold ${rating > 0 ? RATING_COLORS[rating] : "text-gray-400"}`}>
                                    {rating > 0 ? RATING_LABELS[rating] : "\u00A0"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Category */}
                {view !== "submitted" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                        <CardContent className="p-5">
                            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Tag size={15} className="text-purple-700" /> Recognition Category
                                <span className="text-red-500 font-bold text-sm ml-1">*</span>
                                <span className="text-gray-400 font-normal text-xs ml-auto">
                                    {categoryIds.length}/{maxCategories} selected
                                </span>
                            </label>
                            {categories.length === 0 ? (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Loader2 size={14} className="animate-spin" /> Loading categories…
                                </div>
                            ) : (
                                <CategoryPicker
                                    categories={filteredCategories}
                                    selectedIds={categoryIds}
                                    onChange={onCategoryIdsChange}
                                    disabled={submitting}
                                    maxSelectable={maxCategories}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Comment */}
                {view !== "submitted" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MessageSquare size={15} className="text-purple-700" /> Your Feedback
                                    <span className="text-red-500 font-bold text-sm ml-1">*</span>
                                </label>
                                <span
                                    className={`text-xs tabular-nums ${comment.length > 1900 ? "text-red-500 font-semibold" : "text-gray-400"
                                        }`}
                                >
                                    {comment.length}/2000
                                </span>
                            </div>
                            <Textarea
                                value={comment}
                                onChange={(e) => onCommentChange(e.target.value)}
                                disabled={submitting}
                                rows={5}
                                maxLength={2000}
                                placeholder="Be specific — describe what they did, the impact it had, and why it matters. Min 10 characters."
                                className="rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800
                placeholder:text-gray-400 focus:ring-2 focus:ring-purple-300 focus:border-transparent
                resize-none"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Attachments */}
                {view !== "submitted" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                        <CardContent className="p-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Attachments
                                <span className="font-normal text-gray-400 ml-2 text-xs">optional · image or video</span>
                            </label>

                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {files.map((f, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs"
                                        >
                                            {f.type.startsWith("video") ? (
                                                <Video size={12} className="text-purple-500" />
                                            ) : (
                                                <ImageIcon size={12} className="text-blue-500" />
                                            )}
                                            <span className="max-w-30 truncate text-gray-600">{f.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => onFilesChange((fs) => fs.filter((_, j) => j !== i))}
                                            >
                                                <X size={12} className="text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {files.length < 2 && (
                                <>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const picked = Array.from(e.target.files ?? [])
                                            onFilesChange((prev) => [...prev, ...picked].slice(0, 2))
                                            if (fileRef.current) fileRef.current.value = ""
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="text-sm text-purple-700 font-medium border border-dashed border-purple-200 rounded-xl px-4 py-2.5
                    hover:bg-purple-50 transition-colors"
                                    >
                                        + Add file
                                    </button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Submit button (hide on submitted view) */}
                {view !== "submitted" && (
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm py-3.5 h-auto
                shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {view === "edit" ? "Saving…" : "Submitting…"}
                            </>
                        ) : view === "edit" ? (
                            <>
                                <RotateCcw size={15} />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Send size={15} />
                                Submit Review
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* ── Right: Guidelines + Stats + Recent Comments ── */}
            <div className="lg:col-span-2 space-y-4">
                {/* Review Guidelines */}
                <Card className="rounded-2xl border border-purple-100 bg-purple-50 shadow-none py-0">
                    <CardContent className="p-5">
                        <p className="text-[11px] font-bold text-purple-700 uppercase tracking-widest mb-2.5">
                            Review Guidelines
                        </p>
                        <ul className="space-y-1.5 text-xs text-purple-800">
                            {[
                                "Be specific about actions and their impact",
                                "One review per teammate per month",
                                "You cannot review yourself",
                                "Recognition is credited automatically",
                            ].map((text) => (
                                <li key={text} className="flex items-start gap-1.5">
                                    <Check size={11} className="mt-0.5 shrink-0 text-purple-600" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* ── Your Review Activity Stats ── */}
                <Card className="rounded-2xl border border-gray-100 shadow-none py-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-5 py-4">
                        <p className="text-[11px] font-bold text-purple-200 uppercase tracking-widest flex items-center gap-1.5">
                            <BarChart3 size={12} />
                            Your Review Activity
                        </p>
                    </div>

                    <CardContent className="p-0">
                        {loadingStats ? (
                            <div className="p-5 space-y-4">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-6 w-10" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {/* Given This Month */}
                                <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-purple-50/50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <TrendingUp size={14} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-700">Given This Month</p>
                                            <p className="text-[10px] text-gray-400">Reviews submitted</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 tabular-nums">
                                        {givenThisMonth}
                                    </span>
                                </div>

                                {/* Unique People */}
                                <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-blue-50/50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Users size={14} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-700">Unique People</p>
                                            <p className="text-[10px] text-gray-400">Reviewed this month</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 tabular-nums">
                                        {uniquePeopleCount}
                                    </span>
                                </div>

                                {/* Total Reviews */}
                                <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-green-50/50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Award size={14} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-700">Total Reviews</p>
                                            <p className="text-[10px] text-gray-400">Given &amp; received</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 tabular-nums">
                                        {totalReviews}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Recent Comments (scrollable) ── */}
                <Card className="rounded-2xl border border-gray-100 shadow-none py-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 px-5 py-4">
                        <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                            <MessageSquare size={12} />
                            Your Recent Reviews
                        </p>
                    </div>

                    <CardContent className="p-0">
                        {loadingStats ? (
                            <div className="p-5 space-y-4">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                ))}
                            </div>
                        ) : myGivenReviews.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <MessageSquare size={24} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">No reviews given yet</p>
                            </div>
                        ) : (
                            <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                                {myGivenReviews.map((r) => {
                                    const isExpanded = expandedReviewId === r.review_id
                                    return (
                                        <div
                                            key={r.review_id}
                                            className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => setExpandedReviewId(isExpanded ? null : r.review_id)}
                                        >
                                            {/* Stars + Date */}
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            size={10}
                                                            className={
                                                                s <= r.rating
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "fill-gray-200 text-gray-200"
                                                            }
                                                        />
                                                    ))}
                                                    <span className={`text-[10px] font-semibold ml-1.5 ${RATING_COLORS[r.rating]}`}>
                                                        {RATING_LABELS[r.rating]}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                                    <Clock size={9} />
                                                    {fmtDate(r.review_at)}
                                                </span>
                                            </div>

                                            {/* Comment — click to expand */}
                                            <p className={`text-xs text-gray-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                                                {r.comment}
                                            </p>
                                            {r.comment && r.comment.length > 100 && (
                                                <p className="text-[10px] text-purple-500 font-medium mt-1">
                                                    {isExpanded ? "Show less" : "Read more…"}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
