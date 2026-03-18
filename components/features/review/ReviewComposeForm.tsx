"use client"

import { useMemo, useState, useCallback } from "react"
import {
    Loader2, Send, Check, X, Image as ImageIcon, Video,
    CheckCircle2, Zap, Paperclip, AlertCircle,
} from "lucide-react"
import type { ToastState } from "@/types/review-types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import CategoryPicker from "./CategoryPicker"
import ReceiverPicker from "./ReceiverPicker"
import ReviewSidebar from "./ReviewWork"
import ReviewSuccessView from "./ReviewSuccessView"
import type { ReviewCategory, ViewMode, SubmittedReviewData } from "@/types/review-types"
import type { TeamMember } from "@/services/employee-service"
import { cn } from "@/lib/utils"

// ─── Validation constants ────────────────────────────────────────────────────

const COMMENT_MIN = 10
const COMMENT_MAX = 2000

// Allowed printable characters:
//   - Letters (any language via \p{L})
//   - Numbers \p{N}
//   - Spaces
//   - Common punctuation used in chat: . , ! ? ' " - _ ( ) @ # & + = % / : ; newlines
// Everything else (HTML tags, SQL injection chars like <>"`;\\, etc.) is stripped/blocked.
const ALLOWED_COMMENT_REGEX = /[^\p{L}\p{N}\s.,!?'"()\-_@#&+=%;/:\n]/gu

// Detects obvious injection attempts — reject outright rather than silently strip
const INJECTION_PATTERNS = [
    /<[^>]*>/,           // HTML tags
    /javascript:/i,      // JS URIs
    /on\w+\s*=/i,        // event handlers like onclick=
    /--/,                // SQL comment
    /;\s*(drop|select|insert|update|delete|truncate)/i, // SQL keywords after semicolon
    /\{\{.*\}\}/,        // template injection {{ }}
    /\$\{.*\}/,          // JS template literal injection
]

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"]
const MAX_IMAGE_BYTES = 10 * 1024 * 1024   // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024   // 50 MB

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPreviewPoints(categories: ReviewCategory[], selectedIds: string[], weight = 1.0): number {
    const total = selectedIds.reduce((sum, id) => {
        const cat = categories.find((c) => c.category_id === id)
        return sum + (cat ? cat.multiplier : 0)
    }, 0)
    return Math.round(total * weight * 10) / 10
}

function sanitizeComment(raw: string): string {
    return raw.replace(ALLOWED_COMMENT_REGEX, "")
}

function hasInjection(text: string): boolean {
    return INJECTION_PATTERNS.some((re) => re.test(text))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
    return (
        <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            done ? "bg-[#E31837] border-[#E31837] text-white"
                : active ? "bg-white border-[#004C8F] text-[#004C8F]"
                    : "bg-white border-gray-300 text-gray-300"
        )}>
            {done ? <Check size={12} strokeWidth={3} /> : n}
        </div>
    )
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p className="flex items-center gap-1.5 text-[11px] text-[#E31837] mt-1.5 font-medium">
            <AlertCircle size={11} className="shrink-0" />
            {message}
        </p>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
    receiver?: string
    categories?: string
    comment?: string
    files?: string
}

