"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";

import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem, Pagination } from "@/types/reward-types";
import { fetchAdminCatalog, fetchAdminCategories } from "@/services/rewards-service";

// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { AdminPageHeader } from "@/components/features/admin/AdminControlPanelPageHeader";

export default function RewardsPage() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [filterState, setFilterState] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<null | "create" | "edit" | "restock">(null);
  const [selected, setSelected] = useState<RewardItem | undefined>();

  const [globalStats, setGlobalStats] = useState({ total: 0, active: 0, inactive: 0 });

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const [all, active] = await Promise.all([
        fetchAdminCatalog({ page: 1, size: 1 }),
        fetchAdminCatalog({ page: 1, size: 1, active_only: true })
      ]);
      setGlobalStats({
        total: all.pagination?.total || 0,
        active: active.pagination?.total || 0,
        inactive: (all.pagination?.total || 0) - (active.pagination?.total || 0)
      });
    } catch (e) {
      console.error("Failed to load global stats", e);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const isInactive = filterState === "inactive";
      const fetchPage = isInactive ? 1 : page; // Fetch page 1 always for inactive bulk
      const fetchSize = isInactive ? 1000 : 12; // Fetch max items to filter inactive locally

      const [cats, catalog] = await Promise.all([
        fetchAdminCategories(),
        fetchAdminCatalog({
          page: fetchPage,
          size: fetchSize,
          active_only: filterState === "active" ? true : undefined
        }),
      ]);

      setCategories(cats as Category[]);
      setItems(catalog.data as unknown as RewardItem[]);
      setPagination(catalog.pagination as Pagination);

    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to load catalog. Check your connection."));
    } finally {
      setLoading(false);
    }
  }, [page, filterState]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Filtering ────────────────────────────────────────────────────────────
  const isInactive = filterState === "inactive";

  const displayItems = useMemo(() => {
    let result = items;
    if (isInactive) result = result.filter((i) => !i.is_active);
    else if (filterState === "active") result = result.filter((i) => i.is_active);

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.reward_name.toLowerCase().includes(lowerSearch) ||
          i.reward_code.toLowerCase().includes(lowerSearch)
      );
    }

    if (isInactive) {
      // Local pagination for inactive
      return result.slice((page - 1) * 12, page * 12);
    }
    return result;
  }, [items, search, filterState, page, isInactive]);

  const displayPagination = useMemo(() => {
    if (isInactive) {
      let result = items.filter((i) => !i.is_active);
      if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(
          (i) =>
            i.reward_name.toLowerCase().includes(lowerSearch) ||
            i.reward_code.toLowerCase().includes(lowerSearch)
        );
      }
      const total = result.length;
      const total_pages = Math.ceil(total / 12) || 1;
      return {
        current_page: page,
        per_page: 12,
        total: total,
        total_pages: total_pages,
        has_next: page < total_pages,
        has_previous: page > 1,
      };
    }
    return pagination;
  }, [items, search, page, isInactive, pagination]);

  // ─── Modal Helpers ────────────────────────────────────────────────────────
  const close = () => {
    setModal(null);
    setSelected(undefined);
  };
  const saved = () => {
    close();
    loadStats();
    load();
  };

  return (
    <main className="flex-1 overflow-y-auto flex flex-col bg-white">

      {/* ─── Page Header ─── */}
      <AdminPageHeader
        title="Reward Catalog"
        subtitle="Create and manage individual items in your reward list"
      />



      {/* ─── Content Area ─── */}
      <div className="flex-1 px-8 md:px-10 py-8 flex flex-col" style={{ background: "#F7F9FC" }}>
        <div className="w-full mx-auto flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

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

              {/* Filter tabs */}
              <RewardStats
                total={globalStats.total}
                active={globalStats.active}
                inactive={globalStats.inactive}
                filterState={filterState}
                setFilterState={(v: "all" | "active" | "inactive") => {
                  setFilterState(v);
                  setPage(1);
                }}
              />

              <button
                onClick={() => setModal("create")}
                className="ml-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95 bg-primary"
              >
                <Plus size={13} />
                Add Reward
              </button>
            </div>

            {/* ─── Grid / Empty / Error / Loading ─── */}
            <RewardGrid
              items={displayItems}
              loading={loading}
              error={error}
              pagination={displayPagination}
              page={page}
              setPage={setPage}
              onRetry={load}
              onEdit={(item) => {
                setSelected(item);
                setModal("edit");
              }}
              onRestock={(item) => {
                setSelected(item);
                setModal("restock");
              }}
              onCreateNew={() => setModal("create")}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RewardModal
        isOpen={modal === "create"}
        categories={categories}
        onClose={close}
        onSave={saved}
      />
      <RewardModal
        isOpen={modal === "edit" && !!selected}
        item={selected}
        categories={categories}
        onClose={close}
        onSave={saved}
      />
      {selected && (
        <RestockModal
          isOpen={modal === "restock"}
          item={selected}
          onClose={close}
          onSave={saved}
        />
      )}
    </main>
  );
}