"use client";

import React from "react";
import { Zap } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";

interface ReviewRowProps {
    review: Review;
    employees: Employee[];
}

export function ReviewRow({ review, employees }: ReviewRowProps) {
    const reviewer = employees.find((e) => e.employee_id === review.reviewer_id);
    const points   = review.raw_points ?? 0;
    const initials = (name: string) => name.charAt(0).toUpperCase();

    return (
        <div className="flex items-start gap-3 rounded-xl p-3.5 bg-white border border-gray-100 hover:border-gray-200 transition-all">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
                style={{ background: "#1E3A5F" }}>
                {initials(reviewer?.username ?? "?")}
            </div>

            <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-800">
                        {reviewer?.username ?? "Unknown"}
                    </span>

                    {/* Points */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {points.toFixed(2)} pts
                    </span>

                    {/* Category badges */}
                    {review.category_codes?.map((code) => (
                        <span key={code}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            {code}
                        </span>
                    ))}

                    {/* Date */}
                    <span className="text-[10px] text-gray-400 ml-auto font-medium">
                        {new Date(review.review_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                </div>

                {/* Comment */}
                {review.comment && (
                    <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                )}
            </div>
        </div>
    );
}