interface ReviewComposeFormProps {
    view: ViewMode
    allReceivers: (TeamMember & { isManager: boolean })[]
    receiverId: string
    onReceiverChange: (id: string) => void
    reviewedThisMonth: Set<string>
    categories: ReviewCategory[]
    categoryIds: string[]
    onCategoryIdsChange: React.Dispatch<React.SetStateAction<string[]>>
    comment: string
    onCommentChange: (c: string) => void
    files: File[]
    onFilesChange: React.Dispatch<React.SetStateAction<File[]>>
    fileRef: React.RefObject<HTMLInputElement | null>
    submitting: boolean
    onSubmit: (e: React.FormEvent) => void
    givenThisMonth: number
    uniquePeopleCount: number
    totalReviews: number
    loadingStats?: boolean
    reviewerWeight?: number
    submittedData?: SubmittedReviewData | null
    onStartNew?: () => void
    onToast: (t: ToastState) => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewComposeForm({
    view, allReceivers, receiverId, onReceiverChange, reviewedThisMonth,
    categories, categoryIds, onCategoryIdsChange, comment, onCommentChange,
    files, onFilesChange, fileRef, submitting, onSubmit,
    givenThisMonth, uniquePeopleCount, totalReviews, loadingStats,
    submittedData, onStartNew, reviewerWeight, onToast,
}: ReviewComposeFormProps) {
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const previewPts = useMemo(
        () => calcPreviewPoints(categories, categoryIds, reviewerWeight ?? 1.0),
        [categories, categoryIds, reviewerWeight]
    )

    // ── Per-field validators ─────────────────────────────────────────────────

    const validateReceiver = useCallback((id: string): string | undefined => {
        if (!id) return "Please select a teammate to recognise."
        return undefined
    }, [])

    const validateCategories = useCallback((ids: string[]): string | undefined => {
        if (ids.length === 0) return "Select at least one category."
        if (ids.length > 5) return "You can select up to 5 categories."
        return undefined
    }, [])

    const validateComment = useCallback((text: string): string | undefined => {
        if (!text.trim()) return "Feedback is required."
        if (hasInjection(text)) return "Your feedback contains disallowed characters or patterns."
        const sanitized = sanitizeComment(text)
        if (sanitized.trim().length < COMMENT_MIN)
            return `Feedback must be at least ${COMMENT_MIN} characters.`
        if (text.length > COMMENT_MAX)
            return `Feedback cannot exceed ${COMMENT_MAX} characters.`
        return undefined
    }, [])

    const validateFiles = useCallback((fileList: File[]): string | undefined => {
        for (const f of fileList) {
            if (!ALLOWED_FILE_TYPES.includes(f.type))
                return `"${f.name}" is not allowed. Use JPG, PNG, MP4, or MOV.`
            if (f.type.startsWith("image/") && f.size > MAX_IMAGE_BYTES)
                return `"${f.name}" exceeds the 10 MB image limit.`
            if (f.type.startsWith("video/") && f.size > MAX_VIDEO_BYTES)
                return `"${f.name}" exceeds the 50 MB video limit.`
        }
        return undefined
    }, [])

    // ── Full-form validation (returns true if clean) ─────────────────────────

    const validateAll = useCallback((): boolean => {
        const next: FormErrors = {
            receiver: validateReceiver(receiverId),
            categories: validateCategories(categoryIds),
            comment: validateComment(comment),
            files: validateFiles(files),
        }
        setErrors(next)
        setTouched({ receiver: true, categories: true, comment: true, files: true })
        return !Object.values(next).some(Boolean)
    }, [receiverId, categoryIds, comment, files, validateReceiver, validateCategories, validateComment, validateFiles])

    // ── Inline change handlers that clear/set errors on the fly ─────────────

    const handleReceiverChange = (id: string) => {
        onReceiverChange(id)
        if (touched.receiver)
            setErrors(e => ({ ...e, receiver: validateReceiver(id) }))
    }

    const handleCategoryChange: React.Dispatch<React.SetStateAction<string[]>> = (action) => {
        onCategoryIdsChange(action)
        const next = typeof action === "function" ? action(categoryIds) : action
        if (touched.categories)
            setErrors(e => ({ ...e, categories: validateCategories(next) }))
    }

    const handleCommentChange = (text: string) => {
        // Silently strip disallowed characters as user types
        if (hasInjection(text)) {
            setErrors(e => ({ ...e, comment: "Your feedback contains disallowed characters or patterns." }))
            setTouched(t => ({ ...t, comment: true }))
            return // Don't update comment state with injected content
        }
        const clean = sanitizeComment(text)
        onCommentChange(clean)
        if (touched.comment)
            setErrors(e => ({ ...e, comment: validateComment(clean) }))
    }

    const handleCommentBlur = () => {
        setTouched(t => ({ ...t, comment: true }))
        setErrors(e => ({ ...e, comment: validateComment(comment) }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? [])

        const typeErr = picked.find(f => !ALLOWED_FILE_TYPES.includes(f.type))
        if (typeErr) {
            onToast({ msg: `"${typeErr.name}" is not allowed. Use JPG, PNG, MP4, or MOV.`, kind: "error" })
            setErrors(er => ({ ...er, files: `"${typeErr.name}" type is not supported.` }))
            if (fileRef.current) fileRef.current.value = ""
            return
        }

        const sizeErr = picked.find(f =>
            (f.type.startsWith("image/") && f.size > MAX_IMAGE_BYTES) ||
            (f.type.startsWith("video/") && f.size > MAX_VIDEO_BYTES)
        )
        if (sizeErr) {
            const limit = sizeErr.type.startsWith("image/") ? "10 MB" : "50 MB"
            onToast({ msg: `"${sizeErr.name}" exceeds the ${limit} limit.`, kind: "error" })
            setErrors(er => ({ ...er, files: `"${sizeErr.name}" exceeds the ${limit} limit.` }))
            if (fileRef.current) fileRef.current.value = ""
            return
        }

        const next = [...files, ...picked].slice(0, 2)
        onFilesChange(() => next)
        setErrors(er => ({ ...er, files: validateFiles(next) }))
        if (fileRef.current) fileRef.current.value = ""
    }

    // ── Submit gate ──────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateAll()) {
            onToast({ msg: "Please fix the errors before submitting.", kind: "error" })
            return
        }
        onSubmit(e)
    }

