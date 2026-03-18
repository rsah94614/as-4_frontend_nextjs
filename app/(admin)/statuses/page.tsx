"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, X, ChevronDown, Info } from "lucide-react";
import { fetchStatuses, createStatus, updateStatus } from "@/services/org-service";
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
  const loadStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStatuses(filterType || undefined);
      setStatuses(data);
    } catch (e: unknown) {
      showFlash(extractErrorMessage(e, "Could not load statuses. Please refresh."), "error");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

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
      await createStatus(form);
      setShowCreate(false);
      showFlash("Status created successfully.");
      loadStatuses();
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
      await updateStatus(statusId, editForm);
      setEditId(null);
      showFlash("Status updated successfully.");
      loadStatuses();
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
        {/* {!loading && totalCount > 0 && (
          <StatusStats
            stats={[
              { label: "Total", value: totalCount, color: "bg-[#004C8F]" },
              ...entityCounts,
            ]}
          />
        )} */}

        <HowItWorks />

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

// ─── HowItWorks ───────────────────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  { n: "01", title: "Create Status", desc: "Add a status with a unique code, name, entity type, and optional description." },
  { n: "02", title: "Status Code is Fixed", desc: "The code is set at creation and cannot be changed — it is used internally by the system." },
  { n: "03", title: "Assign to Entities", desc: "Statuses are applied to employees, reviews, transactions, and rewards to describe their current state." },
  { n: "04", title: "Edit or Deactivate", desc: "You can rename or update the description of a status at any time via the inline edit." },
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
