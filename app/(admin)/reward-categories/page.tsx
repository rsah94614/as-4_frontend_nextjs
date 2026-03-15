"use client";

import React, { useState } from "react";
import { Tags, Search,  X, Plus, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useRewardCategories } from "@/hooks/useRewardCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { CategoryModal } from "@/components/features/admin/rewards/CategoryModal";
import { CategoryTable } from "@/components/features/admin/rewards/CategoryTable";

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="h-[6px] shrink-0" style={{ background: '#a11027' }} />

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scroll-smooth">
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#004C8F] rounded-xl flex items-center justify-center shadow-xl shadow-blue-100/50 group hover:rotate-6 transition-transform duration-500">
                  <Tags className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h1 className="text-5xl font-semibold tracking-tighter text-slate-900 leading-none">
                    Reward <span className="text-[#004C8F]">Categories</span>
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-600 mt-2 uppercase tracking-wider">
                    Create and Manage the categories for reward items
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={openCreate}
              className="h-16 px-10 bg-[#004C8F] text-white rounded-xl text-xs font-semibold tracking-wider shadow-xl shadow-blue-100 hover:bg-[#003d73] transition-all hover:-translate-y-1 active:scale-95 group uppercase flex items-center gap-3 overflow-hidden border-none"
            >
              <Plus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Build New Category
              <ArrowUpRight className="w-4 h-4 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </Button>
          </div>

          {/* Stats Bar Container */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {!loading && categories.length > 0 && (
              <RewardStats
                total={categories.length}
                active={activeCount}
                inactive={categories.length - activeCount}
              />
            )}
          </div>

          {/* Error Banner with Premium Styling */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-100/50 rounded-[32px] p-6 flex items-center justify-between gap-6 shadow-xl shadow-red-100/20 border-l-[12px] border-l-red-600 animate-in shake-in duration-500">
              <div className="flex items-center gap-4 text-red-700">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <X className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg tracking-tight">System Interrupt</p>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{error}</p>
                </div>
              </div>
              <Button
                onClick={refresh}
                className="h-14 px-8 bg-red-600 text-white rounded-2xl text-[10px] font-semibold tracking-wider hover:bg-red-700 transition-all shadow-lg active:scale-95 border-none"
              >
                RE-INITIALIZE SYNC
              </Button>
            </div>
          )}

          {/* Interactive Filtering Toolbar */}
          <div className="flex flex-col lg:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <div className="relative max-w-xs flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#004C8F] transition-colors pointer-events-none z-10" />
              <Input
                placeholder="Identify Category by Name or Logic Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white shadow-sm transition-all"
              />
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm h-11 w-full lg:max-w-max transition-all">
              {(["all", "active", "inactive"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterState(filter)}
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




          </div>

          {/* Central Grid System */}
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <CategoryTable
              categories={filtered}
              loading={loading}
              onEdit={openEdit}
              openCreate={openCreate}
            />
          </div>

          <div className="h-20" /> {/* Bottom Spacing */}
        </main>

        {/* Modal Logic */}
        {modal && (
          <CategoryModal
            isOpen={!!modal}
            category={selected}
            onClose={closeModal}
            onSave={handleSaved}
          />
        )}
      </div>
    </div>
  );
}