    // ── Derived state ────────────────────────────────────────────────────────

    const step1Done = !!receiverId && !errors.receiver
    const step2Done = categoryIds.length > 0 && !errors.categories
    const step3Done = comment.trim().length >= COMMENT_MIN && !errors.comment
    const canSubmit = step1Done && step2Done && step3Done && !submitting && !errors.files
    const sidebarProps = { givenThisMonth, uniquePeopleCount, totalReviews, loadingStats }

    // ── Success view ─────────────────────────────────────────────────────────

    if (view === "submitted" && submittedData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2"><ReviewSuccessView data={submittedData} onStartNew={onStartNew} /></div>
                <ReviewSidebar {...sidebarProps} />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                {/* ── LEFT ── */}
                <div className="lg:col-span-2">
                    <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200 !py-0 !gap-0">

                        {/* Header */}
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-[#004C8F]">New Recognition</h2>
                            <div className="flex items-center gap-2">
                                <StepDot n={1} active={!step1Done} done={step1Done} />
                                <div className="w-6 h-px bg-gray-200" />
                                <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
                                <div className="w-6 h-px bg-gray-200" />
                                <StepDot n={3} active={step2Done && !step3Done} done={step3Done} />
                            </div>
                        </div>

                        <CardContent className="p-4 sm:p-5 space-y-5 sm:space-y-6">

                            {/* 01 — Receiver */}
                            <div>
                                <Label className="flex items-center text-[11px] font-bold text-[#004C8F] tracking-widest mb-3">
                                    <span className="text-[#E31837] mr-1.5 text-xs">01</span>
                                    Who are you Recognizing?
                                    <span className="text-[#E31837] ml-0.5 text-xs">*</span>
                                </Label>
                                <ReceiverPicker
                                    allReceivers={allReceivers}
                                    receiverId={receiverId}
                                    onSelect={handleReceiverChange}
                                    reviewedThisMonth={reviewedThisMonth}
                                />
                                <FieldError message={touched.receiver ? errors.receiver : undefined} />
                            </div>

                            {/* 02 — Categories */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="flex items-center text-[11px] font-bold text-[#004C8F] tracking-widest">
                                        <span className="text-[#E31837] mr-1.5 text-xs">02</span>
                                        Recognition Categories
                                        <span className="text-[#E31837] ml-0.5 text-xs">*</span>
                                    </Label>
                                    <span className="text-[11px] text-gray-400 tabular-nums">
                                        {categoryIds.length}/{Math.min(5, categories.length)} selected
                                    </span>
                                </div>
                                <CategoryPicker
                                    categories={categories}
                                    selectedIds={categoryIds}
                                    onChange={handleCategoryChange}
                                    maxSelectable={Math.min(5, categories.length)}
                                />
                                {categoryIds.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 bg-[#004C8F]/5 border border-[#004C8F]/15 rounded-lg px-4 py-3">
                                        <Zap size={14} className="text-[#004C8F] shrink-0" />
                                        <span className="text-sm text-[#004C8F]">
                                            Preview: <span className="font-black tabular-nums">{previewPts} pts</span>
                                            <span className="text-[#004C8F]/60 font-normal ml-1">
                                                (at ×{(reviewerWeight ?? 1.0).toFixed(1)} weight)
                                            </span>
                                        </span>
                                    </div>
                                )}
                                <FieldError message={touched.categories ? errors.categories : undefined} />
                            </div>

                            {/* 03 — Comment */}
                            <div>
                                <Label
                                    className="flex items-center text-[11px] font-bold text-[#004C8F] tracking-widest mb-3"
                                    htmlFor="comment"
                                >
                                    <span className="text-[#E31837] mr-1.5 text-xs">03</span>
                                    Your Feedback
                                    <span className="text-[#E31837] ml-0.5 text-xs">*</span>
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => handleCommentChange(e.target.value)}
                                        onBlur={handleCommentBlur}
                                        maxLength={COMMENT_MAX}
                                        rows={3}
                                        placeholder="Describe what they did, the impact it had, and why it matters…"
                                        className={cn(
                                            "resize-none text-sm text-[#004C8F] pb-6",
                                            touched.comment && errors.comment
                                                ? "border-[#E31837] focus-visible:ring-[#E31837]/30"
                                                : ""
                                        )}
                                    />
                                    <div className="absolute bottom-2 right-3 flex items-center gap-3">
                                        {comment.length > 0 && comment.length < COMMENT_MIN && (
                                            <span className="text-[10px] text-[#E31837]">
                                                {COMMENT_MIN - comment.length} more chars needed
                                            </span>
                                        )}
                                        <span className={cn(
                                            "text-[10px] tabular-nums",
                                            comment.length > 1900 ? "text-[#E31837]" : "text-gray-400"
                                        )}>
                                            {comment.length}/{COMMENT_MAX}
                                        </span>
                                    </div>
                                </div>
                                <FieldError message={touched.comment ? errors.comment : undefined} />
                                {!errors.comment && (
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Allowed: letters, numbers, spaces and . , ! ? &apos; &quot; - _ ( ) @ # &amp; + = % / :
                                    </p>
                                )}
                            </div>

                            {/* 04 — Attachments */}
                            <div>
                                <Label className="flex items-center text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-3">
                                    <span className="text-[#E31837] mr-1.5 text-xs">04</span>
                                    Attachments
                                    <span className="text-gray-400 font-normal normal-case tracking-normal ml-2">
                                        (optional · max 2 · JPG/PNG ≤10 MB · MP4/MOV ≤50 MB)
                                    </span>
                                </Label>

                                {files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {files.map((f, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs font-medium text-[#004C8F]"
                                            >
                                                {f.type.startsWith("image/") ? <ImageIcon size={14} /> : <Video size={14} />}
                                                <span className="max-w-[150px] truncate">{f.name}</span>
                                                <span className="text-gray-400">
                                                    ({(f.size / 1024 / 1024).toFixed(1)} MB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = files.filter((_, fi) => fi !== i)
                                                        onFilesChange(() => next)
                                                        setErrors(e => ({ ...e, files: validateFiles(next) }))
                                                    }}
                                                    className="text-gray-400 hover:text-[#E31837] transition-colors"
                                                >
                                                    <X size={14} />
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
                                            accept="image/jpeg,image/png,video/mp4,video/quicktime"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className={cn(
                                                "flex items-center justify-center gap-2 text-sm text-gray-500 border border-dashed rounded-lg px-4 py-3 w-full transition-all",
                                                errors.files
                                                    ? "border-[#E31837]/50 bg-red-50 text-[#E31837]"
                                                    : "border-gray-300 hover:border-[#004C8F]/40 hover:bg-gray-50 hover:text-[#004C8F]"
                                            )}
                                        >
                                            <Paperclip size={16} />
                                            <span>Attach image or video</span>
                                        </button>
                                    </>
                                )}
                                <FieldError message={errors.files} />
                            </div>
                        </CardContent>

                        {/* Submit bar */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                            <div className="text-xs text-gray-500 text-center sm:text-left">
                                {!step1Done && !touched.receiver && "Select a teammate to continue"}
                                {touched.receiver && errors.receiver && (
                                    <span className="text-[#E31837] flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.receiver}
                                    </span>
                                )}
                                {step1Done && !step2Done && !touched.categories && "Pick at least one category"}
                                {touched.categories && errors.categories && (
                                    <span className="text-[#E31837] flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.categories}
                                    </span>
                                )}
                                {step1Done && step2Done && !step3Done && !touched.comment && "Write your feedback (min 10 chars)"}
                                {canSubmit && (
                                    <span className="text-green-600 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                                        <CheckCircle2 size={14} /> Ready to submit
                                    </span>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className={cn(
                                    "w-full sm:w-auto",
                                    canSubmit ? "bg-[#E31837] hover:bg-[#c41230] font-bold" : ""
                                )}
                            >
                                {submitting
                                    ? <Loader2 size={16} className="animate-spin mr-2" />
                                    : <Send size={16} className="mr-2" />
                                }
                                {submitting ? "Submitting…" : "Submit"}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* ── RIGHT ── */}
                <ReviewSidebar {...sidebarProps} />
            </div>
        </form>
    )
}