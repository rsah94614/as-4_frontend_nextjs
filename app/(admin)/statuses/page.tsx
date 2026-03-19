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
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value.trimStart())}
              placeholder="Search by name or code…"
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Entity type filter dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EntityType | "")}
              className="border border-border rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium text-foreground"
            >
              <option value="">All Categories</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{ENTITY_META[t].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Add Status button */}
          <button
            onClick={() => setShowCreate(true)}
<<<<<<< Updated upstream
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#E31837" }}
=======
            className="ml-auto flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95 bg-primary"
>>>>>>> Stashed changes
          >
            <Plus size={13} />
            Add Status
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
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info size={13} className="text-destructive shrink-0" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">How It Works</span>
        </div>
        <ChevronDown size={15} className={cn("text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-gray-100 sm:divide-x">
            {HOW_IT_WORKS_STEPS.map((s) => (
              <div key={s.n} className="flex gap-3 px-4 sm:px-5 py-3 sm:py-4">
                <span className="text-[11px] font-black text-destructive w-6 shrink-0 tabular-nums pt-0.5">{s.n}</span>
                <div>
                  <p className="text-xs font-semibold text-primary mb-0.5">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
