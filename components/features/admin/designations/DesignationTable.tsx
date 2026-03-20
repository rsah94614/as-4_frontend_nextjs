"use client";

import { Designation } from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "@/components/shared/PaginationControls";

interface DesignationTableProps {
    designations: Designation[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (desig: Designation) => void;
}

function DesignationTableSkeleton() {
    return (
        <>
            <div className="space-y-3 xl:hidden overflow-x-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <Skeleton className="h-5 flex-1 max-w-48" />
                            <Skeleton className="h-6 w-16 rounded" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="h-6 w-24 rounded" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="w-7 h-7 rounded-full" />
                            </div>
                        </div>

                        <Skeleton className="h-8 w-full rounded" />
                    </div>
                ))}
            </div>

            <div className="hidden xl:block overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                            {["Name", "Code", "Level", "Status", "Action"].map(col => (
                                <th
                                    key={col}
                                    className="text-left py-3 px-4 font-semibold text-sm"
                                    style={{ color: "#374151" }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr
                                key={index}
                                style={{ borderBottom: index < 4 ? "1px solid #f3f4f6" : "none" }}
                            >
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-4 w-40" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-6 w-24 rounded" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="w-7 h-7 rounded-full" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-6 w-16 rounded" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-8 w-16 rounded" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export function DesignationTable({
    designations,
    loading,
    pagination,
    onPageChange,
    onEdit,
}: DesignationTableProps) {
    return (
        <div className="space-y-4">
            {loading ? (
                <DesignationTableSkeleton />
            ) : designations.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                    No designations found.
                </div>
            ) : (
                <>
                    <div className="space-y-3 xl:hidden overflow-x-hidden">
                        {designations.map(desig => (
                            <div
                                key={desig.designation_id}
                                className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden"
                                style={{ backgroundColor: "#ffffff" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="min-w-0 flex-1 break-words font-semibold text-sm leading-5" style={{ color: "#111827" }}>
                                        {desig.designation_name}
                                    </p>
                                    <span
                                        className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                                        style={
                                            desig.is_active
                                                ? {
                                                    backgroundColor: "#ffffff",
                                                    color: "#14a882",
                                                    border: "1px solid #14a882",
                                                }
                                                : {
                                                    backgroundColor: "#6b7280",
                                                    color: "#ffffff",
                                                }
                                        }
                                    >
                                        {desig.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="mb-1" style={{ color: "#6b7280" }}>
                                            Code
                                        </p>
                                        <span
                                            className="inline-flex max-w-full break-all font-mono text-xs px-2 py-1 rounded"
                                            style={{
                                                backgroundColor: "#f1f5f9",
                                                color: "#475569",
                                                border: "1px solid #e2e8f0",
                                            }}
                                        >
                                            {desig.designation_code}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-1" style={{ color: "#6b7280" }}>
                                            Level
                                        </p>
                                        <span
                                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: "#1a4ab5" }}
                                        >
                                            {desig.level}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={() => onEdit(desig)}
                                    className="h-8 w-full text-xs font-semibold text-white rounded hover:opacity-90"
                                    style={{ backgroundColor: "#1a4ab5", border: "none" }}
                                >
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                    {["Name", "Code", "Level", "Status", "Action"].map(col => (
                                        <th
                                            key={col}
                                            className="text-left py-3 px-4 font-semibold text-sm"
                                            style={{ color: "#374151" }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {designations.map((desig, idx) => (
                                    <tr
                                        key={desig.designation_id}
                                        className="transition-colors"
                                        style={{ borderBottom: idx < designations.length - 1 ? "1px solid #f3f4f6" : "none" }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                    >
                                        <td className="py-3.5 px-4 font-semibold" style={{ color: "#111827" }}>
                                            {desig.designation_name}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className="font-mono text-xs px-2.5 py-1 rounded"
                                                style={{
                                                    backgroundColor: "#f1f5f9",
                                                    color: "#475569",
                                                    border: "1px solid #e2e8f0",
                                                }}
                                            >
                                                {desig.designation_code}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                                                style={{ backgroundColor: "#1a4ab5" }}
                                            >
                                                {desig.level}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold"
                                                style={
                                                    desig.is_active
                                                        ? {
                                                            backgroundColor: "#ffffff",
                                                            color: "#14a882",
                                                            border: "1px solid #14a882",
                                                        }
                                                        : {
                                                            backgroundColor: "#6b7280",
                                                            color: "#ffffff",
                                                        }
                                                }
                                            >
                                                {desig.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <Button
                                                size="sm"
                                                onClick={() => onEdit(desig)}
                                                className="h-8 px-4 text-xs font-semibold text-white rounded hover:opacity-90"
                                                style={{ backgroundColor: "#1a4ab5", border: "none" }}
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {pagination && (
                <div className="border-t border-[#e5e7eb] pt-4">
                    <PaginationControls
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        hasPrevious={pagination.has_previous}
                        hasNext={pagination.has_next}
                        onPageChange={onPageChange}
                        className="mt-0"
                    />
                </div>
            )}
        </div>
    );
}
