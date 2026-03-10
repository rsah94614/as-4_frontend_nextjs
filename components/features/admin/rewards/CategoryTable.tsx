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
            <div className="flex flex-col items-center justify-center py-40 text-slate-400 text-sm bg-white rounded-[40px] border border-dashed border-slate-200 gap-6 group hover:border-purple-200 transition-all cursor-default">
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors shadow-inner">
                    <Package className="w-10 h-10 opacity-20 group-hover:text-purple-400 group-hover:opacity-100 transition-all duration-700 hover:rotate-12" />
                </div>
                <div className="text-center group-hover:scale-105 transition-transform">
                    <p className="font-black text-slate-300 uppercase tracking-[0.3em] mb-2 group-hover:text-purple-400 transition-colors">CATEGORY GRID EMPTY</p>
                    <p className="font-bold text-slate-400/60 lowercase tracking-widest text-xs leading-relaxed max-w-xs">Try adjusting your filters or define a new<br />reward category for your employees.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="mt-4 px-10 py-4 bg-black text-white rounded-2xl text-[11px] font-black tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 uppercase flex items-center gap-2 group-hover:bg-purple-700 group-hover:shadow-purple-200"
                >
                    <Tag className="w-3.5 h-3.5" /> Start Building
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-700 delay-100">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50 backdrop-blur-md sticky top-0 z-10">
                            {["Category", "Code", "Description", "Status", "Created", ""].map((h, i) => (
                                <th
                                    key={i}
                                    className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] first:pl-10 last:pr-10"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : (
                            categories.map((cat) => (
                                <tr
                                    key={cat.category_id}
                                    className="group hover:bg-slate-50/50 transition-all duration-300 cursor-default animate-in fade-in slide-in-from-left-2 duration-500"
                                >
                                    <td className="px-8 py-6 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs uppercase group-hover:scale-105 transition-transform shadow-inner">
                                                {cat.category_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-purple-700 transition-colors uppercase">
                                                {cat.category_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.1em] text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm uppercase group-hover:shadow-md transition-all">
                                            {cat.category_code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs xl:max-w-md">
                                        <p className="text-xs font-bold text-slate-500 line-clamp-1 leading-relaxed tracking-wide group-hover:text-slate-800 transition-colors">
                                            {cat.description || (
                                                <span className="text-slate-300 italic opacity-50 uppercase tracking-tighter">no content provided</span>
                                            )}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <RewardBadge active={cat.is_active} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Clock className="w-3 h-3 group-hover:text-purple-400 transition-colors" />
                                                {new Date(cat.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-800 tracking-[0.1em] opacity-40 uppercase">
                                                {new Date(cat.created_at).getFullYear()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right pr-10">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(cat)}
                                            className="group/btn h-10 px-6 rounded-xl text-[10px] font-black tracking-widest text-slate-500 hover:text-white hover:bg-black transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 group-hover:translate-x-[-4px] border-slate-200"
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
