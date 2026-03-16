"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Designation,
    DesignationDetail,
    CreateDesignationPayload,
    UpdateDesignationPayload,
} from "@/types/designation-types";
import { designationService } from "@/services/designation-service";
import { extractErrorMessage } from "@/lib/error-utils";
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
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl [&>button]:hidden" style={{ border: "none" }}>

                {/* Blue header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    <div>
                        <DialogTitle className="text-lg font-bold text-white">
                            {selectedDesignation ? "Edit Designation" : "Add Designation"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-blue-200 mt-0.5 block">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""} assigned
                            </span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-white hover:text-blue-200 hover:bg-transparent p-1 h-auto"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-6">
                    {error && (
                        <div
                            className="mb-4 px-4 py-3 rounded-lg text-sm"
                            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                        >
                            {error}
                        </div>
                    )}

                    {detailLoading ? (
                        <div className="py-12 flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1a4ab5" }} />
                            <p className="text-xs" style={{ color: "#9ca3af" }}>Fetching details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <Field label="Designation Name *">
                                <Input
                                    value={form.designation_name}
                                    onChange={e => setForm({ ...form, designation_name: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="h-10 rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5]"
                                    required
                                    maxLength={100}
                                />
                            </Field>

                            <Field label="Designation Code *">
                                <Input
                                    value={form.designation_code}
                                    onChange={e => setForm({ ...form, designation_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SR_SWE"
                                    className="h-10 rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5] font-mono"
                                    required
                                    maxLength={50}
                                />
                            </Field>

                            <Field label="Hierarchy Level *" hint="1 = Highest (CXO), higher numbers = lower levels">
                                <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: Number(e.target.value) })}
                                    className="h-10 rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5] font-bold"
                                    required
                                />
                            </Field>

                            <Field label="Description (optional)">
                                <Textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief summary of the role's responsibilities…"
                                    rows={3}
                                    className="rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5] resize-none"
                                />
                            </Field>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="h-10 px-5 rounded-lg border-slate-300 text-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-10 px-5 rounded-lg font-semibold text-white hover:opacity-90"
                                    style={{ backgroundColor: "#1a4ab5", border: "none" }}
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                                    {submitting ? "Saving…" : selectedDesignation ? "Save Changes" : "Create"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}