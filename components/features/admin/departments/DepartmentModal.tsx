"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Department,
    DepartmentDetail,
    DepartmentType,
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
} from "@/types/department-types";
import { departmentService } from "@/services/department-service";

interface DepartmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDepartment: Department | null;
    departmentTypes: DepartmentType[];
}

const EMPTY_FORM = {
    department_name: "",
    department_code: "",
    department_type_id: "",
};

export function DepartmentModal({
    open,
    onClose,
    onSuccess,
    selectedDepartment,
    departmentTypes,
}: DepartmentModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<DepartmentDetail | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setDetail(null);
            setError(null);
            return;
        }
        if (selectedDepartment) {
            const loadDetail = async () => {
                setDetailLoading(true);
                try {
                    const d = await departmentService.getById(selectedDepartment.department_id);
                    setDetail(d);
                    setForm({
                        department_name: d.department_name,
                        department_code: d.department_code,
                        department_type_id: d.department_type
                            ? departmentTypes.find(t => t.type_code === d.department_type?.type_code)?.department_type_id ?? ""
                            : "",
                    });
                } catch {
                    setForm({
                        department_name: selectedDepartment.department_name,
                        department_code: selectedDepartment.department_code,
                        department_type_id: "",
                    });
                } finally {
                    setDetailLoading(false);
                }
            };
            loadDetail();
        } else {
            setForm(EMPTY_FORM);
        }
    }, [open, selectedDepartment, departmentTypes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload: CreateDepartmentPayload = {
                department_name: form.department_name,
                department_code: form.department_code.toUpperCase(),
                department_type_id: form.department_type_id,
            };
            if (selectedDepartment) {
                await departmentService.update(selectedDepartment.department_id, payload as UpdateDepartmentPayload);
            } else {
                await departmentService.create(payload);
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

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        fontSize: "14px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        outline: "none",
        color: "#374151",
        backgroundColor: "#ffffff",
        transition: "border-color 0.15s",
    } as React.CSSProperties;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl [&>button]:hidden" style={{ border: "none" }}>

                {/* Modal header — blue bar */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    <div>
                        <DialogTitle className="text-lg font-bold text-white">
                            {selectedDepartment ? "Edit Department" : "Add Department"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-blue-200 mt-0.5 block">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal body */}
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
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1a4ab5" }} />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Department Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>
                                    Department Name *
                                </label>
                                <input
                                    style={inputStyle}
                                    value={form.department_name}
                                    onChange={e => setForm({ ...form, department_name: e.target.value })}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#1a4ab5")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                                    placeholder="e.g. Engineering"
                                    required
                                    maxLength={255}
                                />
                            </div>

                            {/* Department Code */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>
                                    Department Code *
                                </label>
                                <input
                                    style={{ ...inputStyle, fontFamily: "monospace", textTransform: "uppercase" }}
                                    value={form.department_code}
                                    onChange={e => setForm({ ...form, department_code: e.target.value.toUpperCase() })}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#1a4ab5")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                                    placeholder="e.g. ENG001"
                                    required
                                    maxLength={20}
                                />
                            </div>

                            {/* Department Type */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>
                                    Department Type *
                                </label>
                                <Select
                                    value={form.department_type_id}
                                    onValueChange={val => setForm({ ...form, department_type_id: val })}
                                    required
                                >
                                    <SelectTrigger
                                        className="w-full h-10 rounded-lg text-sm"
                                        style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                                    >
                                        <SelectValue placeholder="Select a type…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departmentTypes.map(t => (
                                            <SelectItem key={t.department_type_id} value={t.department_type_id}>
                                                {t.type_name} ({t.type_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {departmentTypes.length === 0 && (
                                    <p className="text-xs mt-1" style={{ color: "#d97706" }}>
                                        No department types loaded — check your connection.
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-slate-50"
                                    style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                                    style={{ backgroundColor: "#1a4ab5" }}
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {submitting ? "Saving…" : selectedDepartment ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}