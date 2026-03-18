"use client";

interface HistoryPaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAG_BTN, PAG_NUM_BASE, PAG_NUM_ACTIVE, PAG_NUM_INACTIVE } from "./history-styles";

export default function HistoryPagination({
    page,
    totalPages,
    onPrev,
    onNext,
}: HistoryPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={onPrev}
                disabled={page <= 1}
                className={PAG_BTN}
            >
                <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1">
                <span className={cn(PAG_NUM_BASE, PAG_NUM_ACTIVE, "flex items-center justify-center")}>
                    {page}
                </span>
                <span className="text-xs text-gray-400 font-medium px-1">of</span>
                <span className={cn(PAG_NUM_BASE, PAG_NUM_INACTIVE, "flex items-center justify-center")}>
                    {totalPages}
                </span>
            </div>

            <button
                onClick={onNext}
                disabled={page >= totalPages}
                className={PAG_BTN}
            >
                <ChevronRight size={15} />
            </button>
        </div>
    );
}
