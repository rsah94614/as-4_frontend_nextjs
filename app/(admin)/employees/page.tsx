"use client";

import { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Filter,
  X,
  Plus,
  Upload,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTeams } from "@/hooks/useTeams";

// Modular Components
import { CalendarStrip, StatsPanel } from "@/components/features/admin/teams/UIHelpers";
import { TeamCard } from "@/components/features/admin/teams/TeamCard";
import { BulkImportModal } from "@/components/features/admin/teams/BulkImportModal";
import { AddEmployeeModal } from "@/components/features/admin/teams/AddEmployeeModal";

export default function EmployeesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    allEmployees,
    loading,
    error,
    month,
    setMonth,
    year,
    setYear,
    managers,
    getTeam,
    deptOptions,
    statsMap,
    refresh,
  } = useTeams();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedMgrId, setSelectedMgrId] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredManagers = useMemo(() => {
    const term = search.toLowerCase();
    return managers.filter((m) => {
      const team = getTeam(m.employee_id);
      const match =
        !term ||
        m.username.toLowerCase().includes(term) ||
        m.designation_name?.toLowerCase().includes(term) ||
        team.some(
          (e) =>
            e.username.toLowerCase().includes(term) ||
            e.designation_name?.toLowerCase().includes(term)
        );
      const dept =
        !deptFilter ||
        m.department_name === deptFilter ||
        team.some((e) => e.department_name === deptFilter);
      return match && dept;
    });
  }, [managers, getTeam, search, deptFilter]);

  const selectedManager = useMemo(
    () => allEmployees.find((e) => e.employee_id === selectedMgrId) ?? null,
    [allEmployees, selectedMgrId]
  );

  const selectedTeam = useMemo(
    () => (selectedMgrId ? getTeam(selectedMgrId) : []),
    [selectedMgrId, getTeam]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                  Teams
                </h1>
                <p className="text-slate-500 font-medium">
                  Browse employees organised by team hierarchy.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </button>
              </div>
            </div>

            {/* Calendar & Period */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Period
                </span>
              </div>
              <CalendarStrip
                month={month}
                year={year}
                onChange={(m, y) => {
                  setMonth(m);
                  setYear(y);
                }}
              />
              <button
                onClick={refresh}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-all ml-auto active:rotate-180 duration-500"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or designation..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all shadow-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none transition-all shadow-sm"
                >
                  <option value="">All Departments</option>
                  {deptOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {(search || deptFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDeptFilter("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition active:scale-95"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Content Layout */}
            <div className="flex gap-4 items-start">
              {/* Left: Team List */}
              <div className="flex-1 min-w-0 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                    <p className="text-slate-400 font-medium text-sm animate-pulse">Loading team hierarchy...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4 bg-red-50/50 rounded-3xl border border-red-100">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                      <X className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-red-900 font-bold">Failed to load teams</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <button
                      onClick={refresh}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition active:scale-95"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 gap-3">
                    <Users className="w-10 h-10 text-slate-200" />
                    <p className="text-slate-400 font-medium">No teams match your criteria.</p>
                  </div>
                ) : (
                  filteredManagers.map((mgr) => (
                    <TeamCard
                      key={mgr.employee_id}
                      manager={mgr}
                      members={getTeam(mgr.employee_id)}
                      expanded={expandedIds.has(mgr.employee_id)}
                      selected={selectedMgrId === mgr.employee_id}
                      onToggle={() => toggleExpand(mgr.employee_id)}
                      onSelect={() => setSelectedMgrId(mgr.employee_id)}
                    />
                  ))
                )}
              </div>

              {/* Right: Stats Panel */}
              <div className="w-80 flex-shrink-0 sticky top-6 self-start bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-black text-sm tracking-tight">Team Performance</span>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <StatsPanel
                    manager={selectedManager}
                    members={selectedTeam}
                    statsMap={statsMap}
                    month={month}
                    year={year}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {bulkModalOpen && (
        <BulkImportModal
          onClose={() => setBulkModalOpen(false)}
          onSuccess={refresh}
        />
      )}

      {addModalOpen && (
        <AddEmployeeModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={refresh}
          allEmployees={allEmployees}
        />
      )}
    </div>
  );
}