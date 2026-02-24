"use client";

interface HistoryPaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

export default function HistoryPagination({
    page,
    totalPages,
    onPrev,
    onNext,
}: HistoryPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-3 mt-6">
            <button
                onClick={onPrev}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-full border text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Previous
            </button>

            <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
            </span>

            <button
                onClick={onNext}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-full border text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
}
