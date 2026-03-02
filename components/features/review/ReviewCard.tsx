"use client"

import { Star, Tag, Clock, Image as ImageIcon, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Review, ReviewCategory } from "@/types/review-types"
import { RATING_LABELS, RATING_COLORS, fmtDate } from "@/lib/review-utils"

// ─── Review Card ──────────────────────────────────────────────────────────────

interface ReviewCardProps {
    review: Review
    myId: string
    categories: ReviewCategory[]
}

export default function ReviewCard({ review, myId, categories }: ReviewCardProps) {
    const isMine = review.reviewer_id === myId

    const catNames = (review.category_ids ?? (review.category_id ? [review.category_id] : []))
        .map((id) => categories.find((c) => c.category_id === id)?.category_name)
        .filter(Boolean) as string[]

    const catCodesFromResponse =
        review.category_codes ?? (review.category_code ? [review.category_code] : [])

    const displayCats = catNames.length > 0 ? catNames : catCodesFromResponse

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-none hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden bg-gray-50 py-0">
            <CardContent className="px-5 py-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            variant="secondary"
                            className={`text-[10px] font-bold uppercase tracking-wider rounded-full
                ${isMine ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}
                        >
                            {isMine ? "Given" : "Received"}
                        </Badge>

                        {displayCats.length > 0 &&
                            displayCats.map((name, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] font-medium bg-white text-gray-500 border-gray-100 rounded-full"
                                >
                                    <Tag size={9} />
                                    {name}
                                </Badge>
                            ))}
                    </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={14}
                                className={
                                    s <= review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-gray-200 text-gray-200"
                                }
                            />
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
                            <a
                                href={review.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                            >
                                <ImageIcon size={10} /> Image
                            </a>
                        )}
                        {review.video_url && (
                            <a
                                href={review.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                            >
                                <Video size={10} /> Video
                            </a>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-3 pt-2.5 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {fmtDate(review.review_at)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
