"use client";

import React, { useState, useMemo } from "react";
import { Users, X, AlertCircle, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { Employee } from "@/types/team-types";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8001";

interface AddEmployeeModalProps {
    onClose: () => void;
    onSuccess: () => void;
    allEmployees: Employee[];
}

export function AddEmployeeModal({
    onClose,
    onSuccess,
    allEmployees,
}: AddEmployeeModalProps) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        designation_id: "",
        department_id: "",
        manager_id: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Workaround: Derive designations and departments from allEmployees 
    // because the Organization Service (port 8007) is missing/broken.
    const designations = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();
        allEmployees.forEach((emp) => {
            if (emp.designation_id && emp.designation_name) {
                map.set(emp.designation_id, {
                    id: emp.designation_id,
                    name: emp.designation_name,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [allEmployees]);

    const departments = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();
        allEmployees.forEach((emp) => {
            if (emp.department_id && emp.department_name) {
                map.set(emp.department_id, {
                    id: emp.department_id,
                    name: emp.department_name,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [allEmployees]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${AUTH_API}/v1/auth/signup`, {
                method: "POST",
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    designation_id: form.designation_id,
                    department_id: form.department_id,
                    manager_id: form.manager_id || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to add employee");
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(extractErrorMessage(err, "Failed to add employee"));
        } finally {
            setSubmitting(false);
        }
    }

    const fieldCls =
        "block w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-300 outline-none bg-white text-black transition-all";
    const labelCls =
        "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                            <p className="font-bold text-black text-sm">Add New Employee</p>
                            <p className="text-[11px] text-slate-400">
                                Fill in the details to register
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    <form
                        id="add-employee-form"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className={labelCls}>Username</label>
                            <input
                                required
                                placeholder="e.g. johndoe"
                                className={fieldCls}
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="john@company.com"
                                className={fieldCls}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Temporary Password</label>
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className={fieldCls}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Department</label>
                                <select
                                    required
                                    className={fieldCls}
                                    value={form.department_id}
                                    onChange={(e) =>
                                        setForm({ ...form, department_id: e.target.value })
                                    }
                                >
                                    <option value="">Select...</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Designation</label>
                                <select
                                    required
                                    className={fieldCls}
                                    value={form.designation_id}
                                    onChange={(e) =>
                                        setForm({ ...form, designation_id: e.target.value })
                                    }
                                >
                                    <option value="">Select...</option>
                                    {designations.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Manager (Optional)</label>
                            <select
                                className={fieldCls}
                                value={form.manager_id}
                                onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                            >
                                <option value="">No Manager</option>
                                {allEmployees
                                    .filter((e) => e.is_active)
                                    .map((e) => (
                                        <option key={e.employee_id} value={e.employee_id}>
                                            {e.username} ({e.department_name})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        form="add-employee-form"
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Adding…
                            </>
                        ) : (
                            "Add Employee"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
