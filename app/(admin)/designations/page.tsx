"use client";

import { useEffect, useState, useCallback } from "react";
import {
    designationService,
    type Designation,
    type DesignationDetail,
    type PaginationMeta,
} from "@/services/designation-service";

const EMPTY_FORM = {
    designation_name: "",
    designation_code: "",
    level: 1,
    description: "",
};

type FormState = typeof EMPTY_FORM;

function apiError(err: unknown, fallback: string): string {
    return (
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        fallback
    );
}

const inputCls =
    "w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none text-sm";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

export default function DesignationsPage() {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [pagination, setPagination]     = useState<PaginationMeta | null>(null);

    const [loading, setLoading]           = useState(true);
    const [submitting, setSubmitting]     = useState(false);
    const [error, setError]               = useState<string | null>(null);

    const [open, setOpen]                 = useState(false);
    const [selected, setSelected]         = useState<Designation | null>(null);
    const [detail, setDetail]             = useState<DesignationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [page, setPage]                 = useState(1);
    const [form, setForm]                 = useState<FormState>(EMPTY_FORM);

    // Load designations list
    const loadDesignations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await designationService.list({ page, limit: 20 });
            setDesignations(res.data);
            setPagination(res.pagination);
        } catch (err: unknown) {
            setError(apiError(err, "Failed to load designations."));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadDesignations();
    }, [loadDesignations]);

    const openCreate = () => {
        setSelected(null);
        setDetail(null);
        setForm(EMPTY_FORM);
        setError(null);
        setOpen(true);
    };

    const openEdit = async (desig: Designation) => {
        setSelected(desig);
        setDetail(null);
        setError(null);
        setOpen(true);
        setDetailLoading(true);
        try {
            const d = await designationService.getById(desig.designation_id);
            setDetail(d);
            setForm({
                designation_name: d.designation_name,
                designation_code: d.designation_code,
                level: d.level,
                description: d.description ?? "",
            });
        } catch {
            setForm({
                designation_name: desig.designation_name,
                designation_code: desig.designation_code,
                level: desig.level,
                description: "",
            });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                designation_name: form.designation_name,
                designation_code: form.designation_code.toUpperCase(),
                level: Number(form.level),
                description: form.description || undefined,
            };

            if (selected) {
                await designationService.update(selected.designation_id, payload);
            } else {
                await designationService.create(payload);
            }

            setOpen(false);
            setSelected(null);
            setForm(EMPTY_FORM);
            loadDesignations();
        } catch (err: unknown) {
            setError(apiError(err, "Operation failed."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="bg-white shadow-xl rounded-2xl p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Designations</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage job designations and hierarchy levels
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-black text-white px-6 py-2 rounded-xl hover:opacity-80 transition text-sm font-medium"
                    >
                        + Add Designation
                    </button>
                </div>

                {error && !open && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Designation</th>
                                <th className="p-4 text-left">Code</th>
                                <th className="p-4 text-center">Level</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400 animate-pulse">
                                        Loading designations…
                                    </td>
                                </tr>
                            ) : designations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No designations found
                                    </td>
                                </tr>
                            ) : (
                                designations.map((desig) => (
                                    <tr key={desig.designation_id}
                                        className="border-t hover:bg-gray-50 transition">
                                        <td className="p-4 font-semibold">{desig.designation_name}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500">
                                            {desig.designation_code}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                                                {desig.level}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                desig.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                                {desig.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEdit(desig)}
                                                className="text-black underline text-sm hover:opacity-60">
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
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <span>
                            Showing{" "}
                            {(pagination.current_page - 1) * pagination.per_page + 1}–
                            {Math.min(
                                pagination.current_page * pagination.per_page,
                                pagination.total
                            )}{" "}
                            of {pagination.total}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={!pagination.has_previous}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                ← Prev
                            </button>
                            <span className="px-3 py-1">
                                Page {pagination.current_page} / {pagination.total_pages}
                            </span>
                            <button disabled={!pagination.has_next}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-[480px] rounded-2xl shadow-2xl p-7">
                        <div className="flex justify-between items-start mb-5">
                            <h2 className="text-xl font-semibold">
                                {selected ? "Edit Designation" : "Create Designation"}
                            </h2>
                            {detail && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    {detail.employee_count} employee
                                    {detail.employee_count !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {detailLoading ? (
                            <div className="py-10 text-center text-gray-400 animate-pulse">
                                Loading…
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Field label="Designation Name *">
                                    <input
                                        value={form.designation_name}
                                        onChange={(e) =>
                                            setForm({ ...form, designation_name: e.target.value })
                                        }
                                        placeholder="e.g. Senior Developer"
                                        className={inputCls}
                                        required
                                        maxLength={100}
                                    />
                                </Field>

                                <Field label="Designation Code *">
                                    <input
                                        value={form.designation_code}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                designation_code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="e.g. SR_DEV"
                                        className={`${inputCls} font-mono`}
                                        required
                                        maxLength={50}
                                    />
                                </Field>

                                <Field
                                    label="Hierarchy Level *"
                                    hint="Lower = higher seniority (1 = CXO, 5 = Junior)"
                                >
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.level}
                                        onChange={(e) =>
                                            setForm({ ...form, level: Number(e.target.value) })
                                        }
                                        className={inputCls}
                                        required
                                    />
                                </Field>

                                <Field label="Description (optional)">
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        placeholder="Brief role description…"
                                        rows={2}
                                        className={`${inputCls} resize-none`}
                                    />
                                </Field>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            setSelected(null);
                                            setError(null);
                                        }}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 bg-black text-white rounded-lg hover:opacity-80 text-sm disabled:opacity-50 font-medium"
                                    >
                                        {submitting
                                            ? "Saving…"
                                            : selected
                                            ? "Save Changes"
                                            : "Create"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}