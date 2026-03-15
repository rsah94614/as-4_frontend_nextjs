"use client";

import { useState } from "react";
import { Tag, Plus, Check, AlertCircle, X, Info, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import { useReviewCategories } from "@/hooks/useReviewCategories";
import { ReviewCategory } from "@/types/review-category-types";
import { extractApiError } from "@/lib/api-utils";

import { ReviewCategoryTable } from "@/components/features/admin/review-categories/ReviewCategoryTable";
import { ReviewCategoryModals } from "@/components/features/admin/review-categories/ReviewCategoryModal";
import { ReviewCategoryFilters } from "@/components/features/admin/review-categories/ReviewCategoryFilters";

type FilterValue = boolean | null;

interface EditForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
  is_active: boolean;
}

export default function ReviewCategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeOnly, setActiveOnly]   = useState<FilterValue>(null);

  const { categories, loading, error, createCategory, updateCategory } =
    useReviewCategories(activeOnly);

  const [flash, setFlash]           = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>({
    category_code: "",
    category_name: "",
    multiplier:    "",
    description:   "",
    is_active:     true,
  });
  const [saving, setSaving] = useState(false);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async (form: Record<string, unknown>) => {
    const category_code = String(form.category_code ?? "").trim();
    const category_name = String(form.category_name ?? "").trim();
    const multiplierVal = String(form.multiplier ?? "").trim();
    const description   = String(form.description ?? "").trim() || undefined;

    if (!category_code) return showFlash("Please enter a category code.", "error");
    if (!category_name) return showFlash("Please enter a category name.", "error");
    if (!multiplierVal || isNaN(parseFloat(multiplierVal)) || parseFloat(multiplierVal) <= 0)
      return showFlash("Please enter a valid multiplier greater than 0 (e.g. 1.4).", "error");

    setSaving(true);
    try {
      await createCategory({
        category_code,
        category_name,
        multiplier: parseFloat(multiplierVal),
        ...(description ? { description } : {}),
      });
      setShowCreate(false);
      showFlash("Category created successfully.");
    } catch (e: unknown) {
      showFlash(extractApiError(e, "Could not create category. Code or name may already exist."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const startEdit = (c: ReviewCategory) => {
    setEditId(c.category_id);
    setEditForm({
      category_code: c.category_code,
      category_name: c.category_name,
      multiplier:    String(c.multiplier),
      description:   c.description ?? "",
      is_active:     c.is_active,
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.category_code.trim()) return showFlash("Category code cannot be empty.", "error");
    if (!editForm.category_name.trim()) return showFlash("Category name cannot be empty.", "error");
    if (!editForm.multiplier || isNaN(parseFloat(editForm.multiplier)) || parseFloat(editForm.multiplier) <= 0)
      return showFlash("Please enter a valid multiplier greater than 0.", "error");

    setSaving(true);
    try {
      await updateCategory(id, {
        category_code: editForm.category_code.trim(),
        category_name: editForm.category_name.trim(),
        multiplier:    parseFloat(editForm.multiplier),
        description:   editForm.description.trim() || undefined,
        is_active:     editForm.is_active,
      });
      setEditId(null);
      showFlash("Category updated successfully.");
    } catch (e: unknown) {
      showFlash(extractApiError(e, "Could not update. Code or name may conflict with an existing category."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────────────
  const handleToggleActive = async (c: ReviewCategory) => {
    try {
      await updateCategory(c.category_id, { is_active: !c.is_active });
      showFlash(`Category ${!c.is_active ? "activated" : "deactivated"} successfully.`);
    } catch (e: unknown) {
      showFlash(extractApiError(e, "Could not toggle category status."), "error");
    }
  };

  const activeCount   = categories.filter(c => c.is_active).length;
  const inactiveCount = categories.filter(c => !c.is_active).length;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-white">

          {/* ── Page Header ── */}
          <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
              <div>
                <Link
                  href="/control-panel"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all duration-150 mb-3 group"
                >
                  <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
                  Back to Control Panel
                </Link>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E31837" }}>
                  Admin · Control Panel
                </p>
                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                  Review Categories
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage category tags · Set point multipliers · Activate or deactivate
                </p>
              </div>
              <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                <span style={{ color: "#E31837" }}>A</span>
                <span style={{ color: "#004C8F" }}>abhar</span>
              </span>
            </div>
          </div>

          {/* Red accent line */}
          <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

          {/* ── Main content ── */}
          <div className="px-8 md:px-10 py-8" style={{ background: "#F7F9FC" }}>
            <div className="max-w-[1200px] mx-auto">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                {/* ── Info banner ── */}
                <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 mb-6">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Each <strong>review category</strong> carries a <strong>multiplier</strong> that
                    determines how many points a reviewer awards. Employees can select{" "}
                    <strong>1–5 categories</strong> per review — points ={" "}
                    <strong>sum of selected multipliers × reviewer weight</strong>. Changing a
                    multiplier only affects <strong>future</strong> reviews; existing ones are unaffected.
                  </p>
                </div>

                {/* ── Toolbar: filters + add button ── */}
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                  <ReviewCategoryFilters activeOnly={activeOnly} onFilterChange={setActiveOnly} />

                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all duration-150"
                    style={{ background: "#E31837" }}
                  >
                    <Plus className="w-4 h-4" />
                    New Category
                  </button>
                </div>

                {/* ── Flash ── */}
                {flash && (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${
                      flash.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    {flash.type === "success"
                      ? <Check className="w-4 h-4 shrink-0" />
                      : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span className="flex-1 font-medium">{flash.msg}</span>
                    <button onClick={() => setFlash(null)} className="p-0.5 hover:opacity-60 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* ── API error ── */}
                {error && !flash && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-5 text-center font-medium">
                    {error}
                  </div>
                )}

                {/* ── Section header ── */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" style={{ color: "#004C8F" }} />
                    <span className="font-semibold text-sm" style={{ color: "#004C8F" }}>
                      Review Categories
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {loading
                      ? "Loading…"
                      : `${categories.length} total${activeCount > 0 ? ` · ${activeCount} active` : ""}${inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ""}`}
                  </span>
                </div>

                {/* ── Table ── */}
                <ReviewCategoryTable
                  categories={categories}
                  loading={loading}
                  onEdit={startEdit}
                  onToggleActive={handleToggleActive}
                  editingId={editId}
                  editForm={editForm}
                  onUpdate={handleUpdate}
                  onCancelEdit={() => setEditId(null)}
                  onEditFormChange={(field, val) => setEditForm(p => ({ ...p, [field]: val }))}
                  saving={saving}
                />

              </div>
            </div>
          </div>

        </main>
      </div>

      {/* ── Create modal ── */}
      <ReviewCategoryModals
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
        onCreate={handleCreate}
        saving={saving}
      />
    </div>
  );
}