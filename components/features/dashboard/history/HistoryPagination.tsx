"use client";

interface HistoryPaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onPageSelect: (page: number) => void;
}

import PaginationControls from "@/components/shared/PaginationControls";

export default function HistoryPagination({
    page,
    totalPages,
    onPageSelect,
}: HistoryPaginationProps) {
    return (
        <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            hasPrevious={page > 1}
            hasNext={page < totalPages}
            onPageChange={onPageSelect}
        />
    );
}
