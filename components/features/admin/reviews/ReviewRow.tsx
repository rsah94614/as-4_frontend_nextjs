"use client";

import React from "react";
import { Flag } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { Stars } from "./UIHelpers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FLAG_RATING = 2;

interface ReviewRowProps {
    review: Review;
    employees: Employee[];
}

export function ReviewRow({ review, employees }: ReviewRowProps) {
    const flagged = review.rating <= FLAG_RATING;
    const reviewer = employees.find((e) => e.employee_id === review.reviewer_id);

    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-xl p-3 border transition-all duration-200",
                flagged
                    ? "bg-red-50/60 border-red-100 shadow-sm"
                    : "bg-white border-slate-100/80 hover:border-slate-200"
            )}
        >
            <div
                className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm",
                    flagged ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                )}
            >
                {(reviewer?.username ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-black tracking-tight">
                        {reviewer?.username ?? "Unknown"}
                    </span>
                    <Stars value={review.rating} />
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-none",
                            flagged
                                ? "bg-red-100 text-red-600 border-red-200"
                                : review.rating >= 4
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                        )}
                    >
                        {review.rating}/5
                    </Badge>
                    {flagged && (
                        <Badge variant="destructive" className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 shadow-sm hover:bg-red-100">
                            <Flag className="w-2.5 h-2.5" /> Flagged
                        </Badge>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto font-medium">
                        {new Date(review.review_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                        })}
                    </span>
                </div>
                {review.comment && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                        {review.comment}
                    </p>
                )}
            </div>
        </div>
    );
}
