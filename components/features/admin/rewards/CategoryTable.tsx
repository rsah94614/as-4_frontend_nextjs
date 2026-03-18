"use client";

import React from "react";
import { Category, CategoryFilter } from "@/types/reward-types";
import { RewardBadge, SkeletonRow } from "./UIHelpers";
import { Edit2, Package, Tag, Clock, ChevronRight } from "lucide-react";

interface CategoryTableProps {
    categories: Category[];
    loading: boolean;
    onEdit: (cat: Category) => void;
    openCreate: () => void;
    filterState?: CategoryFilter;
}

export function CategoryTable({ 
    categories, 
    loading, 
    onEdit, 
    openCreate,
    filterState = "all" 
}: CategoryTableProps) {
    if (!loading && categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200 gap-6 cursor-default">
                <div className="w-24 h-24 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    <Package className="w-10 h-10 opacity-20" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-slate-300 uppercase">
                        {filterState === "all" ? "CATEGORY GRID EMPTY" : `NO ${filterState.toUpperCase()} CATEGORIES`}
                    </p>
                    {filterState === "all" && (
                        <p className="font-semibold text-slate-400/60 lowercase tracking-widest text-xs leading-relaxed max-w-xs">
                            Try adjusting your filters or define a new reward category for your employees.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ─── Card layout for small screens ─── */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                    ))
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat.category_id}
                            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-[#004C8F]/20 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004C8F] flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                                        {cat.category_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 uppercase">{cat.category_name}</p>
                                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                                            {cat.category_code}
                                        </span>
                                    </div>
                                </div>
                                <RewardBadge active={cat.is_active} />
                            </div>
                            {cat.description && (
                                <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {new Date(cat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                                <button
                                    onClick={() => onEdit(cat)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ─── Table layout for large screens ─── */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {["Category", "Code", "Description", "Status", "Created", ""].map((h, i) => (
                                <th
                                    key={i}
                                    className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest first:pl-6 last:pr-6"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : (
                            categories.map((cat) => (
                                <tr
                                    key={cat.category_id}
                                    className="group hover:bg-gray-50 transition-colors cursor-default"
                                >
                                    <td className="px-5 py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            
                                            <span className="text-sm font-semibold text-gray-800 tracking-tight group-hover:text-[#004C8F] transition-colors uppercase">
                                                {cat.category_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[11px] font-bold tracking-widest text-gray-600 uppercase">
                                            {cat.category_code}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 max-w-xs">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {cat.description || (
                                                <span className="text-gray-300 italic">—</span>
                                            )}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <RewardBadge active={cat.is_active} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                            {new Date(cat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right pr-6">
                                        <button
                                            onClick={() => onEdit(cat)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold border border-gray-200 text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Manage
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
