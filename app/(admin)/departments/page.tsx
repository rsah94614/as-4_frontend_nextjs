"use client";

import { useEffect, useState, useCallback } from "react";
import {
    departmentService,
    type Department,
    type DepartmentDetail,
    type DepartmentType,
    type PaginationMeta,
} from "@/services/department-service";

const EMPTY_FORM = {
    department_name: "",
    department_code: "",
    department_type_id: "",
    manager_id: "",
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                {label}
            </label>
            {children}
        </div>
    );
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [pagination, setPagination]   = useState<PaginationMeta | null>(null);
    const [deptTypes, setDeptTypes]     = useState<DepartmentType[]>([]);

    const [loading, setLoading]         = useState(true);
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState<string | null>(null);

    const [open, setOpen]               = useState(false);
    const [selected, setSelected]       = useState<DepartmentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [page, setPage]               = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch]           = useState("");
    const [form, setForm]               = useState<FormState>(EMPTY_FORM);

    // Load department types for dropdown
    useEffect(() => {
        departmentService.listTypes().then(setDeptTypes).catch(() => {});
    }, []);

    // Load departments list
    const loadDepartments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await departmentService.list({
                page,
                limit: 20,
                search: search || undefined,
            });
            setDepartments(res.data);
            setPagination(res.pagination);
        } catch (err: unknown) {
            setError(apiError(err, "Failed to load departments."));
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const openCreate = () => {
        setSelected(null);
        setForm(EMPTY_FORM);
        setError(null);
        setOpen(true);
    };

    const openEdit = async (dept: Department) => {
    setOpen(true);
    setDetailLoading(true);
    try {
        const detail = await departmentService.getById(dept.department_id);
        setSelected(detail);
        setForm({
            department_name: detail.department_name,
            department_code: detail.department_code,
            // Ensure you capture the ID from the nested object
            department_type_id: (detail.department_type as any)?.department_type_id ?? "", 
            manager_id: detail.manager?.employee_id ?? "",
        });
    } catch {
            setSelected(dept as DepartmentDetail);
            setForm({
                department_name: dept.department_name,
                department_code: dept.department_code,
                department_type_id: "",
                manager_id: dept.manager?.employee_id ?? "",
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
            if (selected) {
                await departmentService.update(selected.department_id, {
                    department_name: form.department_name || undefined,
                    department_code: form.department_code
                        ? form.department_code.toUpperCase()
                        : undefined,
                    department_type_id: form.department_type_id || undefined,
                    manager_id: form.manager_id || undefined,
                });
            } else {
                if (!form.department_type_id) {
                    setError("Department type is required.");
                    setSubmitting(false);
                    return;
                }
                await departmentService.create({
                    department_name: form.department_name,
                    department_code: form.department_code.toUpperCase(),
                    department_type_id: form.department_type_id,
                    manager_id: form.manager_id || undefined,
                });
            }
            setOpen(false);
            setSelected(null);
            setForm(EMPTY_FORM);
            loadDepartments();
        } catch (err: unknown) {
            setError(apiError(err, "Operation failed."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="bg-white shadow-xl rounded-2xl p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage organizational departments and internal structure
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-black text-white px-6 py-2 rounded-xl hover:opacity-80 transition text-sm font-medium"
                    >
                        + Add Department
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name or code…"
                        className="border rounded-lg px-4 py-2 text-sm w-72 focus:ring-2 focus:ring-black outline-none"
                    />
                    <button type="submit"
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:opacity-80">
                        Search
                    </button>
                    {search && (
                        <button type="button"
                            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                            Clear
                        </button>
                    )}
                </form>

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
                                <th className="p-4 text-left">Department</th>
                                <th className="p-4 text-left">Code</th>
                                <th className="p-4 text-left">Type</th>
                                <th className="p-4 text-left">Manager</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400 animate-pulse">
                                        Loading departments…
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        {search ? `No departments matching "${search}"` : "No departments found"}
                                    </td>
                                </tr>
                            ) : (
                                departments.map((dept) => (
                                    <tr key={dept.department_id}
                                        className="border-t hover:bg-gray-50 transition">
                                        <td className="p-4 font-semibold">{dept.department_name}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500">
                                            {dept.department_code}
                                        </td>
                                        <td className="p-4">
                                            {dept.department_type ? (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                                    {dept.department_type.type_name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {dept.manager?.username ?? (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                dept.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                                {dept.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEdit(dept)}
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
                    <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-7">
                        <h2 className="text-xl font-semibold mb-5">
                            {selected ? "Edit Department" : "Create Department"}
                        </h2>

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
                                <Field label="Department Name *">
                                    <input
                                        value={form.department_name}
                                        onChange={(e) =>
                                            setForm({ ...form, department_name: e.target.value })
                                        }
                                        placeholder="e.g. Engineering"
                                        className={inputCls}
                                        required
                                        maxLength={255}
                                    />
                                </Field>

                                <Field label="Department Code *">
                                    <input
                                        value={form.department_code}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                department_code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="e.g. ENG"
                                        className={`${inputCls} font-mono`}
                                        required
                                        maxLength={20}
                                    />
                                </Field>

                                <Field label={`Department Type${selected ? "" : " *"}`}>
                                    {deptTypes.length > 0 ? (
                                        <select
                                            value={form.department_type_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    department_type_id: e.target.value,
                                                })
                                            }
                                            className={`${inputCls} bg-white`}
                                            required={!selected}
                                        >
                                            <option value="">
                                                {selected
                                                    ? "— keep current —"
                                                    : "Select a type…"}
                                            </option>
                                            {deptTypes.map((t) => (
                                                <option
                                                    key={t.department_type_id}
                                                    value={t.department_type_id}
                                                >
                                                    {t.type_name} ({t.type_code})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            value={form.department_type_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    department_type_id: e.target.value,
                                                })
                                            }
                                            placeholder="Department type UUID"
                                            className={inputCls}
                                            required={!selected}
                                        />
                                    )}
                                </Field>

                                <Field label="Manager ID (optional)">
                                    <input
                                        value={form.manager_id}
                                        onChange={(e) =>
                                            setForm({ ...form, manager_id: e.target.value })
                                        }
                                        placeholder="Employee UUID of manager"
                                        className={inputCls}
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