"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    className?: string;
}

function getPaginationItems(current: number, total: number): (number | "...")[] {
    if (total <= 5) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: (number | "...")[] = [1];

    if (current > 3) items.push("...");

    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
        items.push(page);
    }

    if (current < total - 2) items.push("...");

    items.push(total);
    return items;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    hasPrevious = currentPage > 1,
    hasNext = currentPage < totalPages,
    className,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
            <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevious}
                onClick={() => onPageChange(currentPage - 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </Button>

            {getPaginationItems(currentPage, totalPages).map((item, index) =>
                item === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-foreground font-bold text-sm">
                        ...
                    </span>
                ) : (
                    <Button
                        key={item}
                        variant={item === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(item)}
                        className={cn(
                            "rounded-lg min-w-[36px] px-2 py-1.5 text-sm transition-all",
                            item === currentPage
                                ? "bg-[#004C8F] text-white shadow-sm hover:bg-[#003d73]"
                                : "text-slate-800 font-bold hover:bg-slate-100 border-slate-200"
                        )}
                    >
                        {item}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={() => onPageChange(currentPage + 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
