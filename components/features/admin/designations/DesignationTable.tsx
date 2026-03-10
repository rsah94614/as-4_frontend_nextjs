"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Designation } from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";
import { LevelBadge } from "./UIHelpers";

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
    onEdit
}: DesignationTableProps) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Designation</th>
                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Code</th>
                            <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">Level</th>
                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                </td>
                            </tr>
                        ) : designations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center text-slate-400 text-sm">
                                    No designations found.
                                </td>
                            </tr>
                        ) : (
                            designations.map(desig => (
                                <tr key={desig.designation_id} className="hover:bg-slate-50/60 transition group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                                                {desig.designation_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-black">{desig.designation_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                            {desig.designation_code}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <LevelBadge level={desig.level} />
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${desig.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}>
                                            {desig.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => onEdit(desig)}
                                            className="text-sm font-semibold text-black hover:text-purple-600 transition underline decoration-transparent hover:decoration-purple-600 underline-offset-4"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
                    <span className="text-xs text-slate-500 font-medium tracking-tight">
                        Showing <span className="text-black font-semibold">{(pagination.current_page - 1) * pagination.per_page + 1}</span>–
                        <span className="text-black font-semibold">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="text-black font-semibold">{pagination.total}</span>
                    </span>
                    <div className="flex items-center gap-2.5">
                        <button
                            disabled={!pagination.has_previous}
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1.5 text-xs font-bold bg-slate-50 rounded-lg border border-slate-100 text-black">
                            {pagination.current_page} / {pagination.total_pages}
                        </span>
                        <button
                            disabled={!pagination.has_next}
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
