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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
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

// ─── Category Form (Create / Edit) ────────────────────────────────────────────
function CategoryForm({ category, onSave, onClose }: {
  category?: Category; onSave: () => void; onClose: () => void;
}) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    category_name: category?.category_name ?? "",
    category_code: category?.category_code ?? "",
    description: category?.description ?? "",
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setForm(f => ({
      ...f,
      [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
    }));

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const url = isEdit
        ? `${API}/v1/rewards/categories/${category!.category_id}`
        : `${API}/v1/rewards/categories`;
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { category_name: form.category_name, description: form.description, is_active: form.is_active }
        : { category_name: form.category_name, category_code: form.category_code, description: form.description };

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
        <Field label="CATEGORY CODE">
          <input style={inputStyle} value={form.category_code} onChange={set("category_code")} placeholder="e.g. CAT-GIFT" />
        </Field>
      )}
      <Field label="CATEGORY NAME">
        <input style={inputStyle} value={form.category_name} onChange={set("category_name")} placeholder="e.g. Gift Cards" />
      </Field>
      <Field label="DESCRIPTION">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={form.description}
          onChange={set("description")}
          placeholder="Optional description…"
        />
      </Field>
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
        <Btn onClick={submit} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update Category" : "Create Category"}
        </Btn>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      {[40, 20, 50, 15, 15].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{
            height: 13, width: `${w}%`, borderRadius: 6,
            background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
            backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [selected, setSelected] = useState<Category | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetchWithAuth(`${API}/v1/rewards/categories?active_only=${activeOnly}`);
      if (r.ok) {
        setCategories(await r.json());
      } else {
        setError("Failed to load categories. Check your connection or permissions.");
      }
    } catch (e: any) {
      setError(e.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { load(); }, [load]);

  const filtered = categories.filter(c =>
    c.category_name.toLowerCase().includes(search.toLowerCase()) ||
    c.category_code.toLowerCase().includes(search.toLowerCase())
  );

  const close = () => { setModal(null); setSelected(undefined); };
  const saved = () => { close(); load(); };

  const activeCount = categories.filter(c => c.is_active).length;

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
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🗂️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Reward Categories</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Manage reward category groups</p>
            </div>
          </div>
          <Btn onClick={() => setModal("create")}>＋ New Category</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        {/* Stats Bar */}
        {!loading && categories.length > 0 && (
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total", value: categories.length, color: "#6366f1", bg: "#eff6ff" },
              { label: "Active", value: activeCount, color: "#059669", bg: "#d1fae5" },
              { label: "Inactive", value: categories.length - activeCount, color: "#dc2626", bg: "#fee2e2" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 20px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 13, color: "#64748b" }}>{s.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search by name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 280, flex: "1 1 200px" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} style={{ width: 15, height: 15 }} />
            Active only
          </label>
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
            {filtered.length} {filtered.length === 1 ? "category" : "categories"}
          </span>
        </div>

        {/* Error Banner */}
        {error && !loading && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#991b1b", fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <Btn variant="ghost" onClick={load} style={{ padding: "4px 12px", fontSize: 12 }}>Retry</Btn>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc" }}>
                {["Category", "Code", "Description", "Status", "Created", ""].map((h, i) => (
                  <th key={i} style={{
                    padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                    color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🗂️</div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>No categories found</p>
                    <p style={{ margin: "4px 0 16px", fontSize: 13 }}>Try a different search or create a new category</p>
                    <Btn onClick={() => setModal("create")}>＋ New Category</Btn>
                  </td>
                </tr>
              ) : (
                filtered.map((cat, idx) => (
                  <tr key={cat.category_id} style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{cat.category_name}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 6 }}>
                        {cat.category_code}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 300 }}>
                      <span style={{ fontSize: 13, color: "#64748b", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {cat.description || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No description</span>}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge active={cat.is_active} />
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(cat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Btn variant="ghost" onClick={() => { setSelected(cat); setModal("edit"); }} style={{ padding: "5px 12px", fontSize: 12 }}>
                        ✏️ Edit
                      </Btn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Create New Category" onClose={close}>
          <CategoryForm onSave={saved} onClose={close} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Edit Category" onClose={close}>
          <CategoryForm category={selected} onSave={saved} onClose={close} />
        </Modal>
      )}

       </main>
    </div>
  </div>
)};