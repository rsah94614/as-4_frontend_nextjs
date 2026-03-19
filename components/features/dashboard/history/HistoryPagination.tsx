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
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={onPrev}
                disabled={page <= 1}
                className={cn(PAG_BTN, "w-auto px-3.5 gap-1.5 text-sm font-semibold")}
            >
                <ChevronLeft size={15} />
                Previous
            </button>

            <div className="flex items-center gap-1">
                {pages.map((item, idx) =>
                    typeof item === "string" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-600 font-bold text-sm">
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
                onClick={onNext}
                disabled={page >= totalPages}
                className={cn(PAG_BTN, "w-auto px-3.5 gap-1.5 text-sm font-semibold")}
            >
                Next
                <ChevronRight size={15} />
            </button>
        </div>
    );
}
