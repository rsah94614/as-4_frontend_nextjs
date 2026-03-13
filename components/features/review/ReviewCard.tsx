"use client"

import { Tag, Clock, Image as ImageIcon, Video, Zap, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import type { Review, ReviewCategory } from "@/types/review-types"
import { fmtDate } from "@/lib/review-utils"
import { cn } from "@/lib/utils"

interface ReviewCardProps {
    review: Review
    myId: string
    categories: ReviewCategory[]
}

export default function ReviewCard({ review, myId, categories }: ReviewCardProps) {
    const isMine = review.reviewer_id === myId

    const catCodes: string[] =
        review.category_codes ??
        (review.category_ids ?? [])
            .map((id) => categories.find((c) => c.category_id === id)?.category_code)
            .filter(Boolean) as string[]

    const rawPts = review.raw_points != null ? review.raw_points : null

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
            {/* Top accent stripe */}
            <div className={cn(
                "h-0.5 w-full",
                isMine ? "bg-[#004C8F]" : "bg-[#E31837]"
            )} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Direction badge */}
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded",
                            isMine
                                ? "bg-[#004C8F]/8 text-[#004C8F]"
                                : "bg-[#E31837]/8 text-[#E31837]"
                        )}>
                            {isMine
                                ? <ArrowUpRight size={10} />
                                : <ArrowDownLeft size={10} />
                            }
                            {isMine ? "Given" : "Received"}
                        </span>
                    </div>

                    {rawPts !== null && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 rounded px-2 py-1">
                            <Zap size={10} className="text-amber-500" />
                            <span className="text-[11px] font-black text-amber-600 tabular-nums">
                                {rawPts % 1 === 0 ? rawPts : rawPts.toFixed(2)} pts
                            </span>
                        </div>
                    )}
                </div>

                {/* Category tags */}
                {catCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {catCodes.map((code) => (
                            <span
                                key={code}
                                className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
                            >
                                <Tag size={8} />
                                {code}
                            </span>
                        ))}
                    </div>
                )}

                {/* Comment */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

                {/* Media links */}
                {(review.image_url || review.video_url) && (
                    <div className="flex gap-3 mt-3">
                        {review.image_url && (
                            <a
                                href={review.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#004C8F] hover:text-[#E31837] flex items-center gap-1 font-semibold transition-colors"
                            >
                                <ImageIcon size={10} /> Image
                            </a>
                        )}
                        {review.video_url && (
                            <a
                                href={review.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#004C8F] hover:text-[#E31837] flex items-center gap-1 font-semibold transition-colors"
                            >
                                <Video size={10} /> Video
                            </a>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={9} />
                        {fmtDate(review.review_at)}
                    </span>
                </div>
            </div>
        </div>
    )
}