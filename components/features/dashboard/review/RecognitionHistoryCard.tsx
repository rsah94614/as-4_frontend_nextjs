"use client"

import { useState, useRef, useEffect } from "react"
import { Tag, Clock, Image as ImageIcon, Video, Zap, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import type { Review, ReviewCategory } from "@/types/review-types"
import { fmtDate } from "@/lib/review-utils"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReviewCardProps {
    review: Review
    myId: string
    categories: ReviewCategory[]
}

export default function ReviewCard({ review, myId, categories }: ReviewCardProps) {
    const isMine = review.reviewer_id === myId
    const [expanded, setExpanded] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const commentRef = useRef<HTMLParagraphElement>(null)

    const catCodes: string[] =
        review.category_codes ??
        (review.category_ids ?? [])
            .map((id) => categories.find((c) => c.category_id === id)?.category_code)
            .filter(Boolean) as string[]

    const rawPts = review.raw_points != null ? review.raw_points : null

    // Detect if the comment text overflows 3 lines
    useEffect(() => {
        const el = commentRef.current
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight)
        }
    }, [review.comment])

    return (
        <Card className="rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 group border-gray-200">


            <CardContent className="p-4 sm:p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Direction badge */}
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border-0 pointer-events-none",
                                isMine
                                    ? "bg-[#004C8F]/10 text-[#004C8F] hover:bg-[#004C8F]/10"
                                    : "bg-green-600/10 text-green-600 hover:bg-green-600/10"
                            )}
                        >
                            {isMine
                                ? <ArrowUpRight size={12} strokeWidth={2.5} />
                                : <ArrowDownLeft size={12} strokeWidth={2.5} />
                            }
                            {isMine ? "Given" : "Received"}
                        </Badge>
                    </div>

                    {rawPts !== null && (
                        <div className="flex items-center gap-1 bg-[#004C8F]/5 border border-[#004C8F]/15 rounded-md px-2 py-1">
                            <Zap size={10} className="text-[#004C8F]" />
                            <span className="text-[11px] font-black text-[#004C8F] tabular-nums">
                                {rawPts % 1 === 0 ? rawPts : rawPts.toFixed(2)} pts
                            </span>
                        </div>
                    )}
                </div>

                {/* Category tags */}
                {catCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {catCodes.map((code) => (
                            <Badge
                                key={code}
                                variant="secondary"
                                className="gap-1 text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md hover:bg-gray-100 border-0 pointer-events-none"
                            >
                                <Tag size={10} />
                                {code}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Comment with See more / See less */}
                <div>
                    <p
                        ref={commentRef}
                        className={cn(
                            "text-sm text-gray-600 leading-relaxed transition-all duration-300",
                            expanded
                                ? "max-h-[200px] overflow-y-auto pr-1"
                                : "line-clamp-3"
                        )}
                    >
                        {review.comment}
                    </p>
                    {isClamped && (
                        <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="mt-1 text-xs font-semibold text-[#004C8F] hover:text-[#E31837] transition-colors cursor-pointer"
                        >
                            {expanded ? "See less" : "See more"}
                        </button>
                    )}
                </div>

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
            </CardContent>
        </Card>
    )
}