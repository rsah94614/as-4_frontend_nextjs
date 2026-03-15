"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Department } from "@/types/department-types";
import { PaginationMeta } from "@/types/pagination";

interface DepartmentTableProps {
    departments: Department[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (dept: Department) => void;
}

export function DepartmentTable({
    departments,
    loading,
    pagination,
    onPageChange,
    onEdit,
}: DepartmentTableProps) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                            {["Name", "Code", "Type", "Manager", "Status", "Action"].map(col => (
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
                                <td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                                </td>
                            </tr>
                        ) : departments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                                    No departments found.
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept, idx) => (
                                <tr
                                    key={dept.department_id}
                                    className="transition-colors"
                                    style={{
                                        borderBottom: idx < departments.length - 1 ? "1px solid #f3f4f6" : "none",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    {/* Name */}
                                    <td className="py-3.5 px-4 font-semibold" style={{ color: "#111827" }}>
                                        {dept.department_name}
                                    </td>

                                    {/* Code */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className="font-mono text-xs px-2.5 py-1 rounded"
                                            style={{
                                                backgroundColor: "#f1f5f9",
                                                color: "#475569",
                                                border: "1px solid #e2e8f0",
                                            }}
                                        >
                                            {dept.department_code}
                                        </span>
                                    </td>

                                    {/* Type */}
                                    <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                        {dept.department_type ? dept.department_type.type_name : <span style={{ color: "#9ca3af" }}>—</span>}
                                    </td>

                                    {/* Manager */}
                                    <td className="py-3.5 px-4">
                                        {dept.manager ? (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                    style={{ backgroundColor: "#1a4ab5" }}
                                                >
                                                    {dept.manager.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm" style={{ color: "#374151" }}>
                                                    {dept.manager.username}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ color: "#9ca3af" }}>—</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold text-white"
                                            style={{ backgroundColor: dept.is_active ? "#14a882" : "#6b7280" }}
                                        >
                                            {dept.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(dept)}
                                                className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
                                                style={{ backgroundColor: "#1a4ab5" }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="w-8 h-8 flex items-center justify-center rounded transition-all disabled:opacity-40 hover:bg-slate-100"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span
                            className="text-xs font-semibold px-3 py-1 rounded"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                        >
                            {pagination.current_page} / {pagination.total_pages}
                        </span>

                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="w-8 h-8 flex items-center justify-center rounded transition-all disabled:opacity-40 hover:bg-slate-100"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_previous}
                            className="px-4 py-1.5 text-sm font-medium rounded transition-all disabled:opacity-40 hover:bg-slate-50"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151", backgroundColor: "#fff" }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="px-4 py-1.5 text-sm font-semibold text-white rounded transition-all disabled:opacity-40 hover:opacity-90"
                            style={{ backgroundColor: "#1a4ab5" }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}