"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

// ── Create Modal ──────────────────────────────────────────────────────────────

interface CreateForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
}

interface ReviewCategoryModalsProps {
  showCreate: boolean;
  onCloseCreate: () => void;
  onCreate: (form: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}

export function ReviewCategoryModals({
  showCreate,
  onCloseCreate,
  onCreate,
  saving,
}: ReviewCategoryModalsProps) {
  const [form, setForm] = useState<CreateForm>({
    category_code: "",
    category_name: "",
    multiplier: "",
    description: "",
  });

  const handleSubmit = async () => {
    await onCreate({
      category_code: form.category_code,
      category_name: form.category_name,
      multiplier: form.multiplier,
      description: form.description,
    });
    // Reset on success (parent closes modal)
    setForm({ category_code: "", category_name: "", multiplier: "", description: "" });
  };

  const handleClose = () => {
    setForm({ category_code: "", category_name: "", multiplier: "", description: "" });
    onCloseCreate();
  };

  if (!showCreate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">New Review Category</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Category Code <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase font-mono"
              placeholder="e.g. INNOVATION"
              value={form.category_code}
              onChange={e => setForm(p => ({ ...p, category_code: e.target.value.toUpperCase() }))}
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1">Unique short code — auto-uppercased.</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. Innovation"
              value={form.category_name}
              onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))}
              maxLength={100}
            />
          </div>

          {/* Multiplier */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Multiplier <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.1"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. 1.4"
              value={form.multiplier}
              onChange={e => setForm(p => ({ ...p, multiplier: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              Points = sum of selected multipliers × reviewer weight.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Description <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={2}
              placeholder="e.g. Recognises creative problem-solving and novel ideas"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              maxLength={500}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2" style={{ background: "#E31837" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
}