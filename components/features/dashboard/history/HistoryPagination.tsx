"use client";

interface HistoryPaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onPageSelect: (page: number) => void;
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAG_BTN, PAG_NUM_BASE, PAG_NUM_ACTIVE, PAG_NUM_INACTIVE } from "./history-styles";

export default function HistoryPagination({
    page,
    totalPages,
    onPrev,
    onNext,
    onPageSelect,
}: HistoryPaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="mt-8 flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
            </p>

            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={page <= 1}
                    className={cn(PAG_BTN, "w-auto px-4 gap-1.5 text-sm font-medium")}
                >
                    <ChevronLeft size={15} />
                    Previous
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((item, idx) =>
                        typeof item === "string" ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-sm font-semibold text-slate-500">
                                {item}
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageSelect(item)}
                                className={cn(
                                    PAG_NUM_BASE,
                                    "flex items-center justify-center",
                                    item === page ? PAG_NUM_ACTIVE : PAG_NUM_INACTIVE
                                )}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={page >= totalPages}
                    className={cn(PAG_BTN, "w-auto px-4 gap-1.5 text-sm font-medium")}
                >
                    Next
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
