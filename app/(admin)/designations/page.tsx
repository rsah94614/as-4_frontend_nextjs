"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search, RefreshCw, Plus, X, Loader2,
    ChevronLeft, ChevronRight, Layers, Users, TrendingUp
} from "lucide-react";
import {
    designationService,
    type Designation,
    type DesignationDetail,
} from "@/services/designation-service";
import type { PaginationMeta } from "@/types/pagination";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function apiError(err: unknown, fallback: string): string {
    return (
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        fallback
    );
}

const inputCls =
    "w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-300 outline-none text-sm bg-white text-black placeholder:text-slate-400";

function Field({
    label, hint, children,
}: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

// ─── Level badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: number }) {
    const colors = [
        "bg-purple-100 text-purple-700",
        "bg-blue-100 text-blue-700",
        "bg-cyan-100 text-cyan-700",
        "bg-green-100 text-green-700",
        "bg-amber-100 text-amber-700",
        "bg-orange-100 text-orange-700",
        "bg-red-100 text-red-700",
    ];
    const cls = colors[(level - 1) % colors.length] ?? "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${cls}`}>
            {level}
        </span>
    );
}

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
    designation_name: "",
    designation_code: "",
    level: 1,
    description: "",
};
type FormState = typeof EMPTY_FORM;

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignationsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Designation | null>(null);
    const [detail, setDetail] = useState<DesignationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    // ── Load list ──────────────────────────────────────────────────────────────
    const loadDesignations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await designationService.list({ page, limit: 20 });
            setDesignations(res.data);
            setPagination(res.pagination);
        } catch (err) {
            setError(apiError(err, "Failed to load designations."));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { loadDesignations(); }, [loadDesignations]);

    // ── Client-side search filter ──────────────────────────────────────────────
    const filtered = search
        ? designations.filter(
            d =>
                d.designation_name.toLowerCase().includes(search.toLowerCase()) ||
                d.designation_code.toLowerCase().includes(search.toLowerCase())
        )
        : designations;

    // ── Modal helpers ──────────────────────────────────────────────────────────
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

    const closeModal = () => {
        setOpen(false);
        setSelected(null);
        setError(null);
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
            closeModal();
            loadDesignations();
        } catch (err) {
            setError(apiError(err, "Operation failed."));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Summary stats ──────────────────────────────────────────────────────────
    const totalCount = pagination?.total ?? designations.length;
    const activeCount = designations.filter(d => d.is_active).length;
    const avgLevel = designations.length
        ? (designations.reduce((s, d) => s + d.level, 0) / designations.length).toFixed(1)
        : "—";

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-black">Designations</h1>
                            <p className="text-slate-500 font-medium">
                                Manage job titles and hierarchy levels across the organisation.
                            </p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:opacity-80 transition text-sm font-semibold flex-shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add Designation
                        </button>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Total
                            </p>
                            <p className="text-3xl font-bold text-black">{totalCount}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Active
                            </p>
                            <p className="text-3xl font-bold text-black">{activeCount}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Avg Level
                            </p>
                            <p className="text-3xl font-bold text-black">{avgLevel}</p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative max-w-xs flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                                placeholder="Search by name or code..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                            />
                        </div>
                        <button
                            onClick={() => setSearch(searchInput)}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:opacity-80 transition"
                        >
                            Search
                        </button>
                        {search && (
                            <button
                                onClick={() => { setSearch(""); setSearchInput(""); }}
                                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                        <button
                            onClick={loadDesignations}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-500 hover:border-orange-300 transition ml-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Error banner */}
                    {error && !open && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Designation</th>
                                    <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Code</th>
                                    <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">Level</th>
                                    <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center text-slate-400 text-sm">
                                            No designations found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(desig => (
                                        <tr key={desig.designation_id} className="hover:bg-slate-50/60 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                        {desig.designation_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-black">{desig.designation_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                                    {desig.designation_code}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <LevelBadge level={desig.level} />
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${desig.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {desig.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openEdit(desig)}
                                                    className="text-sm font-semibold text-black underline hover:text-orange-500 transition"
                                                >
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
                        <div className="flex items-center justify-between text-sm text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
                            <span className="text-xs text-slate-500">
                                Showing {(pagination.current_page - 1) * pagination.per_page + 1}–
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={!pagination.has_previous}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-xs font-semibold">
                                    {pagination.current_page} / {pagination.total_pages}
                                </span>
                                <button
                                    disabled={!pagination.has_next}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7">
                        <div className="flex justify-between items-start mb-5">
                            <h2 className="text-xl font-bold text-black">
                                {selected ? "Edit Designation" : "Create Designation"}
                            </h2>
                            <div className="flex items-center gap-2">
                                {detail && (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                                        {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""}
                                    </span>
                                )}
                                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

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
                                <Field label="Designation Name *">
                                    <input
                                        value={form.designation_name}
                                        onChange={e => setForm({ ...form, designation_name: e.target.value })}
                                        placeholder="e.g. Senior Developer"
                                        className={inputCls}
                                        required
                                        maxLength={100}
                                    />
                                </Field>

                                <Field label="Designation Code *">
                                    <input
                                        value={form.designation_code}
                                        onChange={e => setForm({ ...form, designation_code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SR_DEV"
                                        className={`${inputCls} font-mono`}
                                        required
                                        maxLength={50}
                                    />
                                </Field>

                                <Field
                                    label="Hierarchy Level *"
                                    hint="Lower = higher seniority  (1 = CXO, 5 = Junior)"
                                >
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.level}
                                        onChange={e => setForm({ ...form, level: Number(e.target.value) })}
                                        className={inputCls}
                                        required
                                    />
                                </Field>

                                <Field label="Description (optional)">
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief role description…"
                                        rows={2}
                                        className={`${inputCls} resize-none`}
                                    />
                                </Field>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2.5 bg-black text-white rounded-xl hover:opacity-80 text-sm font-semibold disabled:opacity-50 transition flex items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        {submitting ? "Saving…" : selected ? "Save Changes" : "Create"}
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