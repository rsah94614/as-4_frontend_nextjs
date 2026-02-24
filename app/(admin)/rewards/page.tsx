"use client";
import React, { useState, useEffect, useCallback } from "react";
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
function Badge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
      borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
      background: active ? "#d1fae5" : "#fee2e2",
      color: active ? "#065f46" : "#991b1b",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#10b981" : "#ef4444", display: "inline-block" }} />
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const low = stock > 0 && stock <= 5;
  const bg = stock === 0 ? "#fee2e2" : low ? "#fef3c7" : "#eff6ff";
  const color = stock === 0 ? "#991b1b" : low ? "#92400e" : "#1e40af";
  return (
    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>
      {stock === 0 ? "OUT OF STOCK" : low ? `LOW (${stock})` : `${stock} in stock`}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560,
        boxShadow: "0 25px 60px -10px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9", borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", fontSize: 18, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
  borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, letterSpacing: "0.05em",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", disabled = false, style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "outline"; disabled?: boolean; style?: React.CSSProperties;
}) {
  const variants = {
    primary: { background: "#6366f1", color: "#fff", border: "none" },
    ghost: { background: "#f8fafc", color: "#475569", border: "1.5px solid #e2e8f0" },
    outline: { background: "transparent", color: "#6366f1", border: "1.5px solid #6366f1" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
      ...variants[variant], ...style,
    }}>{children}</button>
  );
}

