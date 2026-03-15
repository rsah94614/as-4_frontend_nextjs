"use client";

import React from "react";
import { Category } from "@/types/reward-types";
import { RewardBadge, SkeletonRow } from "./UIHelpers";
import { Edit2, Package, Tag, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryTableProps {
    categories: Category[];
    loading: boolean;
    onEdit: (cat: Category) => void;
    openCreate: () => void;
}

export function CategoryTable({ categories, loading, onEdit, openCreate }: CategoryTableProps) {
    if (!loading && categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200 gap-6 group hover:border-blue-200 transition-all cursor-default">
                <div className="w-24 h-24 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shadow-inner">
                    <Package className="w-10 h-10 opacity-20 group-hover:text-blue-400 group-hover:opacity-100 transition-all duration-700 hover:rotate-12" />
                </div>
                <div className="text-center group-hover:scale-105 transition-transform">
                    <p className="font-semibold text-slate-300 uppercase tracking-wide mb-2 group-hover:text-blue-400 transition-colors">CATEGORY GRID EMPTY</p>
                    <p className="font-semibold text-slate-400/60 lowercase tracking-widest text-xs leading-relaxed max-w-xs">Try adjusting your filters or define a new<br />reward category for your employees.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="mt-4 px-10 py-4 bg-black text-white rounded-xl text-[11px] font-semibold tracking-wider shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 uppercase flex items-center gap-2 group-hover:bg-[#004C8F] group-hover:shadow-blue-200"
                >
                    <Tag className="w-3.5 h-3.5" /> Start Building
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-700 delay-100">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-300 bg-slate-200/60 backdrop-blur-md sticky top-0 z-10">
                            {["Category", "Code", "Description", "Status", "Created", ""].map((h, i) => (
                                <th
                                    key={i}
                                    className="px-8 py-5 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider first:pl-10 last:pr-10"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : (
                            categories.map((cat) => (
                                <tr
                                    key={cat.category_id}
                                    className="group hover:bg-slate-100 transition-all duration-300 cursor-default animate-in fade-in slide-in-from-left-2 duration-500 hover:shadow-sm hover:z-10 relative"
                                >
                                    <td className="px-8 py-6 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004C8F] flex items-center justify-center font-bold text-xs uppercase group-hover:scale-105 transition-transform shadow-inner">
                                                {cat.category_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-[#004C8F] transition-colors uppercase">
                                                {cat.category_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#003366] bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm uppercase group-hover:shadow-md transition-all">
                                            {cat.category_code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs xl:max-w-md">
                                        <p className="text-xs font-bold text-slate-600 line-clamp-1 leading-relaxed tracking-wide group-hover:text-slate-900 transition-colors">
                                            {cat.description || (
                                                <span className="text-slate-400 italic opacity-50 uppercase tracking-tighter">no content provided</span>
                                            )}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <RewardBadge active={cat.is_active} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 uppercase tracking-tight">
                                                <Clock className="w-3 h-3 group-hover:text-[#003366] transition-colors" />
                                                {new Date(cat.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-900 tracking-wider uppercase">
                                                {new Date(cat.created_at).getFullYear()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right pr-10">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(cat)}
                                            className="group/btn h-10 px-6 rounded-xl text-[10px] font-semibold tracking-wider text-slate-500 hover:text-white hover:bg-black transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 group-hover:translate-x-[-4px] border-slate-200"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                                            MANAGE
                                            <ChevronRight className="w-3.5 h-3.5 translate-x-1 group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
