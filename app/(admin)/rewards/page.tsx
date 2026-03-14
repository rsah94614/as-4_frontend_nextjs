"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, LayoutGrid,ArrowUpRight } from "lucide-react";

// 1. Swap fetchWithAuth for our Axios client builder
import { createAuthenticatedClient } from "@/lib/api-utils";
import { Category, RewardItem, Pagination } from "@/types/reward-types";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";

// 2. Create the proxy client right here
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");

export default function RewardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      setError(e instanceof Error ? e.message : "Failed to load catalog. Check your connection.");
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="h-[6px] shrink-0" style={{ background: '#a11027' }} />

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scroll-smooth">
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#004C8F] rounded-xl flex items-center justify-center shadow-xl shadow-blue-100/50 group hover:rotate-6 transition-transform duration-500">
                  <LayoutGrid className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h1 className="text-5xl font-semibold tracking-tighter text-slate-900 leading-none">
                    Reward <span className="text-[#004C8F]">Catalog</span>
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-600 mt-2 uppercase tracking-wider">
                    Create and Manage individual items in your reward list
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setModal("create")}
              className="h-16 px-10 bg-[#004C8F] text-white rounded-xl text-xs font-semibold tracking-wider shadow-xl shadow-blue-100 hover:bg-[#003d73] transition-all hover:-translate-y-1 active:scale-95 group uppercase flex items-center gap-3 overflow-hidden border-none"
            >
              <Plus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Build New Reward
              <ArrowUpRight className="w-4 h-4 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </Button>
          </div>
            {/* Toolbar */}
            <div className="flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="relative max-w-xs flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#004C8F] transition-colors pointer-events-none z-10" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code…"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white shadow-sm transition-all"
                />
              </div>

              <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm h-11 w-full lg:max-w-max transition-all">
                {(["all", "active", "inactive"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setFilterState(filter);
                        setPage(1);
                      }}
                      className={`px-6 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-300 flex-1 whitespace-nowrap text-center ${
                        filterState === filter
                          ? "bg-slate-100 text-[#004C8F] shadow-inner"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {filter === "all" ? "All" : filter}
                    </button>
                ))}
              </div>

              {pagination && (
                <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{pagination.total} items</span>
                  <span className="text-slate-300">·</span>
                  <span>
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                </div>
              )}


            </div>

            {/* Grid / Empty / Error / Loading */}
            <div className="animate-in fade-in duration-700 delay-200">
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
      </div>
    </div>
  );
}