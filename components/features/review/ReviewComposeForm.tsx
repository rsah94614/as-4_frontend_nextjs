"use client"

import { useMemo } from "react"
import {
    Loader2, Send, Check, X, Image as ImageIcon, Video,
    BarChart3, CheckCircle2, Zap, BookOpen, Paperclip,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import CategoryPicker from "./CategoryPicker"
import ReceiverPicker from "./ReceiverPicker"
import type { ReviewCategory, ViewMode, SubmittedReviewData } from "@/types/review-types"
import type { TeamMember } from "@/services/employee-service"
import { fmtDate } from "@/lib/review-utils"
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
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
            done ? "bg-[#E31837] border-[#E31837] text-white"
                : active ? "bg-white border-[#004C8F] text-[#004C8F]"
                : "bg-white border-gray-300 text-gray-300"
        )}>
            {done ? <Check size={12} strokeWidth={3} /> : n}
        </div>
    )
}

function SuccessView({ data, onStartNew }: { data: SubmittedReviewData; onStartNew?: () => void }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-1 bg-[#E31837]" />
            <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[#004C8F] mb-1">Recognition Submitted!</h3>
                <p className="text-sm text-gray-500 mb-6">Your feedback has been recorded and points credited.</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Recognised</span>
                        <span className="font-semibold text-[#004C8F]">{data.receiverName}</span>
                    </div>
                    {data.categoryNames?.length > 0 && (
                        <div className="flex justify-between text-sm items-start gap-4">
                            <span className="text-gray-500 shrink-0">Categories</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {data.categoryNames.map((c: string) => (
                                    <span key={c} className="text-[10px] font-bold bg-[#004C8F]/8 text-[#004C8F] px-2 py-0.5 rounded">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.submittedAt && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Submitted</span>
                            <span className="text-gray-600 text-xs">{fmtDate(data.submittedAt)}</span>
                        </div>
                    )}
                </div>
                <button type="button" onClick={onStartNew}
                    className="w-full py-3 rounded-lg bg-[#004C8F] text-white text-sm font-semibold hover:bg-[#003a6e] transition-colors">
                    Write Another Recognition
                </button>
            </div>
        </div>
    )
}

const HOW_IT_WORKS = [
    { n: "01", title: "Select a Teammate", desc: "Choose who you'd like to recognise. Each person can be reviewed once per month." },
    { n: "02", title: "Pick Categories", desc: "Select 1–5 categories. Each carries a multiplier. Points = sum of multipliers × your reviewer weight." },
    { n: "03", title: "Write Feedback", desc: "Describe what they did, the impact it had, and why it matters. Min 10, max 2000 characters." },
    { n: "04", title: "Attach Evidence", desc: "Optionally add an image or video to support your feedback. Max 2 files." },
    { n: "05", title: "Submit", desc: "Points are auto-credited to the receiver's wallet on submission." },
]

function Sidebar({ givenThisMonth, uniquePeopleCount, totalReviews, loadingStats }: {
    givenThisMonth: number; uniquePeopleCount: number; totalReviews: number; loadingStats?: boolean
}) {
    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center gap-2">
                    <BarChart3 size={13} className="text-[#E31837]" />
                    <h3 className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">Your Activity</h3>
                </div>
                {loadingStats ? (
                    <div className="p-5 space-y-4">
                        {[0,1,2].map(i => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-32" /><Skeleton className="h-6 w-10" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {[
                            { label: "Given This Month", value: givenThisMonth, sub: "Reviews submitted" },
                            { label: "Unique People", value: uniquePeopleCount, sub: "Teammates recognised" },
                            { label: "Total Reviews", value: totalReviews, sub: "Given & received" },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="text-xs font-semibold text-[#004C8F]">{row.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{row.sub}</p>
                                </div>
                                <span className="text-2xl font-bold text-[#004C8F] tabular-nums">{row.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center gap-2">
                    <BookOpen size={13} className="text-[#E31837]" />
                    <h3 className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">How It Works</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {HOW_IT_WORKS.map(s => (
                        <div key={s.n} className="flex gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                            <span className="text-[11px] font-black text-[#E31837] w-6 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                            <div>
                                <p className="text-xs font-semibold text-[#004C8F] mb-0.5">{s.title}</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                    <div className="px-5 py-4 bg-gray-50">
                        <div className="flex items-start gap-2">
                            <Zap size={12} className="text-[#E31837] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-[#004C8F] mb-1.5">Points Formula</p>
                                <code className="text-[10px] bg-white border border-gray-200 text-[#004C8F] px-2.5 py-1.5 rounded block font-mono">
                                    raw_pts = Σ(multipliers) × weight
                                </code>
                                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                                    SUPER_ADMIN ×1.5 · HR ×1.2<br/>MANAGER ×1.3 · EMPLOYEE ×1.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><SuccessView data={submittedData} onStartNew={onStartNew} /></div>
                <Sidebar {...sidebarProps} />
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-[#004C8F]">New Recognition</h2>
                            <div className="flex items-center gap-2">
                                <StepDot n={1} active={!step1Done} done={step1Done} />
                                <div className="w-6 h-px bg-gray-200" />
                                <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
                                <div className="w-6 h-px bg-gray-200" />
                                <StepDot n={3} active={step2Done && !step3Done} done={step3Done} />
                            </div>
                        </div>

                        <div className="p-6 space-y-7">
                            {/* 01 */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-2.5">
                                    <span className="text-[#E31837] mr-1.5">01</span>Who are you recognising?
                                </label>
                                <ReceiverPicker allReceivers={allReceivers} receiverId={receiverId}
                                    onSelect={onReceiverChange} reviewedThisMonth={reviewedThisMonth} />
                            </div>

                            {/* 02 */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">
                                        <span className="text-[#E31837] mr-1.5">02</span>Recognition categories
                                    </label>
                                    <span className="text-[11px] text-gray-400 tabular-nums">{categoryIds.length}/{Math.min(5, categories.length)} selected</span>
                                </div>
                                <CategoryPicker categories={categories} selectedIds={categoryIds}
                                    onChange={onCategoryIdsChange} maxSelectable={Math.min(5, categories.length)} />
                                {categoryIds.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded-lg px-4 py-2.5">
                                        <Zap size={12} className="text-amber-500 shrink-0" />
                                        <span className="text-xs text-amber-700">
                                            Preview: <span className="font-black tabular-nums">{previewPts} pts</span>
                                            <span className="text-amber-400 font-normal ml-1">(at ×{(reviewerWeight ?? 1.0).toFixed(1)} weight)</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 03 */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-2.5">
                                    <span className="text-[#E31837] mr-1.5">03</span>Your feedback
                                </label>
                                <textarea value={comment} onChange={(e) => onCommentChange(e.target.value)}
                                    maxLength={2000} rows={5}
                                    placeholder="Describe what they did, the impact it had, and why it matters…"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#004C8F]
                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10
                                        focus:border-[#004C8F]/40 resize-none transition-all leading-relaxed" />
                                <div className="flex justify-between mt-1.5 px-0.5">
                                    <span className="text-[11px]">
                                        {comment.length > 0 && comment.length < 10 && (
                                            <span className="text-[#E31837]">Minimum 10 characters</span>
                                        )}
                                    </span>
                                    <span className={cn("text-[11px] tabular-nums", comment.length > 1900 ? "text-[#E31837]" : "text-gray-400")}>
                                        {comment.length}/2000
                                    </span>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#004C8F] uppercase tracking-widest mb-2.5">
                                    Attachments <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional · max 2)</span>
                                </label>
                                {files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs font-medium text-[#004C8F]">
                                                {f.type.startsWith("image/") ? <ImageIcon size={12} /> : <Video size={12} />}
                                                <span className="max-w-[120px] truncate">{f.name}</span>
                                                <button type="button" onClick={() => onFilesChange(p => p.filter((_, fi) => fi !== i))}
                                                    className="text-gray-400 hover:text-[#E31837] transition-colors"><X size={12} /></button>
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
                                            className="flex items-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg
                                                px-4 py-3 w-full hover:border-[#004C8F]/40 hover:bg-gray-50 hover:text-[#004C8F] transition-all">
                                            <Paperclip size={14} /><span>Attach image or video</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit bar */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div className="text-xs text-gray-500">
                                {!step1Done && "Select a teammate to continue"}
                                {step1Done && !step2Done && "Pick at least one category"}
                                {step1Done && step2Done && !step3Done && "Write your feedback (min 10 chars)"}
                                {canSubmit && (
                                    <span className="text-green-600 font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 size={13} /> Ready to submit
                                    </span>
                                )}
                            </div>
                            <button type="submit" disabled={!canSubmit}
                                className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                                    canSubmit ? "bg-[#E31837] text-white hover:bg-[#c41230] shadow-sm"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                                {submitting ? "Submitting…" : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <Sidebar {...sidebarProps} />
            </div>
        </form>
    )
}