"use client";

import { Pencil, X, Check, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { ReviewCategory } from "@/types/review-category-types";

interface EditForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
  is_active: boolean;
}

interface Props {
  categories: ReviewCategory[];
  loading: boolean;
  onEdit: (c: ReviewCategory) => void;
  onToggleActive: (c: ReviewCategory) => void;
  editingId: string | null;
  editForm: EditForm;
  onUpdate: (id: string) => void;
  onCancelEdit: () => void;
  onEditFormChange: (field: keyof EditForm, val: string | boolean) => void;
  saving: boolean;
}

export function ReviewCategoryTable({
  categories,
  loading,
  onEdit,
  onToggleActive,
  editingId,
  editForm,
  onUpdate,
  onCancelEdit,
  onEditFormChange,
  saving,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm font-medium">No categories found</p>
        <p className="text-xs mt-1">Add one using the button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Code</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Multiplier</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Description</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.map(c =>
            editingId === c.category_id ? (
              <tr key={c.category_id} className="bg-blue-50/30">
                {/* Code */}
                <td className="px-5 py-3">
                  <input
                    className="w-28 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white uppercase"
                    value={editForm.category_code}
                    onChange={e => onEditFormChange("category_code", e.target.value.toUpperCase())}
                  />
                </td>
                {/* Name */}
                <td className="px-5 py-3">
                  <input
                    className="w-40 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.category_name}
                    onChange={e => onEditFormChange("category_name", e.target.value)}
                  />
                </td>
                {/* Multiplier */}
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    className="w-24 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.multiplier}
                    onChange={e => onEditFormChange("multiplier", e.target.value)}
                  />
                </td>
                {/* Description */}
                <td className="px-5 py-3 hidden md:table-cell">
                  <input
                    className="w-48 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.description}
                    placeholder="Optional"
                    onChange={e => onEditFormChange("description", e.target.value)}
                  />
                </td>
                {/* Status toggle */}
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onEditFormChange("is_active", !editForm.is_active)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      editForm.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {editForm.is_active ? (
                      <ToggleRight className="w-3.5 h-3.5" />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {editForm.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onUpdate(c.category_id)}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all" style={{ background: "#E31837" }}
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={c.category_id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Code */}
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                    {c.category_code}
                  </span>
                </td>
                {/* Name */}
                <td className="px-5 py-3.5 font-medium text-gray-800">{c.category_name}</td>
                {/* Multiplier */}
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-gray-900">×{Number(c.multiplier).toFixed(1)}</span>
                </td>
                {/* Description */}
                <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell max-w-xs truncate">
                  {c.description ?? <span className="italic text-gray-300">—</span>}
                </td>
                {/* Status */}
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onToggleActive(c)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      c.is_active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    title={c.is_active ? "Click to deactivate" : "Click to activate"}
                  >
                    {c.is_active ? (
                      <ToggleRight className="w-3.5 h-3.5" />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 text-gray-400 hover:text-[#004C8F] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}