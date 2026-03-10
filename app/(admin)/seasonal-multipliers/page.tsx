"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Plus, Edit2, Trash2, Loader2, X, Check,
  AlertCircle, Info, HelpCircle, Zap, Clock, Archive
} from "lucide-react";
import orgApiClient from "@/services/org-api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

const QUARTERS = [1, 2, 3, 4] as const;
type Quarter = (typeof QUARTERS)[number];

interface Multiplier {
  seasonal_multiplier_id: string;
  quarter: Quarter;
  label: string;
  multiplier: string;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
}

const emptyForm = {
  quarter: 1 as Quarter,
  label: "",
  multiplier: "",
  effective_from: "",
  effective_to: "",
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const Q_META: Record<Quarter, { label: string; months: string; pill: string; header: string; dot: string; accent: string }> = {
  1: { label: "Q1", months: "Jan – Mar", pill: "bg-sky-50 text-sky-700 border-sky-200",        header: "bg-sky-50/40 border-sky-100",        dot: "bg-sky-400",     accent: "text-sky-600" },
  2: { label: "Q2", months: "Apr – Jun", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", header: "bg-emerald-50/40 border-emerald-100", dot: "bg-emerald-400", accent: "text-emerald-600" },
  3: { label: "Q3", months: "Jul – Sep", pill: "bg-amber-50 text-amber-700 border-amber-200",  header: "bg-amber-50/40 border-amber-100",    dot: "bg-amber-400",   accent: "text-amber-600" },
  4: { label: "Q4", months: "Oct – Dec", pill: "bg-pink-50 text-pink-700 border-pink-200",    header: "bg-pink-50/40 border-pink-100",      dot: "bg-pink-400",    accent: "text-pink-600" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);

function getStatus(m: Multiplier): "active" | "upcoming" | "past" | "undated" {
  if (!m.effective_from || !m.effective_to) return "undated";
  const t = todayStr();
  if (m.effective_from <= t && t <= m.effective_to) return "active";
  if (m.effective_from > t) return "upcoming";
  return "past";
}

function StatusBadge({ m }: { m: Multiplier }) {
  const s = getStatus(m);
  if (s === "active")   return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"><Zap className="w-3 h-3" />Active now</span>;
  if (s === "upcoming") return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"><Clock className="w-3 h-3" />Upcoming</span>;
  if (s === "past")     return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg"><Archive className="w-3 h-3" />Past</span>;
  return <span className="text-xs text-gray-300 font-medium italic">No dates set</span>;
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// ─── Shared components ────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 mb-6">
      <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-700 leading-relaxed">{children}</p>
    </div>
  );
}

function FlashBanner({ type, msg, onDismiss }: { type: "success" | "error"; msg: string; onDismiss: () => void }) {
  const ok = type === "success";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm mb-6 ${ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
      {ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1 font-medium">{msg}</span>
      <button onClick={onDismiss} className="p-0.5 hover:opacity-60 transition-opacity"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition mt-0.5"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 transition placeholder-gray-300 text-gray-800";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
        {hint && (
          <span className="group relative cursor-default">
            <HelpCircle className="w-3 h-3 text-gray-300" />
            <span className="absolute left-5 top-0 z-10 w-56 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 hidden group-hover:block shadow-xl leading-relaxed">
              {hint}
            </span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonMultiplierRow({ index }: { index: number }) {
  return (
    <tr className="border-b border-gray-100 animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-7 w-16 bg-gray-100 rounded-lg" /></td>
      <td className="px-5 py-4 hidden md:table-cell"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 hidden md:table-cell"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-6 w-20 bg-gray-100 rounded-lg" /></td>
      <td className="px-5 py-4"><div className="h-7 w-16 bg-gray-100 rounded-xl ml-auto" /></td>
    </tr>
  );
}

function SkeletonSection({ index }: { index: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
         style={{ animationDelay: `${index * 100}ms` }}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded ml-2" />
        <div className="ml-auto h-6 w-10 bg-gray-100 rounded-full" />
      </div>
      <table className="w-full">
        <tbody>
          <SkeletonMultiplierRow index={0} />
          <SkeletonMultiplierRow index={1} />
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SeasonalMultipliersPage() {
  const [multipliers, setMultipliers]     = useState<Multiplier[]>([]);
  const [loading, setLoading]             = useState(true);
  const [flash, setFlash]                 = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filterQuarter, setFilterQuarter] = useState<Quarter | 0>(0);
  const [showCreate, setShowCreate]       = useState(false);
  const [form, setForm]                   = useState(emptyForm);
  const [editId, setEditId]               = useState<string | null>(null);
  const [editForm, setEditForm]           = useState({ label: "", multiplier: "", effective_from: "", effective_to: "" });
  const [saving, setSaving]               = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Multiplier | null>(null);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  const fetchMultipliers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filterQuarter) params.quarter = filterQuarter;
      const res = await orgApiClient.get<Multiplier[]>("/seasonal-multipliers", { params });
      setMultipliers(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      showFlash(apiError(e, "Could not load multipliers. Please refresh."), "error");
} finally {
      setLoading(false);
    }
  }, [filterQuarter]);

  useEffect(() => { fetchMultipliers(); }, [fetchMultipliers]);

  const handleCreate = async () => {
    if (!form.label.trim()) return showFlash("Please enter a label for this multiplier.", "error");
    if (!form.multiplier || isNaN(parseFloat(form.multiplier))) return showFlash("Please enter a valid multiplier value (e.g. 1.5).", "error");
    if (form.effective_from && form.effective_to && form.effective_from > form.effective_to)
      return showFlash("'Effective From' must be before 'Effective To'.", "error");
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        quarter: form.quarter,
        label: form.label,
        multiplier: parseFloat(form.multiplier),
      };
      if (form.effective_from) body.effective_from = form.effective_from;
      if (form.effective_to)   body.effective_to   = form.effective_to;
      await orgApiClient.post("/seasonal-multipliers", body);
      setShowCreate(false);
      setForm(emptyForm);
      showFlash("Multiplier created successfully.");
      fetchMultipliers();
    } catch (e: unknown) {
      showFlash(apiError(e, "Could not create multiplier. Dates may overlap with an existing entry."), "error");
} finally {
      setSaving(false);
    }
  };

  const startEdit = (m: Multiplier) => {
    setEditId(m.seasonal_multiplier_id);
    setEditForm({ label: m.label, multiplier: m.multiplier, effective_from: m.effective_from ?? "", effective_to: m.effective_to ?? "" });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.label.trim()) return showFlash("Label cannot be empty.", "error");
    if (editForm.effective_from && editForm.effective_to && editForm.effective_from > editForm.effective_to)
      return showFlash("'Effective From' must be before 'Effective To'.", "error");
    setSaving(true);
    try {
      const body: Record<string, unknown> = { label: editForm.label, multiplier: parseFloat(editForm.multiplier) };
      if (editForm.effective_from) body.effective_from = editForm.effective_from;
      if (editForm.effective_to)   body.effective_to   = editForm.effective_to;
      await orgApiClient.put(`/seasonal-multipliers/${id}`, body);
      setEditId(null);
      showFlash("Multiplier updated successfully.");
      fetchMultipliers();
    } catch (e: unknown) {
      showFlash(apiError(e, "Could not update. Check for overlapping date ranges."), "error");
} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await orgApiClient.delete(`/seasonal-multipliers/${id}`);
      setDeleteTarget(null);
      showFlash("Multiplier deleted.");
      fetchMultipliers();
   } catch (e: unknown) {
     setDeleteTarget(null);
     showFlash(apiError(e, "Only upcoming multipliers can be deleted."), "error");}
  };

  const visibleQuarters = (filterQuarter ? [filterQuarter] : QUARTERS) as Quarter[];
  const grouped = Object.fromEntries(QUARTERS.map(q => [q, multipliers.filter(m => m.quarter === q)])) as Record<Quarter, Multiplier[]>;
  const activeCount = multipliers.filter(m => getStatus(m) === "active").length;

  return (
    <PageShell>
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seasonal Multipliers</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${multipliers.length} multiplier${multipliers.length !== 1 ? "s" : ""}${activeCount > 0 ? ` · ${activeCount} active` : ""}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-pink-200 w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Multiplier
        </button>
      </div>

      {/* ── Admin info banner ── */}
      <InfoBanner>
        A <strong>seasonal multiplier</strong> boosts the points employees earn from reviews during a specific date range.
        For example, a <strong>×2.0</strong> multiplier means reviews during that period are worth double the usual points.
        Only <strong>one multiplier per quarter</strong> can be active at a time — dates must not overlap.
        Active and past multipliers <strong>cannot be deleted</strong>, only upcoming ones can.
      </InfoBanner>

      {flash && <FlashBanner type={flash.type} msg={flash.msg} onDismiss={() => setFlash(null)} />}

      {/* ── Quarter filter pills ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Quarter:</span>
        {([0, ...QUARTERS] as (Quarter | 0)[]).map(q => {
          const meta = q ? Q_META[q as Quarter] : null;
          return (
            <button key={q} onClick={() => setFilterQuarter(q)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterQuarter === q
                  ? meta ? `${meta.pill} border-current shadow-sm` : "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}>
              {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
              {q === 0 ? "All Quarters" : `${meta!.label} (${meta!.months})`}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="space-y-5">
        {loading
          ? QUARTERS.map((_, i) => <SkeletonSection key={i} index={i} />)
          : visibleQuarters.map(q => {
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
                    <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.pill}`}>
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="text-sm font-medium text-gray-400">No multipliers for {meta.label}</p>
                      <p className="text-xs text-gray-300 mt-1">Click &ldquo;Add Multiplier&rdquo; to create one for this quarter</p>
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
                              const isEditing = editId === m.seasonal_multiplier_id;
                              const status = getStatus(m);
                              return (
                                <tr key={m.seasonal_multiplier_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                  <td className="px-5 py-4">
                                    {isEditing
                                      ? <input autoFocus value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 w-full bg-pink-50/30" />
                                      : <span className="font-semibold text-gray-800">{m.label}</span>
                                    }
                                  </td>
                                  <td className="px-5 py-4">
                                    {isEditing
                                      ? <input type="number" step="0.01" min="0.01" value={editForm.multiplier}
                                          onChange={e => setEditForm(p => ({ ...p, multiplier: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 w-24 bg-pink-50/30" />
                                      : <span className={`inline-block text-sm font-bold px-2.5 py-1.5 rounded-lg border ${meta.pill}`}>
                                          ×{parseFloat(m.multiplier).toFixed(2)}
                                        </span>
                                    }
                                  </td>
                                  <td className="px-5 py-4 hidden md:table-cell">
                                    {isEditing
                                      ? <input type="date" value={editForm.effective_from} onChange={e => setEditForm(p => ({ ...p, effective_from: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                      : <span className="text-sm text-gray-600">{formatDate(m.effective_from)}</span>
                                    }
                                  </td>
                                  <td className="px-5 py-4 hidden md:table-cell">
                                    {isEditing
                                      ? <input type="date" value={editForm.effective_to} onChange={e => setEditForm(p => ({ ...p, effective_to: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                      : <span className="text-sm text-gray-600">{formatDate(m.effective_to)}</span>
                                    }
                                  </td>
                                  <td className="px-5 py-4"><StatusBadge m={m} /></td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2 justify-end">
                                      {isEditing ? (
                                        <>
                                          <button onClick={() => handleUpdate(m.seasonal_multiplier_id)} disabled={saving}
                                            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl disabled:opacity-50 font-semibold transition">
                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                          </button>
                                          <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition font-medium">
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                          <button onClick={() => startEdit(m)}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-600 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 px-3 py-1.5 rounded-xl transition font-medium">
                                            <Edit2 className="w-3 h-3" /> Edit
                                          </button>
                                          {status === "upcoming" && (
                                            <button onClick={() => setDeleteTarget(m)}
                                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition font-medium">
                                              <Trash2 className="w-3 h-3" />
                                            </button>
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
                          const isEditing = editId === m.seasonal_multiplier_id;
                          const status = getStatus(m);
                          return (
                            <div key={m.seasonal_multiplier_id} className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input autoFocus value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))}
                                        className="w-full border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" placeholder="Label" />
                                      <input type="number" step="0.01" value={editForm.multiplier} onChange={e => setEditForm(p => ({ ...p, multiplier: e.target.value }))}
                                        className="w-full border border-pink-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" placeholder="Multiplier (e.g. 1.5)" />
                                      <div className="grid grid-cols-2 gap-2">
                                        <input type="date" value={editForm.effective_from} onChange={e => setEditForm(p => ({ ...p, effective_from: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                        <input type="date" value={editForm.effective_to} onChange={e => setEditForm(p => ({ ...p, effective_to: e.target.value }))}
                                          className="border border-pink-300 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-pink-50/30" />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className="font-semibold text-gray-800 text-sm">{m.label}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${meta.pill}`}>×{parseFloat(m.multiplier).toFixed(2)}</span>
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
                                      <button onClick={() => handleUpdate(m.seasonal_multiplier_id)} disabled={saving}
                                        className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl disabled:opacity-50 font-semibold transition">
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                      </button>
                                      <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => startEdit(m)}
                                        className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl transition font-medium">
                                        <Edit2 className="w-3 h-3" /> Edit
                                      </button>
                                      {status === "upcoming" && (
                                        <button onClick={() => setDeleteTarget(m)}
                                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl transition">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
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

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal
          title="Add Seasonal Multiplier"
          subtitle="Boost review points during a specific period of the year."
          onClose={() => { setShowCreate(false); setForm(emptyForm); }}
        >
          <div className="space-y-4">
            <Field label="Quarter *" hint="Which quarter of the year does this multiplier apply to?">
              <select value={form.quarter} onChange={e => setForm(p => ({ ...p, quarter: Number(e.target.value) as Quarter }))} className={inputCls}>
                {QUARTERS.map(q => <option key={q} value={q}>{Q_META[q].label} — {Q_META[q].months}</option>)}
              </select>
            </Field>

            <Field label="Label *" hint="A short friendly name employees might see (e.g. 'Diwali Bonus', 'Year-End Boost').">
              <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Diwali Bonus" className={inputCls} maxLength={50} />
            </Field>

            <Field label="Multiplier Value *" hint="Enter a number. 1.0 = normal points, 1.5 = 50% bonus, 2.0 = double points.">
              <input type="number" step="0.01" min="0.01" value={form.multiplier}
                onChange={e => setForm(p => ({ ...p, multiplier: e.target.value }))}
                placeholder="e.g. 1.5" className={inputCls} />
              {form.multiplier && !isNaN(parseFloat(form.multiplier)) && (
                <p className="text-xs text-pink-600 font-medium mt-1.5">
                  Preview: a 5★ review (normally 50 pts) → <strong>{Math.round(50 * parseFloat(form.multiplier))} pts</strong>
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts On" hint="The first day this multiplier becomes active.">
                <input type="date" value={form.effective_from} onChange={e => setForm(p => ({ ...p, effective_from: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Ends On" hint="The last day this multiplier is active (inclusive).">
                <input type="date" value={form.effective_to} onChange={e => setForm(p => ({ ...p, effective_to: e.target.value }))} className={inputCls} />
              </Field>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 text-xs text-amber-700 leading-relaxed">
              ⚠ Dates cannot overlap with existing multipliers in the same quarter. Leave dates blank to create an undated draft.
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6 sm:justify-end pt-5 border-t border-gray-100">
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium text-center">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-xl disabled:opacity-50 font-semibold transition shadow-sm shadow-pink-200">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Creating…" : "Create Multiplier"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal
          title="Delete Multiplier?"
          subtitle="This action cannot be undone."
          onClose={() => setDeleteTarget(null)}
        >
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
            <p className="text-sm font-semibold text-red-800 mb-1">{deleteTarget.label}</p>
            <p className="text-xs text-red-600">
              ×{parseFloat(deleteTarget.multiplier).toFixed(2)} · {Q_META[deleteTarget.quarter].label} · {formatDate(deleteTarget.effective_from)} → {formatDate(deleteTarget.effective_to)}
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            You are about to permanently delete this upcoming multiplier. Employees will not receive the bonus points during this period.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end pt-4 border-t border-gray-100">
            <button onClick={() => setDeleteTarget(null)}
              className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium text-center">Cancel</button>
            <button onClick={() => handleDelete(deleteTarget.seasonal_multiplier_id)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition shadow-sm shadow-red-200">
              <Trash2 className="w-4 h-4" /> Yes, Delete It
            </button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}