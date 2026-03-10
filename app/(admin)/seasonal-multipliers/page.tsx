"use client";

import { useState } from "react";
import { TrendingUp, Plus, Check, AlertCircle, X, Info } from "lucide-react";
import { useMultipliers } from "@/hooks/useMultipliers";
import { Multiplier, Quarter } from "@/types/multiplier-types";
import { getStatus } from "@/components/features/admin/multipliers/UIHelpers";
import { Button } from "@/components/ui/button";

// Modular Components
import { MultiplierTable } from "@/components/features/admin/multipliers/MultiplierTable";
import { MultiplierModals } from "@/components/features/admin/multipliers/MultiplierModal";
import { MultiplierFilters } from "@/components/features/admin/multipliers/MultiplierFilters";

export default function SeasonalMultipliersPage() {
  const [filterQuarter, setFilterQuarter] = useState<Quarter | 0>(0);
  const {
    multipliers,
    loading,
    error,
    createMultiplier,
    updateMultiplier,
    deleteMultiplier,
  } = useMultipliers(filterQuarter);

  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", multiplier: "", effective_from: "", effective_to: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Multiplier | null>(null);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  const handleCreate = async (form: Record<string, unknown>) => {
    const label = (form.label as string || "").trim();
    const multiplierVal = form.multiplier as string;
    const effectiveFrom = form.effective_from as string;
    const effectiveTo = form.effective_to as string;

    if (!label) return showFlash("Please enter a label for this multiplier.", "error");
    if (!multiplierVal || isNaN(parseFloat(multiplierVal))) return showFlash("Please enter a valid multiplier value (e.g. 1.5).", "error");
    if (effectiveFrom && effectiveTo && effectiveFrom > effectiveTo)
      return showFlash("'Effective From' must be before 'Effective To'.", "error");

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        quarter: form.quarter,
        label: label,
        multiplier: parseFloat(multiplierVal),
      };
      if (effectiveFrom) body.effective_from = effectiveFrom;
      if (effectiveTo) body.effective_to = effectiveTo;

      await createMultiplier(body);
      setShowCreate(false);
      showFlash("Multiplier created successfully.");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showFlash(detail ?? "Could not create multiplier. Dates may overlap.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m: Multiplier) => {
    setEditId(m.seasonal_multiplier_id);
    setEditForm({
      label: m.label,
      multiplier: m.multiplier,
      effective_from: m.effective_from ?? "",
      effective_to: m.effective_to ?? ""
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.label.trim()) return showFlash("Label cannot be empty.", "error");
    if (editForm.effective_from && editForm.effective_to && editForm.effective_from > editForm.effective_to)
      return showFlash("'Effective From' must be before 'Effective To'.", "error");

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        label: editForm.label,
        multiplier: parseFloat(editForm.multiplier)
      };
      if (editForm.effective_from) body.effective_from = editForm.effective_from;
      if (editForm.effective_to) body.effective_to = editForm.effective_to;

      await updateMultiplier(id, body);
      setEditId(null);
      showFlash("Multiplier updated successfully.");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showFlash(detail ?? "Could not update. Check for overlaps.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteMultiplier(id);
      setDeleteTarget(null);
      showFlash("Multiplier deleted.");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setDeleteTarget(null);
      showFlash(detail ?? "Only upcoming multipliers can be deleted.", "error");
    }
  };

  const activeCount = multipliers.filter(m => getStatus(m) === "active").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-5 h-11 shadow-sm shadow-pink-200"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Multiplier
          </Button>
        </div>

        {/* ── Admin info banner ── */}
        <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 mb-6">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 leading-relaxed">
            A <strong>seasonal multiplier</strong> boosts the points employees earn from reviews during a specific date range.
            Only <strong>one multiplier per quarter</strong> can be active at a time — dates must not overlap.
          </p>
        </div>

        {flash && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm mb-6 ${flash.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {flash.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1 font-medium">{flash.msg}</span>
            <button onClick={() => setFlash(null)} className="p-0.5 hover:opacity-60 transition-opacity"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ── Quarter filter pills ── */}
        <MultiplierFilters
          filterQuarter={filterQuarter}
          onFilterChange={setFilterQuarter}
        />

        {/* ── Table & Content ── */}
        {error && !flash && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <MultiplierTable
          multipliers={multipliers}
          loading={loading}
          filterQuarter={filterQuarter}
          onEdit={startEdit}
          onDelete={setDeleteTarget}
          editingId={editId}
          editForm={editForm}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditId(null)}
          onEditFormChange={(field, val) => setEditForm(p => ({ ...p, [field]: val }))}
          saving={saving}
        />

        {/* ── Modals ── */}
        <MultiplierModals
          showCreate={showCreate}
          onCloseCreate={() => setShowCreate(false)}
          onCreate={handleCreate}
          saving={saving}
          deleteTarget={deleteTarget}
          onCloseDelete={() => setDeleteTarget(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
}