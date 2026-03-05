"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AdminTeamReportCard from "./AdminTeamReportcard";
import type { TeamSummaryResponse } from "@/types/dashboard-types";

type SortOption = "score" | "points" | "members" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "score", label: "Performance" },
  { value: "points", label: "Points" },
  { value: "members", label: "Members" },
  { value: "name", label: "Name" },
];

interface Props {
  teams: TeamSummaryResponse[];
  loading: boolean;
  searchQuery: string;
  sortBy: SortOption;
  onSearchChange: (val: string) => void;
  onSortChange: (val: SortOption) => void;
  onTeamClick: (departmentId: string) => void;
}

export default function AdminTeamsSection({
  teams,
  loading,
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  onTeamClick,
}: Props) {
  const filtered = teams
    .filter((t) =>
      t.department_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name")
        return a.department_name.localeCompare(b.department_name);
      if (sortBy === "points") return b.total_points - a.total_points;
      if (sortBy === "members") return b.total_members - a.total_members;
      return b.avg_performance_score - a.avg_performance_score;
    });

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-56 h-9 text-sm rounded-xl border-[#d9d9d9]"
          />
        </div>

        {/* Sort pill tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border border-[#e8e8e8]">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${
                  sortBy === opt.value
                    ? "bg-white text-gray-900 shadow-sm border border-[#e0e0e0]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400">
          {loading
            ? "—"
            : `${filtered.length} team${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((team) => (
            <AdminTeamReportCard
              key={team.department_id}
              team={team}
              onClick={() => onTeamClick(team.department_id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-16 text-sm text-gray-400">
              No teams match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
