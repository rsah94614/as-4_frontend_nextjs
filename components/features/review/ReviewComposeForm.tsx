"use client"

import { useMemo } from "react"
import {
    Loader2, Send, Check, X, Image as ImageIcon, Video,
    CheckCircle2, Zap, Paperclip,
} from "lucide-react"
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

function calcPreviewPoints(categories: ReviewCategory[], selectedIds: string[], weight = 1.0): number {
    const total = selectedIds.reduce((sum, id) => {
        const cat = categories.find((c) => c.category_id === id)
        return sum + (cat ? cat.multiplier : 0)
    }, 0)
    return Math.round(total * weight * 10) / 10
}

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
}

export default function ReviewComposeForm({
    view, allReceivers, receiverId, onReceiverChange, reviewedThisMonth,
    categories, categoryIds, onCategoryIdsChange, comment, onCommentChange,
    files, onFilesChange, fileRef, submitting, onSubmit,
    givenThisMonth, uniquePeopleCount, totalReviews, loadingStats,
    submittedData, onStartNew, reviewerWeight,
}: ReviewComposeFormProps) {
    const previewPts = useMemo(() => calcPreviewPoints(categories, categoryIds, reviewerWeight ?? 1.0), [categories, categoryIds, reviewerWeight])
    const step1Done = !!receiverId
    const step2Done = categoryIds.length > 0
    const step3Done = comment.trim().length >= 10
    const canSubmit = step1Done && step2Done && step3Done && !submitting
    const sidebarProps = { givenThisMonth, uniquePeopleCount, totalReviews, loadingStats }

    if (view === "submitted" && submittedData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2"><ReviewSuccessView data={submittedData} onStartNew={onStartNew} /></div>
                <ReviewSidebar {...sidebarProps} />
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} noValidate>
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
                            {/* 01 */}
                            <div>
                                <Label className="flex items-center text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-3">
                                    <span className="text-[#E31837] mr-1.5 text-xs">01</span>Who are you recognising?
                                </Label>
                                <ReceiverPicker allReceivers={allReceivers} receiverId={receiverId}
                                    onSelect={onReceiverChange} reviewedThisMonth={reviewedThisMonth} />
                            </div>

                            {/* 02 */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="flex items-center text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                        <span className="text-[#E31837] mr-1.5 text-xs">02</span>Recognition categories
                                    </Label>
                                    <span className="text-[11px] text-gray-400 tabular-nums">{categoryIds.length}/{Math.min(5, categories.length)} selected</span>
                                </div>
                                <CategoryPicker categories={categories} selectedIds={categoryIds}
                                    onChange={onCategoryIdsChange} maxSelectable={Math.min(5, categories.length)} />
                                {categoryIds.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 bg-[#004C8F]/5 border border-[#004C8F]/15 rounded-lg px-4 py-3">
                                        <Zap size={14} className="text-[#004C8F] shrink-0" />
                                        <span className="text-sm text-[#004C8F]">
                                            Preview: <span className="font-black tabular-nums">{previewPts} pts</span>
                                            <span className="text-[#004C8F]/60 font-normal ml-1">(at ×{(reviewerWeight ?? 1.0).toFixed(1)} weight)</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 03 */}
                            <div>
                                <Label className="flex items-center text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-3" htmlFor="comment">
                                    <span className="text-[#E31837] mr-1.5 text-xs">03</span>Your feedback
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => onCommentChange(e.target.value)}
                                        maxLength={2000}
                                        rows={3}
                                        placeholder="Describe what they did, the impact it had, and why it matters…"
                                        className="resize-none text-sm text-[#004C8F] pb-6"
                                    />
                                    <div className="absolute bottom-2 right-3 flex items-center gap-3">
                                        {comment.length > 0 && comment.length < 10 && (
                                            <span className="text-[10px] text-[#E31837]">Minimum 10 characters</span>
                                        )}
                                        <span className={cn("text-[10px] tabular-nums", comment.length > 1900 ? "text-[#E31837]" : "text-gray-400")}>
                                            {comment.length}/2000
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <Label className="flex items-center text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-3">
                                    Attachments <span className="text-gray-400 font-normal normal-case tracking-normal ml-2">(optional · max 2)</span>
                                </Label>
                                {files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs font-medium text-[#004C8F]">
                                                {f.type.startsWith("image/") ? <ImageIcon size={14} /> : <Video size={14} />}
                                                <span className="max-w-[150px] truncate">{f.name}</span>
                                                <button type="button" onClick={() => onFilesChange(p => p.filter((_, fi) => fi !== i))}
                                                    className="text-gray-400 hover:text-[#E31837] transition-colors"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {files.length < 2 && (
                                    <>
                                        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
                                            onChange={(e) => {
                                                const picked = Array.from(e.target.files ?? []).slice(0, 2 - files.length)
                                                onFilesChange(p => [...p, ...picked].slice(0, 2))
                                                if (fileRef.current) fileRef.current.value = ""
                                            }} />
                                        <button type="button" onClick={() => fileRef.current?.click()}
                                            className="flex items-center justify-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg
                                                px-4 py-3 w-full hover:border-[#004C8F]/40 hover:bg-gray-50 hover:text-[#004C8F] transition-all">
                                            <Paperclip size={16} /><span>Attach image or video</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </CardContent>

                        {/* Submit bar */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                            <div className="text-xs text-gray-500 text-center sm:text-left">
                                {!step1Done && "Select a teammate to continue"}
                                {step1Done && !step2Done && "Pick at least one category"}
                                {step1Done && step2Done && !step3Done && "Write your feedback (min 10 chars)"}
                                {canSubmit && (
                                    <span className="text-green-600 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                                        <CheckCircle2 size={14} /> Ready to submit
                                    </span>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className={cn("w-full sm:w-auto", canSubmit ? "bg-[#E31837] hover:bg-[#c41230] font-bold" : "")}
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
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