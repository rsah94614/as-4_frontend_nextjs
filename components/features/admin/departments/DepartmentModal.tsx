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
    UpdateDepartmentPayload
} from "@/types/department-types";
import { departmentService } from "@/services/department-service";
import { Field } from "./UIHelpers";

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

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md p-7">
                <DialogHeader className="flex flex-row justify-between items-start border-b border-gray-100 pb-4 mb-4">
                    <div>
                        <DialogTitle className="text-xl font-bold text-black">
                            {selectedDepartment ? "Edit Department" : "Create Department"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium mt-1 inline-block">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </DialogHeader>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {detailLoading ? (
                    <div className="py-10 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Department Name *">
                            <Input
                                value={form.department_name}
                                onChange={e => setForm({ ...form, department_name: e.target.value })}
                                placeholder="e.g. Engineering"
                                required
                                maxLength={255}
                            />
                        </Field>

                        <Field label="Department Code *">
                            <Input
                                value={form.department_code}
                                onChange={e => setForm({ ...form, department_code: e.target.value.toUpperCase() })}
                                placeholder="e.g. ENG"
                                className="font-mono"
                                required
                                maxLength={20}
                            />
                        </Field>

                        <Field label="Department Type *">
                            <Select
                                value={form.department_type_id}
                                onValueChange={val => setForm({ ...form, department_type_id: val })}
                                required
                            >
                                <SelectTrigger>
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
                                <p className="text-xs text-amber-500 mt-1">
                                    No department types loaded — check your connection.
                                </p>
                            )}
                        </Field>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-black text-white hover:bg-slate-800"
                            >
                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                                {submitting ? "Saving…" : selectedDepartment ? "Save Changes" : "Create"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
