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
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#1a4ab5" }} />
                </div>
            ) : departments.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                    No departments found.
                </div>
            ) : (
                <>
                    <div className="space-y-3 md:hidden overflow-x-hidden">
                        {departments.map(dept => (
                            <div
                                key={dept.department_id}
                                className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden"
                                style={{ backgroundColor: "#ffffff" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="min-w-0 flex-1 break-words font-semibold text-sm leading-5" style={{ color: "#111827" }}>
                                        {dept.department_name}
                                    </p>
                                    <span
                                        className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold text-white"
                                        style={{ backgroundColor: dept.is_active ? "#14a882" : "#6b7280" }}
                                    >
                                        {dept.is_active ? "Active" : "Inactive"}
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
                                            {dept.department_code}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-1" style={{ color: "#6b7280" }}>
                                            Type
                                        </p>
                                        <p className="break-words" style={{ color: "#374151" }}>
                                            {dept.department_type ? dept.department_type.type_name : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs" style={{ color: "#6b7280" }}>
                                        Manager
                                    </p>
                                    {dept.manager ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ backgroundColor: "#1a4ab5" }}
                                            >
                                                {dept.manager.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="min-w-0 break-words text-sm" style={{ color: "#374151" }}>
                                                {dept.manager.username}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm" style={{ color: "#9ca3af" }}>
                                            -
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => onEdit(dept)}
                                    className="w-full px-4 py-2 text-xs font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
                                    style={{ backgroundColor: "#1a4ab5" }}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[860px] text-sm">
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
                                {departments.map((dept, idx) => (
                                    <tr
                                        key={dept.department_id}
                                        className="transition-colors"
                                        style={{
                                            borderBottom: idx < departments.length - 1 ? "1px solid #f3f4f6" : "none",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                    >
                                        <td className="py-3.5 px-4 font-semibold" style={{ color: "#111827" }}>
                                            {dept.department_name}
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
                                                {dept.department_code}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4" style={{ color: "#374151" }}>
                                            {dept.department_type ? dept.department_type.type_name : "-"}
                                        </td>

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
                                                <span style={{ color: "#9ca3af" }}>-</span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold text-white"
                                                style={{ backgroundColor: dept.is_active ? "#14a882" : "#6b7280" }}
                                            >
                                                {dept.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <button
                                                onClick={() => onEdit(dept)}
                                                className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
                                                style={{ backgroundColor: "#1a4ab5" }}
                                            >
                                                Edit
                                            </button>
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
                            className="hidden md:inline-flex px-4 py-1.5 text-sm font-medium rounded transition-all disabled:opacity-40 hover:bg-slate-50"
                            style={{ border: "1.5px solid #d1d5db", color: "#374151", backgroundColor: "#fff" }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="hidden md:inline-flex px-4 py-1.5 text-sm font-semibold text-white rounded transition-all disabled:opacity-40 hover:opacity-90"
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
