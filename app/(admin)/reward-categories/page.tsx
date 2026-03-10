"use client";

import React, { useState } from "react";
import { Tags, Search, RefreshCw, X, Filter, BarChart3, Plus, ArrowUpRight } from "lucide-react";
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
    activeOnly,
    setActiveOnly,
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

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scroll-smooth">
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-[24px] flex items-center justify-center shadow-2xl shadow-purple-200 group hover:rotate-6 transition-transform duration-500">
                  <Tags className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                    Reward <span className="text-purple-600">Categories</span>
                  </h1>
                  <p className="text-[11px] font-black text-slate-400 mt-2 uppercase tracking-[0.4em] flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> System Configuration Module
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={openCreate}
              className="h-16 px-10 bg-black text-white rounded-[24px] text-xs font-black tracking-widest shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all hover:-translate-y-1 hover:shadow-purple-200 active:scale-95 group uppercase flex items-center gap-3 overflow-hidden border-none"
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
                  <p className="font-extrabold text-lg tracking-tight">System Interrupt</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">{error}</p>
                </div>
              </div>
              <Button
                onClick={refresh}
                className="h-14 px-8 bg-red-600 text-white rounded-2xl text-[10px] font-black tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95 border-none"
              >
                RE-INITIALIZE SYNC
              </Button>
            </div>
          )}

          {/* Interactive Filtering Toolbar */}
          <div className="flex flex-col lg:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-600 group-focus-within:scale-110 transition-all pointer-events-none z-10" />
              <Input
                placeholder="Identify Category by Name or Logic Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 pl-16 pr-8 rounded-[24px] border-2 border-slate-100 bg-white text-sm font-black text-slate-800 placeholder:text-slate-300 focus-visible:ring-purple-50 focus-visible:border-purple-300 transition-all shadow-sm group-hover:border-slate-200"
              />
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <label className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 rounded-[24px] cursor-pointer select-none hover:border-purple-300 transition-all group shadow-sm">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                    className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-slate-200 transition-all focus:outline-none checked:bg-green-500 group-hover:scale-105"
                  />
                  <div className="absolute left-1 h-4 w-4 transform rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-800 uppercase tracking-widest transition-colors flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> Filter Active
                </span>
              </label>

              {(search || activeOnly) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setActiveOnly(false);
                  }}
                  className="h-16 w-16 p-0 rounded-[24px] bg-slate-100 text-slate-500 hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 group border-2 border-transparent hover:shadow-xl"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
              )}
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] mb-1">
                  GRID QUANTITY
                </span>
                <span className="text-xl font-black text-slate-800 tracking-tighter">
                  {filtered.length} <span className="text-[10px] text-slate-300 uppercase tracking-widest">CATEGORIES LOADED</span>
                </span>
              </div>
              <Button
                variant="outline"
                onClick={refresh}
                className="h-16 w-16 p-0 bg-white border-2 border-slate-100 rounded-[24px] text-slate-400 hover:text-purple-600 hover:border-purple-300 hover:shadow-xl transition-all active:scale-95 group shadow-sm active:rotate-180 duration-700"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
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