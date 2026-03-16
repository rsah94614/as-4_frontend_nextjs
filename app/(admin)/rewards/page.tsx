"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, ChevronDown, X } from "lucide-react";

// 1. Swap fetchWithAuth for our Axios client builder
import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem, Pagination } from "@/types/reward-types";


// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";

// 2. Create the proxy client right here
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");

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
      // 3. Use the Axios client with relative paths!
      const [catRes, itemRes] = await Promise.all([
        rewardsClient.get(`/categories?active_only=false`),
        rewardsClient.get(`/catalog?active_only=${filterState === "active"}&page=${page}&size=12`),
      ]);

      // Axios automatically parses JSON into the .data property
      setCategories(catRes.data);
      setItems(itemRes.data.data);
      setPagination(itemRes.data.pagination);

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
  const filtered = useMemo(
    () =>
      items
        .filter((i) => {
          if (filterState === "active") return i.is_active;
          if (filterState === "inactive") return !i.is_active;
          return true;
        })
        .filter(
          (i) =>
            i.reward_name.toLowerCase().includes(search.toLowerCase()) ||
            i.reward_code.toLowerCase().includes(search.toLowerCase())
        ),
    [items, search, filterState]
  );

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

      {/* Red accent line */}
      <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

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
              {pagination && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                    {pagination.total} items
                  </span>
                </div>
              )}

              {/* Create button */}
              <button
                onClick={() => setModal("create")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#E31837" }}
              >
                <Plus size={13} />
                Build New Reward
              </button>
            </div>

            {/* ─── Grid / Empty / Error / Loading ─── */}
            <RewardGrid
              items={filtered}
              loading={loading}
              error={error}
              pagination={pagination}
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