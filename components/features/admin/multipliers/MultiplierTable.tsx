"use client";

import { Loader2, Edit2, Trash2, Check, X } from "lucide-react";
import { Multiplier, Quarter, QUARTERS } from "@/types/multiplier-types";
import { StatusBadge, formatDate, getStatus } from "./UIHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MultiplierTableProps {
    multipliers: Multiplier[];
    loading: boolean;
    filterQuarter: Quarter | 0;
    onEdit: (m: Multiplier) => void;
    onDelete: (m: Multiplier) => void;
    editingId: string | null;
    editForm: { label: string; multiplier: string; effective_from: string; effective_to: string };
    onUpdate: (id: string) => void;
    onCancelEdit: () => void;
    onEditFormChange: (field: string, val: string) => void;
    saving: boolean;
}

const Q_META: Record<Quarter, { label: string; months: string; pill: string; header: string; dot: string; accent: string }> = {
    1: { label: "Q1", months: "Jan – Mar", pill: "bg-sky-50 text-sky-700 border-sky-200", header: "bg-sky-50/40 border-sky-100", dot: "bg-sky-400", accent: "text-sky-600" },
    2: { label: "Q2", months: "Apr – Jun", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", header: "bg-emerald-50/40 border-emerald-100", dot: "bg-emerald-400", accent: "text-emerald-600" },
    3: { label: "Q3", months: "Jul – Sep", pill: "bg-amber-50 text-amber-700 border-amber-200", header: "bg-amber-50/40 border-amber-100", dot: "bg-amber-400", accent: "text-amber-600" },
    4: { label: "Q4", months: "Oct – Dec", pill: "bg-pink-50 text-pink-700 border-pink-200", header: "bg-pink-50/40 border-pink-100", dot: "bg-pink-400", accent: "text-pink-600" },
};

function SkeletonMultiplierRow() {
    return (
        <tr className="border-b border-gray-100">
            <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
            <td className="px-5 py-4"><Skeleton className="h-7 w-16" /></td>
            <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
            <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
            <td className="px-5 py-4"><Skeleton className="h-6 w-20" /></td>
            <td className="px-5 py-4"><Skeleton className="h-7 w-16 ml-auto" /></td>
        </tr>
    );
}

function SkeletonSection() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-2" />
                <Skeleton className="ml-auto h-6 w-10 rounded-full" />
            </div>
            <table className="w-full">
                <tbody>
                    <SkeletonMultiplierRow />
                    <SkeletonMultiplierRow />
                </tbody>
            </table>
        </div>
    );
}

