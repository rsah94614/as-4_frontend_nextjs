"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Designation,
    DesignationDetail,
    CreateDesignationPayload,
    UpdateDesignationPayload
} from "@/types/designation-types";
import { designationService } from "@/services/designation-service";
import { Field } from "./UIHelpers";

interface DesignationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDesignation: Designation | null;
}

const EMPTY_FORM = {
    designation_name: "",
    designation_code: "",
    level: 1,
    description: "",
};

export function DesignationModal({
    open,
    onClose,
    onSuccess,
    selectedDesignation,
}: DesignationModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<DesignationDetail | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setDetail(null);
            setError(null);
            return;
        }

        if (selectedDesignation) {
            const loadDetail = async () => {
                setDetailLoading(true);
                try {
                    const d = await designationService.getById(selectedDesignation.designation_id);
                    setDetail(d);
                    setForm({
                        designation_name: d.designation_name,
                        designation_code: d.designation_code,
                        level: d.level,
                        description: d.description ?? "",
                    });
                } catch {
                    setForm({
                        designation_name: selectedDesignation.designation_name,
                        designation_code: selectedDesignation.designation_code,
                        level: selectedDesignation.level,
                        description: "",
                    });
                } finally {
                    setDetailLoading(false);
                }
            };
            loadDetail();
        } else {
            setForm(EMPTY_FORM);
        }
    }, [open, selectedDesignation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload: CreateDesignationPayload = {
                designation_name: form.designation_name,
                designation_code: form.designation_code.toUpperCase(),
                level: Number(form.level),
                description: form.description || undefined,
            };

            if (selectedDesignation) {
                await designationService.update(selectedDesignation.designation_id, payload as UpdateDesignationPayload);
            } else {
                await designationService.create(payload);
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Operation failed.";
            setError(detail);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md p-7 rounded-2xl">
                <DialogHeader className="flex flex-row justify-between items-start border-b border-gray-100 pb-4 mb-4">
                    <div>
                        <DialogTitle className="text-xl font-bold text-black tracking-tight">
                            {selectedDesignation ? "Edit Designation" : "Create Designation"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium mt-1.5 inline-block border border-slate-200">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""} active
                            </span>
                        )}
                    </div>
                </DialogHeader>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {detailLoading ? (
                    <div className="py-14 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-300 mx-auto" />
                        <p className="text-xs text-slate-400 mt-2 font-medium">Fetching details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Designation Name *">
                            <Input
                                value={form.designation_name}
                                onChange={e => setForm({ ...form, designation_name: e.target.value })}
                                placeholder="e.g. Senior Software Engineer"
                                className="rounded-xl"
                                required
                                maxLength={100}
                            />
                        </Field>

                        <Field label="Designation Code *">
                            <Input
                                value={form.designation_code}
                                onChange={e => setForm({ ...form, designation_code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SR_SWE"
                                className="rounded-xl font-mono"
                                required
                                maxLength={50}
                            />
                        </Field>

                        <Field
                            label="Hierarchy Level *"
                            hint="1 = Highest (CXO), Higher numbers = Lower levels"
                        >
                            <Input
                                type="number"
                                min={1}
                                max={50}
                                value={form.level}
                                onChange={e => setForm({ ...form, level: Number(e.target.value) })}
                                className="rounded-xl text-black font-bold"
                                required
                            />
                        </Field>

                        <Field label="Description (optional)">
                            <Textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief summary of the role's responsibilities…"
                                rows={2}
                                className="rounded-xl resize-none bg-slate-50/50 border-slate-200 focus:bg-white"
                            />
                        </Field>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-xl px-6 text-slate-500 font-bold tracking-tight hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-black text-white hover:bg-slate-800 rounded-xl px-8 font-bold tracking-tight shadow-md hover:shadow-lg transition-all"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving…
                                    </>
                                ) : (
                                    selectedDesignation ? "Update Designation" : "Create"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
