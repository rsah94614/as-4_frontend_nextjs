"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, X, ChevronDown, Info } from "lucide-react";

import orgApiClient from "@/services/org-api-client";
import {
  Status,
  EntityType,
  ENTITY_TYPES,
  ENTITY_META,
} from "@/types/status-types";
import { extractErrorMessage } from "@/lib/error-utils";
// Modular Components
import {
  PageShell,
  PageHeader,
  ContentWrapper,
  StatusStats,
  FlashBanner,
} from "@/components/features/admin/statuses/UIHelpers";
import { StatusTable, type EditForm } from "@/components/features/admin/statuses/StatusTable";
import { StatusModal } from "@/components/features/admin/statuses/StatusModal";

export default function StatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<EntityType | "">("");
  const [search, setSearch] = useState("");
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
      showFlash(extractErrorMessage(e, "Could not load statuses. Please refresh."), "error");
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
      showFlash(extractErrorMessage(e, "Could not create status. Please try again."), "error");
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
      showFlash(extractErrorMessage(e, "Could not update status. Please try again."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Computed ─────────────────────────────────────────────────────────────
  const totalCount = statuses.length;
  const entityCounts = ENTITY_TYPES.map((t) => ({
    label: ENTITY_META[t].label,
    value: statuses.filter((s) => s.entity_type === t).length,
    color: ENTITY_META[t].dot,
  }));

  // Filter statuses by search text (name or code)
  const filteredStatuses = search.trim()
    ? statuses.filter(
      (s) =>
        s.status_name.toLowerCase().includes(search.toLowerCase()) ||
        s.status_code.toLowerCase().includes(search.toLowerCase())
    )
    : statuses;

  return (
    <PageShell>
      {/* ─── Page Header ─── */}
      <PageHeader
        title="Status Management"
        subtitle="Define and manage status labels for employees, reviews, transactions & rewards"
      />

      {/* ─── Content ─── */}
      <ContentWrapper>
        {/* Stats pills */}
        {!loading && totalCount > 0 && (
          <StatusStats
            stats={[
              { label: "Total", value: totalCount, color: "bg-[#004C8F]" },
              ...entityCounts,
            ]}
          />
        )}

        <InfoTooltip />

        {flash && (
          <FlashBanner
            type={flash.type}
            msg={flash.msg}
            onDismiss={() => setFlash(null)}
          />
        )}

        {/* ─── Toolbar ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Entity type filter dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EntityType | "")}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium text-gray-600"
            >
              <option value="">All Categories</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{ENTITY_META[t].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Add New Status button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#E31837" }}
          >
            <Plus size={13} />
            Add New Status
          </button>
        </div>

        {/* Table */}
        <StatusTable
          statuses={filteredStatuses}
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
      </ContentWrapper>

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

// ─── InfoTooltip ─────────────────────────────────────────────────────────────
function InfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center mb-6"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-7 h-7 rounded-full border flex items-center justify-center transition-all",
          open
            ? "bg-[#E8F1FA] border-[#C0D6EE]"
            : "bg-white border-gray-200 hover:bg-[#E8F1FA] hover:border-[#C0D6EE]"
        )}
        aria-label="What are statuses?"
      >
        <Info size={13} style={{ color: "#004C8F" }} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0
          w-80 bg-white border border-[#C0D6EE] rounded-xl p-3 shadow-md z-50
          pointer-events-none">
          {/* Arrow */}
          <div className="absolute -top-[5px] left-4 w-2 h-2
            bg-white border-l border-t border-[#C0D6EE] rotate-45" />
          <div className="flex gap-2 items-start">
            <Info size={13} className="mt-0.5 shrink-0" style={{ color: "#004C8F" }} />
            <p className="text-[12px] leading-relaxed text-gray-500 m-0">
              Statuses are labels that describe the current state of employees,
              reviews, transactions, and rewards. You can rename or describe a
              status, but the{" "}
              <strong className="font-semibold" style={{ color: "#004C8F" }}>
                Status Code
              </strong>{" "}
              is fixed after creation — it&apos;s used internally by the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}