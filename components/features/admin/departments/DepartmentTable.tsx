"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Department } from "@/types/department-types";
import { PaginationMeta } from "@/types/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Department</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Code</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Manager</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center text-slate-400 text-sm">
                                        No departments found.
                                    </td>
                                </tr>
                            ) : (
                                departments.map(dept => (
                                    <tr key={dept.department_id} className="hover:bg-slate-50/60 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {dept.department_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-black">{dept.department_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {dept.department_code}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {dept.department_type ? (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                                    {dept.department_type.type_name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {dept.manager ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                                                        {dept.manager.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-slate-700 font-medium">{dept.manager.username}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={dept.is_active ? "default" : "destructive"} className={dept.is_active ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : ""}>
                                                {dept.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="link"
                                                onClick={() => onEdit(dept)}
                                                className="text-black hover:text-purple-600 p-0 h-auto"
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
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
                    <span className="text-xs text-slate-500">
                        Showing {(pagination.current_page - 1) * pagination.per_page + 1}–
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.has_previous}
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            className="p-1.5 h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 text-xs font-semibold">
                            {pagination.current_page} / {pagination.total_pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.has_next}
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            className="p-1.5 h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
