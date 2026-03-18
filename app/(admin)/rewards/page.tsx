"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, ChevronDown, X } from "lucide-react";

import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem, Pagination } from "@/types/reward-types";
import { fetchAdminCatalog, fetchAdminCategories } from "@/services/rewards-service";

// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";

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

  // ─── Data Fetching ────────────────────────────────────────────────────────
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
    load();
  };

  return (
    <main className="flex-1 overflow-y-auto bg-white">

      {/* ─── Page Header (matches Employee page) ─── */}
      <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
              Reward Catalog
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create and manage individual items in your reward list
            </p>
          </div>
          <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
            <span style={{ color: "#E31837" }}>A</span>
            <span style={{ color: "#004C8F" }}>abhar</span>
          </span>
        </div>
      </div>



      {/* ─── Content Area ─── */}
      <div className="px-8 md:px-10 py-8" style={{ background: "#F7F9FC" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

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

              {/* Filter tabs */}
              <div className="relative">
                <select
                  value={filterState}
                  onChange={(e) => {
                    setFilterState(e.target.value as "all" | "active" | "inactive");
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#004C8F]/10 focus:border-[#004C8F]/40 font-medium text-gray-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Item count */}
              {displayPagination && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                    {displayPagination.total} items
                  </span>
                </div>
              )}

              <button
                onClick={() => setModal("create")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-[#004C8F]"
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