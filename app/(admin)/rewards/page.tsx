"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, LayoutGrid, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/services/auth-service";
import { Category, RewardItem, Pagination } from "@/types/reward-types";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";

const API = process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "http://localhost:8006";

export default function RewardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(false);
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
      const [catR, itemR] = await Promise.all([
        fetchWithAuth(`${API}/v1/rewards/categories?active_only=false`),
        fetchWithAuth(`${API}/v1/rewards/catalog?active_only=${activeOnly}&page=${page}&size=12`),
      ]);
      if (catR.ok) setCategories(await catR.json());
      if (itemR.ok) {
        const d = await itemR.json();
        setItems(d.data);
        setPagination(d.pagination);
      } else {
        setError("Failed to load catalog. Check your connection or permissions.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [page, activeOnly]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.reward_name.toLowerCase().includes(search.toLowerCase()) ||
          i.reward_code.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
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

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-black">
                  Reward Catalog
                </h1>
                <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">
                  Manage all reward items and stock levels
                </p>
              </div>
              <Button
                onClick={() => setModal("create")}
                className="h-12 px-7 rounded-2xl bg-black text-white text-xs font-black tracking-widest uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95 border-none"
              >
                <Plus className="w-4 h-4" />
                Add Reward
              </Button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="relative max-w-xs flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none z-10" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code…"
                  className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 text-sm font-bold text-black focus-visible:ring-purple-50 focus-visible:border-purple-300 bg-white shadow-sm transition-all"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none bg-white rounded-2xl border border-slate-200 px-5 h-11 shadow-sm hover:border-purple-200 transition-all">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => {
                    setActiveOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded bg-slate-200 transition-all checked:bg-purple-600 focus:outline-none"
                />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest peer-checked:text-purple-700 transition-colors">
                  Active only
                </span>
              </label>

              {pagination && (
                <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{pagination.total} items</span>
                  <span className="text-slate-200">·</span>
                  <span>
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                </div>
              )}

              <Button
                variant="default"
                size="icon"
                onClick={load}
                className="h-11 w-11 rounded-2xl bg-black text-white hover:bg-slate-800 transition-all shadow-md active:rotate-180 duration-500 active:scale-95 border-none"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
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