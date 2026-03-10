"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus } from "lucide-react";
import orgApiClient from "@/services/org-api-client";
import {
  Status,
  EntityType,
  ENTITY_TYPES,
  ENTITY_META,
} from "@/types/status-types";
import { Button } from "@/components/ui/button";

// Modular Components
import { PageShell, InfoBanner, FlashBanner } from "@/components/features/admin/statuses/UIHelpers";
import { StatusTable, type EditForm } from "@/components/features/admin/statuses/StatusTable";
import { StatusModal } from "@/components/features/admin/statuses/StatusModal";

export default function StatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<EntityType | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ status_name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.entity_type = filterType;
      const res = await orgApiClient.get<Status[]>("/statuses", { params });
      setStatuses(Array.isArray(res.data) ? res.data : []);
   } catch (e: unknown) {
     showFlash(apiError(e, "Could not load statuses. Please refresh."), "error");
} finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCreate = async (form: {
    status_code: string;
    status_name: string;
    description: string;
    entity_type: EntityType;
  }) => {
    if (!form.status_code.trim()) return showFlash("Please enter a status code.", "error");
    if (!form.status_name.trim()) return showFlash("Please enter a status name.", "error");
    setSaving(true);
    try {
      await orgApiClient.post("/statuses", form);
      setShowCreate(false);
      showFlash("Status created successfully.");
      fetchStatuses();
   } catch (e: unknown) {
     showFlash(apiError(e, "Could not create status. Please try again."), "error");
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
   } catch (e: unknown) {
     showFlash(apiError(e, "Could not update status. Please try again."), "error");
     } finally {
      setSaving(false);
    }
  };

  const totalCount = statuses.length;

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Statuses
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading
                ? "Loading…"
                : `${totalCount} status${totalCount !== 1 ? "es" : ""} across 4 categories`}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 h-11 shadow-sm shadow-amber-200 gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Status
        </Button>
      </div>

      {/* Info banner */}
      <InfoBanner>
        Statuses are labels that describe the current state of employees, reviews,
        transactions, and rewards. You can rename or describe a status, but the{" "}
        <strong>Status Code</strong> is fixed after creation — it&apos;s used
        internally by the system.
      </InfoBanner>

      {flash && (
        <FlashBanner
          type={flash.type}
          msg={flash.msg}
          onDismiss={() => setFlash(null)}
        />
      )}

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        {(["", ...ENTITY_TYPES] as (EntityType | "")[]).map((t) => {
          const meta = t ? ENTITY_META[t as EntityType] : null;
          const active = filterType === t;
          return (
            <button
              key={t || "all"}
              onClick={() => setFilterType(t as EntityType | "")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active
                  ? meta
                    ? `${meta.pill} border-current shadow-sm`
                    : "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                }`}
            >
              {meta && (
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              )}
              {meta ? meta.label : "All Categories"}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <StatusTable
        statuses={statuses}
        loading={loading}
        filterType={filterType}
        editId={editId}
        editForm={editForm}
        saving={saving}
        onEdit={startEdit}
        onUpdate={handleUpdate}
        onCancelEdit={() => setEditId(null)}
        onEditFormChange={(field, val) =>
          setEditForm((p) => ({ ...p, [field]: val }))
        }
      />

      {/* Create Modal */}
      <StatusModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        saving={saving}
      />
    </PageShell>
  );
}