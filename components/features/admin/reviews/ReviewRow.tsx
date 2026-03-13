"use client";

import React from "react";
import { Zap } from "lucide-react";
import { Review, Employee } from "@/types/admin-review-types";
import { Badge } from "@/components/ui/badge";

interface ReviewRowProps {
    review: Review;
    employees: Employee[];
}

export function ReviewRow({ review, employees }: ReviewRowProps) {
    const reviewer = employees.find((e) => e.employee_id === review.reviewer_id);
    const points = review.raw_points ?? 0;

    return (
        <div className="flex items-start gap-3 rounded-xl p-3 border transition-all duration-200 bg-white border-slate-100/80 hover:border-slate-200">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm bg-slate-100 text-slate-600">
                {(reviewer?.username ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-black tracking-tight">
                        {reviewer?.username ?? "Unknown"}
                    </span>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shadow-none"
                    >
                        <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {points.toFixed(0)} pts
                    </Badge>
                    {review.category_codes?.map((code) => (
                        <Badge
                            key={code}
                            variant="outline"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200 shadow-none"
                        >
                            {code}
                        </Badge>
                    ))}
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