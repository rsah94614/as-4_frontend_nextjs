"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Pencil, RefreshCw, AlertCircle,
  Search, ChevronLeft, ChevronRight, Tag, LayoutGrid,
  CheckCircle2, XCircle, Archive
} from "lucide-react";
import { fetchWithAuth } from "@/services/auth-service";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  category_id: string;
  category_name: string;
  category_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface RewardItem {
  catalog_id: string;
  reward_name: string;
  reward_code: string;
  description?: string;
  default_points: number;
  min_points: number;
  max_points: number;
  is_active: boolean;
  created_at: string;
  stock_status: string;
  available_stock: number;
  category?: { category_id: string; category_name: string; category_code: string };
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

const API = process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006";

// ─── Primitives ───────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 6, fontSize: 11,
      fontWeight: 600, letterSpacing: "0.04em",
      background: active ? "#f0fdf4" : "#fef2f2",
      color: active ? "#15803d" : "#b91c1c",
      border: `1px solid ${active ? "#bbf7d0" : "#fecaca"}`,
    }}>
      {active
        ? <CheckCircle2 size={11} strokeWidth={2.5} />
        : <XCircle size={11} strokeWidth={2.5} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const low = stock > 0 && stock <= 5;
  const config = stock === 0
    ? { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "Out of stock" }
    : low
      ? { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: `Low stock · ${stock}` }
      : { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe", label: `${stock} in stock` };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: config.bg, color: config.color,
      border: `1px solid ${config.border}`,
    }}>
      {config.label}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "100%", maxWidth: 540,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "22px 28px", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: "1px solid #f1f5f9",
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9", borderRadius: 7, width: 30, height: 30,
            cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  border: "1.5px solid #e2e8f0", borderRadius: 8,
  fontSize: 13.5, color: "#0f172a", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  background: "#fff", transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600,
  color: "#64748b", marginBottom: 5, letterSpacing: "0.05em",
  textTransform: "uppercase",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", disabled = false, style = {}, icon }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "outline"; disabled?: boolean;
  style?: React.CSSProperties; icon?: React.ReactNode;
}) {
  const vars: Record<string, React.CSSProperties> = {
    primary: { background: "#7c3aed", color: "#fff", border: "1.5px solid #7c3aed" },
    ghost: { background: "#f8fafc", color: "#475569", border: "1.5px solid #e2e8f0" },
    outline: { background: "transparent", color: "#7c3aed", border: "1.5px solid #7c3aed" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "inherit", transition: "opacity 0.15s",
      ...vars[variant], ...style,
    }}>{icon}{children}</button>
  );
}

// ─── Reward Form ──────────────────────────────────────────────────────────────
function RewardForm({ item, categories, onSave, onClose }: {
  item?: RewardItem; categories: Category[]; onSave: () => void; onClose: () => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    reward_name: item?.reward_name ?? "",
    reward_code: item?.reward_code ?? "",
    description: item?.description ?? "",
    category_id: item?.category?.category_id ?? "",
    default_points: item?.default_points ?? 100,
    min_points: item?.min_points ?? 50,
    max_points: item?.max_points ?? 500,
    available_stock: item?.available_stock ?? 0,
    is_active: item?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({
    ...f,
    [k]: e.target.type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : e.target.type === "number" ? Number(e.target.value) : e.target.value,
  }));

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const url = isEdit
        ? `${API}/v1/rewards/catalog/${item!.catalog_id}`
        : `${API}/v1/rewards/catalog`;
      const body = isEdit
        ? { reward_name: form.reward_name, description: form.description, default_points: form.default_points, min_points: form.min_points, max_points: form.max_points, is_active: form.is_active }
        : { reward_name: form.reward_name, reward_code: form.reward_code, description: form.description, category_id: form.category_id, default_points: form.default_points, min_points: form.min_points, max_points: form.max_points, available_stock: form.available_stock };
      const r = await fetchWithAuth(url, { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(body) });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(Array.isArray(d.detail) ? d.detail.map((e: { msg?: string }) => e.msg).join(", ") : d.detail ?? "Request failed");
      }
      onSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally { setSaving(false); }
  };

  return (
    <>
      {!isEdit && (
        <>
          <Field label="Reward Code">
            <input style={inputStyle} value={form.reward_code} onChange={set("reward_code")} placeholder="e.g. REW-AMZ-50" />
          </Field>
          <Field label="Category">
            <select style={inputStyle} value={form.category_id} onChange={set("category_id")}>
              <option value="">Select category…</option>
              {categories.filter(c => c.is_active).map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </Field>
        </>
      )}
      <Field label="Reward Name">
        <input style={inputStyle} value={form.reward_name} onChange={set("reward_name")} placeholder="e.g. Amazon Gift Card $50" />
      </Field>
      <Field label="Description">
        <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Optional description…" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Default pts"><input type="number" style={inputStyle} value={form.default_points} onChange={set("default_points")} /></Field>
        <Field label="Min pts"><input type="number" style={inputStyle} value={form.min_points} onChange={set("min_points")} /></Field>
        <Field label="Max pts"><input type="number" style={inputStyle} value={form.max_points} onChange={set("max_points")} /></Field>
      </div>
      {!isEdit && (
        <Field label="Initial Stock">
          <input type="number" style={inputStyle} value={form.available_stock} min={0} onChange={set("available_stock")} />
        </Field>
      )}
      {isEdit && (
        <Field label="Status">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} style={{ width: 15, height: 15 }} />
            <span style={{ fontSize: 13.5, color: "#475569" }}>Active</span>
          </label>
        </Field>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
          <AlertCircle size={14} color="#dc2626" />
          <span style={{ color: "#b91c1c", fontSize: 13 }}>{error}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? "Saving…" : isEdit ? "Update Reward" : "Create Reward"}</Btn>
      </div>
    </>
  );
}

