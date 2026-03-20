"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";
import { useRewardCategories } from "@/hooks/useRewardCategories";

// Modular Components
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { CategoryModal } from "@/components/features/admin/rewards/CategoryModal";
import { CategoryTable } from "@/components/features/admin/rewards/CategoryTable";
import { AdminPageHeader } from "@/components/features/admin/AdminControlPanelPageHeader";

export default function CategoriesPage() {
  const {
    categories,
    filtered,
    loading,
    error,
    search,
    setSearch,
    filterState,
    setFilterState,
    activeCount,
    modal,
    selected,
    openCreate,
    openEdit,
    closeModal,
    handleSaved,
    refresh
  } = useRewardCategories();

  return (
    <main className="flex-1 overflow-y-auto flex flex-col bg-white">

      {/* ─── Page Header ─── */}
      <AdminPageHeader
        title="Reward Categories"
        subtitle="Create and manage the categories for reward items"
      />



      {/* ─── Content Area ─── */}
      <div className="flex-1 px-8 md:px-10 py-8 flex flex-col" style={{ background: "#F7F9FC" }}>
        <div className="w-full mx-auto flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">



            {/* Error Banner */}
            {error && !loading && (
              <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <X size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Error</p>
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                </div>
                <button
                  onClick={refresh}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "#E31837" }}
                >
                  Retry
                </button>
              </div>
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

              {/* Filter tabs */}
              {!loading && categories.length > 0 && (
                <RewardStats
                  total={categories.length}
                  active={activeCount}
                  inactive={categories.length - activeCount}
                  filterState={filterState}
                  setFilterState={setFilterState}
                />
              )}

              <button
                onClick={openCreate}
                className="ml-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95 bg-primary"
              >
                <Plus size={13} />
                Add Category
              </button>
            </div>

            {/* ─── Category Table ─── */}
            <CategoryTable
              categories={filtered}
              loading={loading}
              onEdit={openEdit}
              openCreate={openCreate}
              filterState={filterState}
            />
          </div>
        </div>
      </div>

      {/* Modal Logic */}
      {modal && (
        <CategoryModal
          isOpen={!!modal}
          category={selected}
          onClose={closeModal}
          onSave={handleSaved}
        />
      )}
    </main>
  );
}

