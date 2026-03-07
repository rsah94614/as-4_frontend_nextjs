"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Edit2, Loader2, X, Check, AlertCircle, Info, HelpCircle } from "lucide-react";
import orgApiClient from "@/services/org-api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["EMPLOYEE", "REVIEW", "TRANSACTION", "REWARD"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];

interface Status {
  status_id: string;
  status_code: string;
  status_name: string;
  description?: string;
  entity_type: string;
  created_at: string;
  updated_at?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const ENTITY_META: Record<EntityType, {
  label: string;
  description: string;
  pill: string;
  header: string;
  dot: string;
  ring: string;
}> = {
  EMPLOYEE:    {
    label: "Employee",
    description: "Statuses that describe an employee's current state (e.g. Active, On Leave, Terminated).",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    header: "bg-blue-50/50 border-blue-100",
    dot: "bg-blue-400", ring: "ring-blue-200",
  },
  REVIEW:      {
    label: "Review",
    description: "Statuses assigned to peer reviews (e.g. Pending, Approved, Flagged).",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    header: "bg-violet-50/50 border-violet-100",
    dot: "bg-violet-400", ring: "ring-violet-200",
  },
  TRANSACTION: {
    label: "Transaction",
    description: "Statuses for point transactions and transfers (e.g. Completed, Reversed).",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    header: "bg-amber-50/50 border-amber-100",
    dot: "bg-amber-400", ring: "ring-amber-200",
  },
  REWARD:      {
    label: "Reward",
    description: "Statuses for redeemable rewards (e.g. Available, Out of Stock, Discontinued).",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    header: "bg-emerald-50/50 border-emerald-100",
    dot: "bg-emerald-400", ring: "ring-emerald-200",
  },
};

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

const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition placeholder-gray-300 text-gray-800";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
        {hint && (
          <span className="group relative cursor-default">
            <HelpCircle className="w-3 h-3 text-gray-300" />
            <span className="absolute left-5 top-0 z-10 w-52 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 hidden group-hover:block shadow-xl leading-relaxed">
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

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-5 py-4"><div className="h-6 w-20 bg-gray-100 rounded-lg" /></td>
      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-4 w-48 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-7 w-7 bg-gray-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

function SkeletonSection({ index }: { index: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
         style={{ animationDelay: `${index * 80}ms` }}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="ml-auto h-4 w-16 bg-gray-100 rounded" />
      </div>
      <table className="w-full">
        <tbody>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatusesPage() {
  const [statuses, setStatuses]     = useState<Status[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState<EntityType | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editForm, setEditForm]     = useState({ status_name: "", description: "" });
  const [form, setForm]             = useState({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" as EntityType });
  const [saving, setSaving]         = useState(false);
  const [flash, setFlash]           = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.entity_type = filterType;
      const res = await orgApiClient.get<Status[]>("/statuses", { params });
      setStatuses(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      showFlash(e?.response?.status === 401 ? "Your session expired. Please log in again." : "Could not load statuses. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchStatuses(); }, [fetchStatuses]);

  const handleCreate = async () => {
    if (!form.status_code.trim()) return showFlash("Please enter a status code.", "error");
    if (!form.status_name.trim()) return showFlash("Please enter a status name.", "error");
    setSaving(true);
    try {
      await orgApiClient.post("/statuses", form);
      setShowCreate(false);
      setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
      showFlash("Status created successfully.");
      fetchStatuses();
    } catch (e: any) {
      showFlash(e?.response?.data?.detail ?? "Could not create status. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s: Status) => {
    setEditId(s.status_id);
    setEditForm({ status_name: s.status_name, description: s.description ?? "" });
  };

  const handleUpdate = async (statusId: string) => {
    if (!editForm.status_name.trim()) return showFlash("Status name cannot be empty.", "error");
    setSaving(true);
    try {
      await orgApiClient.put(`/statuses/${statusId}`, editForm);
      setEditId(null);
      showFlash("Status updated successfully.");
      fetchStatuses();
    } catch (e: any) {
      showFlash(e?.response?.data?.detail ?? "Could not update status. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const visibleTypes = (filterType ? [filterType] : ENTITY_TYPES) as EntityType[];
  const grouped = Object.fromEntries(
    ENTITY_TYPES.map(t => [t, statuses.filter(s => s.entity_type === t)])
  ) as Record<EntityType, Status[]>;
  const totalCount = statuses.length;

  return (
    <PageShell>
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Statuses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${totalCount} status${totalCount !== 1 ? "es" : ""} across 4 categories`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-amber-200 w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Status
        </button>
      </div>

      {/* ── Admin info banner ── */}
      <InfoBanner>
        Statuses are labels that describe the current state of employees, reviews, transactions, and rewards.
        You can rename or describe a status, but the <strong>Status Code</strong> is fixed after creation — it&apos;s used internally by the system.
      </InfoBanner>

      {flash && <FlashBanner type={flash.type} msg={flash.msg} onDismiss={() => setFlash(null)} />}

      {/* ── Filter pills ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
        {(["", ...ENTITY_TYPES] as (EntityType | "")[]).map(t => {
          const meta = t ? ENTITY_META[t as EntityType] : null;
          const active = filterType === t;
          return (
            <button
              key={t || "all"}
              onClick={() => setFilterType(t as EntityType | "")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? meta ? `${meta.pill} border-current shadow-sm` : "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
              {meta ? meta.label : "All Categories"}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="space-y-5">
        {loading
          ? ENTITY_TYPES.map((_, i) => <SkeletonSection key={i} index={i} />)
          : visibleTypes.map(type => {
              const meta = ENTITY_META[type];
              const items = grouped[type] ?? [];
              return (
                <div key={type} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Section header */}
                  <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${meta.header}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                    <div>
                      <span className="text-sm font-bold text-gray-800">{meta.label} Statuses</span>
                      <span className="text-xs text-gray-400 ml-2 font-normal hidden sm:inline">{meta.description}</span>
                    </div>
                    <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.pill}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Mobile: description below header */}
                  <div className={`sm:hidden px-5 py-2.5 text-xs text-gray-500 border-b ${meta.header}`}>
                    {meta.description}
                  </div>

                  {items.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="text-sm font-medium text-gray-400">No {meta.label.toLowerCase()} statuses yet</p>
                      <p className="text-xs text-gray-300 mt-1">Click &ldquo;Add New Status&rdquo; to create one</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden sm:block">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/40">
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-40">Code</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-56">Display Name</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                              <th className="px-5 py-3 w-32" />
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(status => (
                              <tr key={status.status_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                <td className="px-5 py-4">
                                  <span className={`font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border ${meta.pill}`}>
                                    {status.status_code}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  {editId === status.status_id
                                    ? <input autoFocus value={editForm.status_name}
                                        onChange={e => setEditForm(p => ({ ...p, status_name: e.target.value }))}
                                        className="border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 w-full bg-amber-50/30" />
                                    : <span className="font-semibold text-gray-800">{status.status_name}</span>
                                  }
                                </td>
                                <td className="px-5 py-4">
                                  {editId === status.status_id
                                    ? <input value={editForm.description}
                                        onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                        className="border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 w-full bg-amber-50/30"
                                        placeholder="Optional description" />
                                    : <span className="text-gray-400 text-sm">{status.description || <span className="italic text-gray-300">No description</span>}</span>
                                  }
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 justify-end">
                                    {editId === status.status_id ? (
                                      <>
                                        <button onClick={() => handleUpdate(status.status_id)} disabled={saving}
                                          className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl disabled:opacity-50 font-semibold transition">
                                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                        </button>
                                        <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition font-medium">
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button onClick={() => startEdit(status)}
                                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 px-3 py-1.5 rounded-xl transition font-medium">
                                        <Edit2 className="w-3 h-3" /> Edit
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="sm:hidden divide-y divide-gray-100">
                        {items.map(status => (
                          <div key={status.status_id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.pill} inline-block mb-2`}>
                                  {status.status_code}
                                </span>
                                {editId === status.status_id ? (
                                  <div className="space-y-2">
                                    <input autoFocus value={editForm.status_name}
                                      onChange={e => setEditForm(p => ({ ...p, status_name: e.target.value }))}
                                      className="w-full border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-amber-50/30" />
                                    <input value={editForm.description}
                                      onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                      placeholder="Description (optional)"
                                      className="w-full border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-amber-50/30" />
                                  </div>
                                ) : (
                                  <>
                                    <p className="font-semibold text-gray-800 text-sm">{status.status_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{status.description || <span className="italic">No description</span>}</p>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                                {editId === status.status_id ? (
                                  <>
                                    <button onClick={() => handleUpdate(status.status_id)} disabled={saving}
                                      className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl disabled:opacity-50 font-semibold transition">
                                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                    </button>
                                    <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => startEdit(status)}
                                    className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl transition font-medium">
                                    <Edit2 className="w-3 h-3" /> Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
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
          title="Add New Status"
          subtitle="Create a status label that can be assigned to employees, reviews, transactions, or rewards."
          onClose={() => { setShowCreate(false); setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" }); }}
        >
          <div className="space-y-4">
            <Field
              label="Category *"
              hint="Which area of the system will this status be used for?"
            >
              <select value={form.entity_type}
                onChange={e => setForm(p => ({ ...p, entity_type: e.target.value as EntityType }))}
                className={inputCls}>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{ENTITY_META[t].label}</option>)}
              </select>
            </Field>

            <Field
              label="Status Code *"
              hint="A short unique identifier. Use ALL_CAPS with underscores (e.g. ON_LEAVE). Cannot be changed after creation."
            >
              <input value={form.status_code}
                onChange={e => setForm(p => ({ ...p, status_code: e.target.value.toUpperCase().replace(/\s/g, "_") }))}
                className={inputCls} placeholder="e.g. ON_LEAVE" maxLength={50} />
              <p className="text-xs text-gray-400 mt-1.5">⚠ This code is permanent and used by the system internally. Choose carefully.</p>
            </Field>

            <Field
              label="Display Name *"
              hint="The human-readable name shown to employees and managers in the app."
            >
              <input value={form.status_name}
                onChange={e => setForm(p => ({ ...p, status_name: e.target.value }))}
                className={inputCls} placeholder="e.g. On Leave" maxLength={100} />
            </Field>

            <Field
              label="Description"
              hint="Optional. Helps admins understand when to apply this status."
            >
              <textarea value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className={`${inputCls} resize-none`} rows={2}
                placeholder="e.g. Employee is temporarily on approved leave." />
            </Field>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6 sm:justify-end pt-5 border-t border-gray-100">
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium text-center">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-50 font-semibold transition shadow-sm shadow-amber-200">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Creating…" : "Create Status"}
            </button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}