"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Quarter, QUARTERS, Multiplier } from "@/types/multiplier-types";
import { Field, formatDate } from "./UIHelpers";

interface MultiplierModalProps {
    showCreate: boolean;
    onCloseCreate: () => void;
    onCreate: (form: Record<string, unknown>) => Promise<void>;
    saving: boolean;
    deleteTarget: Multiplier | null;
    onCloseDelete: () => void;
    onConfirmDelete: (id: string) => Promise<void>;
}

const EMPTY_FORM = {
    quarter: 1 as Quarter,
    label: "",
    multiplier: "",
    effective_from: "",
    effective_to: "",
};

const Q_META: Record<Quarter, { label: string; months: string; pill: string; dot: string }> = {
    1: { label: "Q1", months: "Jan – Mar", pill: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
    2: { label: "Q2", months: "Apr – Jun", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
    3: { label: "Q3", months: "Jul – Sep", pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    4: { label: "Q4", months: "Oct – Dec", pill: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-400" },
};

export function MultiplierModals({
    showCreate,
    onCloseCreate,
    onCreate,
    saving,
    deleteTarget,
    onCloseDelete,
    onConfirmDelete,
}: MultiplierModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);

    const handleCreateSubmit = async () => {
        await onCreate(form);
        setForm(EMPTY_FORM);
    };

    return (
        <>
            {/* Create Modal */}
            <Dialog open={showCreate} onOpenChange={(val) => !val && onCloseCreate()}>
                <DialogContent className="max-w-lg p-7">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-black">
                            Add Seasonal Multiplier
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Boost review points during a specific period of the year.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <Field label="Quarter *" hint="Which quarter of the year does this multiplier apply to?">
                            <Select
                                value={form.quarter.toString()}
                                onValueChange={(val) => setForm(p => ({ ...p, quarter: Number(val) as Quarter }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUARTERS.map(q => (
                                        <SelectItem key={q} value={q.toString()}>
                                            {Q_META[q].label} — {Q_META[q].months}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Label *" hint="A short friendly name employees might see (e.g. 'Diwali Bonus').">
                            <Input
                                value={form.label}
                                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                                placeholder="e.g. Diwali Bonus"
                                maxLength={50}
                            />
                        </Field>

                        <Field label="Multiplier Value *" hint="1.0 = normal, 1.5 = 50% bonus, 2.0 = double.">
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={form.multiplier}
                                onChange={e => setForm(p => ({ ...p, multiplier: e.target.value }))}
                                placeholder="e.g. 1.5"
                            />
                            {form.multiplier && !isNaN(parseFloat(form.multiplier)) && (
                                <p className="text-xs text-pink-600 font-medium mt-1.5">
                                    Preview: a 5★ review (normally 50 pts) → <strong>{Math.round(50 * parseFloat(form.multiplier))} pts</strong>
                                </p>
                            )}
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Starts On" hint="First day it becomes active.">
                                <Input type="date" value={form.effective_from} onChange={e => setForm(p => ({ ...p, effective_from: e.target.value }))} />
                            </Field>
                            <Field label="Ends On" hint="Last day it's active.">
                                <Input type="date" value={form.effective_to} onChange={e => setForm(p => ({ ...p, effective_to: e.target.value }))} />
                            </Field>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 text-xs text-amber-700 leading-relaxed">
                            ⚠ Dates cannot overlap with existing multipliers in the same quarter. Leave dates blank to create an undated draft.
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6 sm:justify-end pt-5 border-t border-gray-100">
                        <Button variant="ghost" onClick={onCloseCreate}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                            onClick={handleCreateSubmit}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {saving ? "Creating…" : "Create Multiplier"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={(val) => !val && onCloseDelete()}>
                <DialogContent className="max-w-md p-7">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-black">
                            Delete Multiplier?
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 my-2">
                            <p className="text-sm font-semibold text-red-800 mb-1">{deleteTarget.label}</p>
                            <p className="text-xs text-red-600">
                                ×{parseFloat(deleteTarget.multiplier).toFixed(2)} · {Q_META[deleteTarget.quarter].label} · {formatDate(deleteTarget.effective_from)} → {formatDate(deleteTarget.effective_to)}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mb-2">
                        You are about to permanently delete this upcoming multiplier. Employees will not receive the bonus points during this period.
                    </p>

                    <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end pt-4 border-t border-gray-100">
                        <Button variant="ghost" onClick={onCloseDelete}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteTarget && onConfirmDelete(deleteTarget.seasonal_multiplier_id)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete It
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
