"use client";

import { useState } from "react";
import { Tag, Plus, Check, AlertCircle, X, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


import { useReviewCategories } from "@/hooks/useReviewCategories";
import { ReviewCategory } from "@/types/review-category-types";
import { extractErrorMessage } from "@/lib/error-utils";

import { ReviewCategoryTable } from "@/components/features/admin/review-categories/ReviewCategoryTable";
import { ReviewCategoryModals } from "@/components/features/admin/review-categories/ReviewCategoryModal";
import { ReviewCategoryFilters } from "@/components/features/admin/review-categories/ReviewCategoryFilters";

// ─── HowItWorks ───────────────────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  { n: "01", title: "Create Category", desc: "Add a category with a unique code, name, and multiplier value greater than 0." },
  { n: "02", title: "Set Multiplier", desc: "The multiplier determines points awarded — e.g. 1.4× means 1.4 points per reviewer weight unit." },
  { n: "03", title: "Assign in Reviews", desc: "Employees select 1–5 categories per review. Points equal the sum of selected multipliers × reviewer weight." },
  { n: "04", title: "Manage Status", desc: "Deactivate a category to hide it from new reviews. Existing reviews are unaffected." },
];

function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info size={13} className="text-[#E31837] shrink-0" />
          <span className="text-[11px] font-bold text-[#004C8F] uppercase tracking-widest">How It Works</span>
        </div>
        <ChevronDown size={15} className={cn("text-gray-400 transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-gray-100 sm:divide-x">
            {HOW_IT_WORKS_STEPS.map((s) => (
              <div key={s.n} className="flex gap-3 px-4 sm:px-5 py-3 sm:py-4">
                <span className="text-[11px] font-black text-[#E31837] w-6 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                <div>
                  <p className="text-xs font-semibold text-[#004C8F] mb-0.5">{s.title}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type FilterValue = boolean | null;

interface EditForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
  is_active: boolean;
}

export default function ReviewCategoriesPage() {
  const [activeOnly, setActiveOnly] = useState<FilterValue>(null);

  const { categories, loading, error, createCategory, updateCategory } =
    useReviewCategories(activeOnly);

  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    category_code: "",
    category_name: "",
    multiplier: "",
    description: "",
    is_active: true,
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
    const description = String(form.description ?? "").trim() || undefined;

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
      showFlash(extractErrorMessage(e, "Could not create category. Code or name may already exist."), "error");
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
      multiplier: String(c.multiplier),
      description: c.description ?? "",
      is_active: c.is_active,
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
        multiplier: parseFloat(editForm.multiplier),
        description: editForm.description.trim() || undefined,
        is_active: editForm.is_active,
      });
      setEditId(null);
      showFlash("Category updated successfully.");
    } catch (e: unknown) {
      showFlash(extractErrorMessage(e, "Could not update. Code or name may conflict with an existing category."), "error");
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
      showFlash(extractErrorMessage(e, "Could not toggle category status."), "error");
    }
  };

  const activeCount = categories.filter(c => c.is_active).length;
  const inactiveCount = categories.filter(c => !c.is_active).length;

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-white">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div>
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



        {/* ── Main content ── */}
        <div className="px-8 md:px-10 py-8" style={{ background: "#F7F9FC" }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

              {/* ── How It Works ── */}
              <HowItWorks />

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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${flash.type === "success"
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

      {/* ── Create modal ── */}
      <ReviewCategoryModals
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
        onCreate={handleCreate}
        saving={saving}
      />
    </>
  );
}