export function MultiplierTable({
    multipliers,
    loading,
    filterQuarter,
    onEdit,
    onDelete,
    editingId,
    editForm,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
    saving,
}: MultiplierTableProps) {
    const visibleQuarters = (filterQuarter ? [filterQuarter] : QUARTERS) as Quarter[];
    const grouped = Object.fromEntries(QUARTERS.map(q => [q, multipliers.filter(m => m.quarter === q)])) as Record<Quarter, Multiplier[]>;

    if (loading) {
        return (
            <div className="space-y-5">
                {QUARTERS.map((_, i) => <SkeletonSection key={i} />)}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {visibleQuarters.map(q => {
                const meta = Q_META[q];
                const items = grouped[q] ?? [];
                return (
                    <div key={q} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Section header */}
                        <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${meta.header}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                            <div>
                                <span className="text-sm font-bold text-gray-800">{meta.label}</span>
                                <span className="text-xs text-gray-400 ml-2">{meta.months}</span>
                            </div>
                            <Badge variant="secondary" className={`ml-auto border ${meta.pill}`}>
                                {items.length}
                            </Badge>
                        </div>

                        {items.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm font-medium text-gray-400">No multipliers for {meta.label}</p>
                                <p className="text-xs text-gray-300 mt-1">Add a multiplier to boost points for this quarter</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/40">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Label</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Multiplier</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell w-36">Starts</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell w-36">Ends</th>
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">Status</th>
                                                <th className="px-5 py-3 w-36" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(m => {
                                                const isEditing = editingId === m.seasonal_multiplier_id;
                                                const status = getStatus(m);
                                                return (
                                                    <tr key={m.seasonal_multiplier_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-5 py-4">
                                                            {isEditing
                                                                ? <input autoFocus value={editForm.label} onChange={e => onEditFormChange("label", e.target.value)}
                                                                    className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 w-full bg-pink-50/30" />
                                                                : <span className="font-semibold text-gray-800">{m.label}</span>
                                                            }
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {isEditing
                                                                ? <input type="number" step="0.01" min="0.01" value={editForm.multiplier}
                                                                    onChange={e => onEditFormChange("multiplier", e.target.value)}
                                                                    className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 w-24 bg-pink-50/30" />
                                                                : <Badge variant="secondary" className={`border ${meta.pill}`}>
                                                                    ×{parseFloat(m.multiplier).toFixed(2)}
                                                                </Badge>
                                                            }
                                                        </td>
                                                        <td className="px-5 py-4 hidden md:table-cell">
                                                            {isEditing
                                                                ? <input type="date" value={editForm.effective_from} onChange={e => onEditFormChange("effective_from", e.target.value)}
                                                                    className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                                                : <span className="text-sm text-gray-600">{formatDate(m.effective_from)}</span>
                                                            }
                                                        </td>
                                                        <td className="px-5 py-4 hidden md:table-cell">
                                                            {isEditing
                                                                ? <input type="date" value={editForm.effective_to} onChange={e => onEditFormChange("effective_to", e.target.value)}
                                                                    className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                                                : <span className="text-sm text-gray-600">{formatDate(m.effective_to)}</span>
                                                            }
                                                        </td>
                                                        <td className="px-5 py-4"><StatusBadge m={m} /></td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                {isEditing ? (
                                                                    <>
                                                                        <Button onClick={() => onUpdate(m.seasonal_multiplier_id)} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                                                            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />} Save
                                                                        </Button>
                                                                        <Button onClick={onCancelEdit} variant="ghost" size="sm">
                                                                            Cancel
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                                                        <Button onClick={() => onEdit(m)} variant="outline" size="sm" className="hover:text-pink-600 hover:bg-pink-50 border-gray-200">
                                                                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                                                                        </Button>
                                                                        {status === "upcoming" && (
                                                                            <Button onClick={() => onDelete(m)} variant="outline" size="sm" className="text-gray-400 hover:text-red-500 hover:bg-red-50 border-gray-200">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="sm:hidden divide-y divide-gray-100">
                                    {items.map(m => {
                                        const isEditing = editingId === m.seasonal_multiplier_id;
                                        const status = getStatus(m);
                                        return (
                                            <div key={m.seasonal_multiplier_id} className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input autoFocus value={editForm.label} onChange={e => onEditFormChange("label", e.target.value)}
                                                                    className="w-full border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" placeholder="Label" />
                                                                <input type="number" step="0.01" value={editForm.multiplier} onChange={e => onEditFormChange("multiplier", e.target.value)}
                                                                    className="w-full border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" placeholder="Multiplier (e.g. 1.5)" />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <input type="date" value={editForm.effective_from} onChange={e => onEditFormChange("effective_from", e.target.value)}
                                                                        className="border border-pink-300 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                                                    <input type="date" value={editForm.effective_to} onChange={e => onEditFormChange("effective_to", e.target.value)}
                                                                        className="border border-pink-300 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                                    <span className="font-semibold text-gray-800 text-sm">{m.label}</span>
                                                                    <Badge variant="secondary" className={`text-xs border ${meta.pill}`}>×{parseFloat(m.multiplier).toFixed(2)}</Badge>
                                                                </div>
                                                                <p className="text-xs text-gray-400 mb-1.5">
                                                                    {formatDate(m.effective_from)} → {formatDate(m.effective_to)}
                                                                </p>
                                                                <StatusBadge m={m} />
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0 mt-1">
                                                        {isEditing ? (
                                                            <>
                                                                <Button onClick={() => onUpdate(m.seasonal_multiplier_id)} disabled={saving} size="sm" className="bg-emerald-600 text-white">
                                                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                                                </Button>
                                                                <Button onClick={onCancelEdit} variant="ghost" size="sm" className="p-1 h-auto">
                                                                    <X className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button onClick={() => onEdit(m)} variant="outline" size="sm" className="h-8">
                                                                    Edit
                                                                </Button>
                                                                {status === "upcoming" && (
                                                                    <Button onClick={() => onDelete(m)} variant="outline" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
