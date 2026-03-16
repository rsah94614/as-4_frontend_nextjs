"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Designation } from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";
import { Button } from "@/components/ui/button";

interface DesignationTableProps {
    designations: Designation[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (desig: Designation) => void;
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
                <div className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                </div>
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
                                        className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold text-white"
                                        style={{ backgroundColor: desig.is_active ? "#14a882" : "#6b7280" }}
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
                                                className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold text-white"
                                                style={{ backgroundColor: desig.is_active ? "#14a882" : "#6b7280" }}
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
                <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                >
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                        Showing {(pagination.current_page - 1) * pagination.per_page + 1}-
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="h-8 w-8 p-0 rounded border-slate-300"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <span
                            className="text-xs font-semibold px-3 py-1 rounded"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                        >
                            {pagination.current_page} of {pagination.total_pages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="h-8 w-8 p-0 rounded border-slate-300"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="hidden xl:inline-flex h-8 px-4 rounded border-slate-300 text-slate-700"
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="hidden xl:inline-flex h-8 px-4 rounded font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: "#1a4ab5", border: "none" }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