// ─── Reward Form (Create / Edit) ──────────────────────────────────────────────
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
  ) =>
    setForm(f => ({
      ...f,
      [k]: e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.type === "number"
        ? Number(e.target.value)
        : e.target.value,
    }));

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const url = isEdit
        ? `${API}/v1/rewards/catalog/${item!.catalog_id}`
        : `${API}/v1/rewards/catalog`;
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? {
            reward_name: form.reward_name,
            description: form.description,
            default_points: form.default_points,
            min_points: form.min_points,
            max_points: form.max_points,
            is_active: form.is_active,
          }
        : {
            reward_name: form.reward_name,
            reward_code: form.reward_code,
            description: form.description,
            category_id: form.category_id,
            default_points: form.default_points,
            min_points: form.min_points,
            max_points: form.max_points,
            available_stock: form.available_stock,
          };

      const r = await fetchWithAuth(url, { method, body: JSON.stringify(body) });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(Array.isArray(d.detail) ? d.detail.map((e: any) => e.msg).join(", ") : d.detail ?? "Request failed");
      }
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {!isEdit && (
        <>
          <Field label="REWARD CODE">
            <input style={inputStyle} value={form.reward_code} onChange={set("reward_code")} placeholder="e.g. REW-AMZ-50" />
          </Field>
          <Field label="CATEGORY">
            <select style={inputStyle} value={form.category_id} onChange={set("category_id")}>
              <option value="">Select category…</option>
              {categories.filter(c => c.is_active).map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </Field>
        </>
      )}
      <Field label="REWARD NAME">
        <input style={inputStyle} value={form.reward_name} onChange={set("reward_name")} placeholder="e.g. Amazon Gift Card $50" />
      </Field>
      <Field label="DESCRIPTION">
        <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Optional…" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="DEFAULT PTS"><input type="number" style={inputStyle} value={form.default_points} onChange={set("default_points")} /></Field>
        <Field label="MIN PTS"><input type="number" style={inputStyle} value={form.min_points} onChange={set("min_points")} /></Field>
        <Field label="MAX PTS"><input type="number" style={inputStyle} value={form.max_points} onChange={set("max_points")} /></Field>
      </div>
      {!isEdit && (
        <Field label="INITIAL STOCK">
          <input type="number" style={inputStyle} value={form.available_stock} min={0} onChange={set("available_stock")} />
        </Field>
      )}
      {isEdit && (
        <Field label="STATUS">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 14, color: "#475569" }}>Active</span>
          </label>
        </Field>
      )}
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
      const r = await fetchWithAuth(`${API}/v1/rewards/catalog/${item.catalog_id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.detail ?? "Request failed");
      }
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>
        Adding stock to <strong style={{ color: "#0f172a" }}>{item.reward_name}</strong>.{" "}
        Current: <strong>{item.available_stock}</strong>
      </p>
      <Field label="UNITS TO ADD">
        <input type="number" style={inputStyle} value={amount} min={1}
          onChange={e => setAmount(Math.max(1, Number(e.target.value)))} />
      </Field>
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#475569", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>New stock level</span>
        <strong style={{ color: "#6366f1", fontSize: 18 }}>{item.available_stock + amount}</strong>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? "Restocking…" : "Add Stock"}</Btn>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 20, height: 240 }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      {[60, 80, 100, 50].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 20 : 13, width: `${w}%`, borderRadius: 6, marginBottom: 12,
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite",
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
      if (itemR.ok) {
        const d = await itemR.json();
        setItems(d.data);
        setPagination(d.pagination);
      } else {
        setError("Failed to load catalog. Check your connection or permissions.");
      }
    } catch (e: any) {
      setError(e.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [page, activeOnly]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    i.reward_name.toLowerCase().includes(search.toLowerCase()) ||
    i.reward_code.toLowerCase().includes(search.toLowerCase())
  );

  const close = () => { setModal(null); setSelected(undefined); };
  const saved = () => { close(); load(); };

return (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎁</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Reward Catalog</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Manage all reward items</p>
            </div>
          </div>
          <Btn onClick={() => setModal("create")}>＋ New Reward</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search by name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 280, flex: "1 1 200px" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={activeOnly} onChange={e => { setActiveOnly(e.target.checked); setPage(1); }} style={{ width: 15, height: 15 }} />
            Active only
          </label>
          {pagination && (
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
              {pagination.total} items · page {pagination.current_page}/{pagination.total_pages}
            </span>
          )}
        </div>

        {/* Error Banner */}
        {error && !loading && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#991b1b", fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <Btn variant="ghost" onClick={load} style={{ padding: "4px 12px", fontSize: 12 }}>Retry</Btn>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
            <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>No rewards found</p>
            <p style={{ margin: "4px 0 16px", fontSize: 13 }}>Try a different search or create a new reward</p>
            <Btn onClick={() => setModal("create")}>＋ New Reward</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {filtered.map(item => (
              <div key={item.catalog_id} style={{
                background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0",
                padding: 20, display: "flex", flexDirection: "column", gap: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em" }}>{item.reward_code}</p>
                    <h3 style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.reward_name}</h3>
                  </div>
                  <Badge active={item.is_active} />
                </div>
                {item.description && (
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {(["Default", "Min", "Max"] as const).map((label, idx) => {
                    const val = [item.default_points, item.min_points, item.max_points][idx];
                    return (
                      <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#6366f1" }}>{val.toLocaleString()}</p>
                        <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>pts</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StockBadge stock={item.available_stock} />
                  {item.category && (
                    <span style={{ fontSize: 11, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                      {item.category.category_name}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: "1px solid #f1f5f9" }}>
                  <Btn variant="ghost" onClick={() => { setSelected(item); setModal("edit"); }} style={{ flex: 1, justifyContent: "center" }}>✏️ Edit</Btn>
                  <Btn variant="outline" onClick={() => { setSelected(item); setModal("restock"); }} style={{ flex: 1, justifyContent: "center" }}>📦 Stock</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
            <Btn variant="ghost" onClick={() => setPage(p => p - 1)} disabled={!pagination.has_previous}>← Prev</Btn>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 36, height: 36, borderRadius: 8, border: "1.5px solid",
                borderColor: p === page ? "#6366f1" : "#e2e8f0",
                background: p === page ? "#6366f1" : "#fff",
                color: p === page ? "#fff" : "#475569",
                cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit",
              }}>{p}</button>
            ))}
            <Btn variant="ghost" onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next}>Next →</Btn>
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