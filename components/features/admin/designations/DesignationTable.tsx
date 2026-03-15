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
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                                </td>
                            </tr>
                        ) : designations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                                    No designations found.
                                </td>
                            </tr>
                        ) : (
                            designations.map((desig, idx) => (
                                <tr
                                    key={desig.designation_id}
                                    className="transition-colors"
                                    style={{ borderBottom: idx < designations.length - 1 ? "1px solid #f3f4f6" : "none" }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    {/* Name */}
                                    <td className="py-3.5 px-4 font-semibold" style={{ color: "#111827" }}>
                                        {desig.designation_name}
                                    </td>

                                    {/* Code */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className="font-mono text-xs px-2.5 py-1 rounded"
                                            style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}
                                        >
                                            {desig.designation_code}
                                        </span>
                                    </td>

                                    {/* Level */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: "#1a4ab5" }}
                                        >
                                            {desig.level}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold text-white"
                                            style={{ backgroundColor: desig.is_active ? "#14a882" : "#6b7280" }}
                                        >
                                            {desig.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* Action */}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination — always visible */}
            {pagination && (
                <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                >
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                        Showing {(pagination.current_page - 1) * pagination.per_page + 1}–
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                    </span>

                    <div className="flex items-center gap-2">
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
                            className="h-8 px-4 rounded border-slate-300 text-slate-700"
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="h-8 px-4 rounded font-semibold text-white hover:opacity-90"
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