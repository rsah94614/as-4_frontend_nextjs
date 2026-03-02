"use client"

import {
    Star, Users, Tag, MessageSquare, Loader2,
    Send, RotateCcw, Check, X, Image as ImageIcon, Video,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import StarPicker from "./StarPicker"
import CategoryPicker from "./CategoryPicker"
import ReceiverPicker from "./ReceiverPicker"
import type { ReviewCategory, ViewMode } from "@/types/review-types"
import type { TeamMember } from "@/services/employee-service"
import { RATING_LABELS, RATING_COLORS } from "@/lib/review-utils"

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
}: ReviewComposeFormProps) {
    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Left: Form inputs ── */}
            <div className="lg:col-span-3 space-y-5">
                {/* Who to review (compose only) */}
                {view === "compose" && (
                    <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                        <CardContent className="p-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users size={15} className="text-indigo-600" /> Who are you reviewing?
                                <span className="text-red-400 font-normal text-xs ml-auto">required</span>
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
                <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                    <CardContent className="p-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Star size={15} className="text-amber-400" /> Star Rating
                            <span className="text-red-400 font-normal text-xs ml-auto">required</span>
                        </label>
                        <StarPicker value={rating} onChange={onRatingChange} disabled={submitting} />
                        {rating > 0 && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                                <span className={`text-sm font-semibold ${RATING_COLORS[rating]}`}>
                                    {RATING_LABELS[rating]}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category */}
                <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                    <CardContent className="p-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Tag size={15} className="text-indigo-600" /> Recognition Category
                            <span className="text-gray-400 font-normal text-xs ml-auto">
                                {categoryIds.length}/5 selected
                                <span className="text-red-400 ml-1">· min 1</span>
                            </span>
                        </label>
                        {categories.length === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 size={14} className="animate-spin" /> Loading categories…
                            </div>
                        ) : (
                            <CategoryPicker
                                categories={categories}
                                selectedIds={categoryIds}
                                onChange={onCategoryIdsChange}
                                disabled={submitting}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Comment */}
                <Card className="rounded-2xl border border-gray-100 shadow-none py-0">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MessageSquare size={15} className="text-indigo-600" /> Your Feedback
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
                placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Attachments */}
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
                                        <span className="max-w-[120px] truncate text-gray-600">{f.name}</span>
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
                                    className="text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-xl px-4 py-2.5
                    hover:bg-indigo-50 transition-colors"
                                >
                                    + Add file
                                </button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3.5 h-auto
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
            </div>

            {/* ── Right: Guidelines ── */}
            <div className="lg:col-span-2 space-y-4">
                <Card className="rounded-2xl border border-amber-100 bg-amber-50 shadow-none py-0">
                    <CardContent className="p-5">
                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-2.5">
                            Review Guidelines
                        </p>
                        <ul className="space-y-1.5 text-xs text-amber-800">
                            {[
                                "Be specific about actions and their impact",
                                "One review per teammate per month",
                                "You cannot review yourself",
                                "Recognition is credited automatically",
                                "You can edit your own reviews anytime",
                            ].map((text) => (
                                <li key={text} className="flex items-start gap-1.5">
                                    <Check size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