// ─── Restock Form ─────────────────────────────────────────────────────────────
function RestockForm({ item, onSave, onClose }: { item: RewardItem; onSave: () => void; onClose: () => void }) {
  const [amount, setAmount] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const r = await fetchWithAuth(`${API}/v1/rewards/catalog/${item.catalog_id}/stock`, { method: "PATCH", body: JSON.stringify({ amount }) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.detail ?? "Request failed"); }
      onSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally { setSaving(false); }
  };

  return (
    <>
      <p style={{ color: "#64748b", fontSize: 13.5, marginTop: 0, lineHeight: 1.6 }}>
        Adding stock to <strong style={{ color: "#0f172a" }}>{item.reward_name}</strong>.{" "}
        Current stock: <strong style={{ color: "#7c3aed" }}>{item.available_stock}</strong>
      </p>
      <Field label="Units to Add">
        <input type="number" style={inputStyle} value={amount} min={1}
          onChange={e => setAmount(Math.max(1, Number(e.target.value)))} />
      </Field>
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
        padding: "14px 18px", marginBottom: 18,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>New stock level</span>
        <strong style={{ color: "#7c3aed", fontSize: 22, fontWeight: 700 }}>{item.available_stock + amount}</strong>
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
          <AlertCircle size={14} color="#dc2626" />
          <span style={{ color: "#b91c1c", fontSize: 13 }}>{error}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving} icon={<Archive size={14} />}>
          {saving ? "Restocking…" : "Add Stock"}
        </Btn>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e2e8f0", padding: 20 }}>
      <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
      {[55, 85, 100, 65, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 18 : 12, width: `${w}%`, borderRadius: 5, marginBottom: 14,
          background: "linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%)",
          backgroundSize: "1200px 100%", animation: "shimmer 1.5s infinite linear",
        }} />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RewardsPage() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<null | "create" | "edit" | "restock">(null);
  const [selected, setSelected] = useState<RewardItem | undefined>();

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [catR, itemR] = await Promise.all([
        fetchWithAuth(`${API}/v1/rewards/categories?active_only=false`),
        fetchWithAuth(`${API}/v1/rewards/catalog?active_only=${activeOnly}&page=${page}&size=12`),
      ]);
      if (catR.ok) setCategories(await catR.json());
      if (itemR.ok) { const d = await itemR.json(); setItems(d.data); setPagination(d.pagination); }
      else setError("Failed to load catalog. Check your connection or permissions.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally { setLoading(false); }
  }, [page, activeOnly]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    i.reward_name.toLowerCase().includes(search.toLowerCase()) ||
    i.reward_code.toLowerCase().includes(search.toLowerCase())
  );

  const close = () => { setModal(null); setSelected(undefined); };
  const saved = () => { close(); load(); };

  // Page number range
  const getPages = (total: number, current: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {/* Page Header */}
          <div style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            padding: "32px 32px 28px",
          }}>
            <div style={{
              maxWidth: 1280, margin: "0 auto",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Reward Catalog</h1>
                <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#64748b" }}>Manage all reward items and stock levels.</p>
              </div>
              <button
                onClick={() => setModal("create")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "11px 22px", borderRadius: 999,
                  background: "#0f172a", color: "#fff", border: "none",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                Add Reward
              </button>
            </div>
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>

            {/* Toolbar */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 24,
              flexWrap: "wrap", alignItems: "center",
            }}>
              <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
                <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  placeholder="Search by name or code…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" checked={activeOnly} onChange={e => { setActiveOnly(e.target.checked); setPage(1); }} style={{ width: 14, height: 14, accentColor: "#7c3aed" }} />
                Active only
              </label>
              {pagination && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12.5 }}>
                  <LayoutGrid size={13} />
                  <span>{pagination.total} items</span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <span>Page {pagination.current_page} of {pagination.total_pages}</span>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && !loading && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "12px 18px", marginBottom: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b91c1c", fontSize: 13.5 }}>
                  <AlertCircle size={15} />
                  {error}
                </div>
                <Btn variant="ghost" onClick={load} style={{ padding: "5px 12px", fontSize: 12 }} icon={<RefreshCw size={12} />}>
                  Retry
                </Btn>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 32px",
                background: "#fff", borderRadius: 14,
                border: "1.5px solid #e2e8f0",
              }}>
                <div style={{
                  width: 52, height: 52, background: "#f5f3ff",
                  borderRadius: 14, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Package size={24} color="#7c3aed" strokeWidth={1.5} />
                </div>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0f172a", fontSize: 15 }}>No rewards found</p>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8" }}>Try adjusting your search or create a new reward</p>
                <Btn onClick={() => setModal("create")} icon={<Plus size={14} />}>New Reward</Btn>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {filtered.map(item => (
                  <div key={item.catalog_id} style={{
                    background: "#fff", borderRadius: 12,
                    border: "1.5px solid #e2e8f0", padding: 20,
                    display: "flex", flexDirection: "column", gap: 14,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)")}
                  >
                    {/* Title Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <Tag size={11} color="#94a3b8" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em" }}>{item.reward_code}</span>
                        </div>
                        <h3 style={{
                          margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{item.reward_name}</h3>
                      </div>
                      <StatusBadge active={item.is_active} />
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p style={{
                        margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.55,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>{item.description}</p>
                    )}

                    {/* Points Grid */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                      background: "#f8fafc", borderRadius: 9, padding: 12,
                    }}>
                      {(["Default", "Min", "Max"] as const).map((label, idx) => {
                        const val = [item.default_points, item.min_points, item.max_points][idx];
                        return (
                          <div key={label} style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
                            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#7c3aed" }}>{val.toLocaleString()}</p>
                            <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>pts</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <StockBadge stock={item.available_stock} />
                      {item.category && (
                        <span style={{
                          fontSize: 11, color: "#5b21b6",
                          background: "#f5f3ff", padding: "3px 9px",
                          borderRadius: 6, fontWeight: 600,
                          border: "1px solid #ddd6fe",
                        }}>{item.category.category_name}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex", gap: 8, paddingTop: 12,
                      borderTop: "1px solid #f1f5f9",
                    }}>
                      <Btn
                        variant="ghost"
                        onClick={() => { setSelected(item); setModal("edit"); }}
                        style={{ flex: 1, justifyContent: "center" }}
                        icon={<Pencil size={13} />}
                      >Edit</Btn>
                      <Btn
                        variant="outline"
                        onClick={() => { setSelected(item); setModal("restock"); }}
                        style={{ flex: 1, justifyContent: "center" }}
                        icon={<Archive size={13} />}
                      >Restock</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 32 }}>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.has_previous}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "7px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    background: "#fff", cursor: pagination.has_previous ? "pointer" : "not-allowed",
                    opacity: pagination.has_previous ? 1 : 0.4, fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600, color: "#475569",
                  }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                {getPages(pagination.total_pages, page).map((p, idx) =>
                  p === "..." ? (
                    <span key={`e${idx}`} style={{ padding: "0 4px", color: "#94a3b8", fontSize: 14 }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p as number)} style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: "1.5px solid",
                      borderColor: p === page ? "#7c3aed" : "#e2e8f0",
                      background: p === page ? "#7c3aed" : "#fff",
                      color: p === page ? "#fff" : "#475569",
                      cursor: "pointer", fontWeight: 600,
                      fontSize: 13, fontFamily: "inherit",
                    }}>{p}</button>
                  )
                )}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.has_next}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "7px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    background: "#fff", cursor: pagination.has_next ? "pointer" : "not-allowed",
                    opacity: pagination.has_next ? 1 : 0.4, fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600, color: "#475569",
                  }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Modals */}
          {modal === "create" && (
            <Modal title="Create New Reward" onClose={close}>
              <RewardForm categories={categories} onSave={saved} onClose={close} />
            </Modal>
          )}
          {modal === "edit" && selected && (
            <Modal title="Edit Reward" onClose={close}>
              <RewardForm item={selected} categories={categories} onSave={saved} onClose={close} />
            </Modal>
          )}
          {modal === "restock" && selected && (
            <Modal title="Add Stock" onClose={close}>
              <RestockForm item={selected} onSave={saved} onClose={close} />
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
}