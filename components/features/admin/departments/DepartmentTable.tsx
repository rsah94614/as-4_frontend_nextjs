"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Department } from "@/types/department-types";
import { PaginationMeta } from "@/types/pagination";
import PaginationControls from "@/components/shared/PaginationControls";

interface DepartmentTableProps {
    departments: Department[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (dept: Department) => void;
}

function DepartmentTableSkeleton() {
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
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-3 w-14" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>

                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                ))}
            </div>

            <div className="hidden xl:block overflow-x-auto">
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
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr
                                key={index}
                                style={{
                                    borderBottom: index < 4 ? "1px solid #f3f4f6" : "none",
                                }}
                            >
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-4 w-40" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-6 w-24 rounded" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <Skeleton className="h-4 w-28" />
                                </td>
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-6 h-6 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
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
                <DepartmentTableSkeleton />
            ) : departments.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: "#9ca3af" }}>
                    No departments found.
                </div>
            ) : (
                <>
                    <div className="space-y-3 xl:hidden overflow-x-hidden">
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
                                        className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                                        style={
                                            dept.is_active
                                                ? {
                                                    backgroundColor: "#ffffff",
                                                    color: "#14a882",
                                                    border: "solid #14a882",
                                                }
                                                : {
                                                    backgroundColor: "#6b7280",
                                                    color: "#ffffff",
                                                }
                                        }
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

                    <div className="hidden xl:block overflow-x-auto">
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
                                                className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold"
                                                style={
                                                    dept.is_active
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
