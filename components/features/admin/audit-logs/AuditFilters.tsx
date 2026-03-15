"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AuditFilters, OperationType } from "@/types/audit-types";

interface AuditFiltersProps {
    onApply: (filters: AuditFilters) => void;
    onClear: () => void;
    initialFilters: AuditFilters;
}

export function AuditFilterPanel({ onApply, onClear, initialFilters }: AuditFiltersProps) {
    const [staged, setStaged] = useState<AuditFilters>(initialFilters);

    const hasStaged = !!(
        staged.tableName || staged.operationType ||
        staged.performedBy || staged.startDate || staged.endDate
    );

    const handleClear = () => {
        const empty: AuditFilters = { tableName: "", operationType: "", performedBy: "", startDate: "", endDate: "" };
        setStaged(empty);
        onClear();
    };

    const labelStyle = "block text-xs font-semibold uppercase tracking-wide mb-1.5";
    const inputClass = "h-10 rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5]";

    return (
        <div className="bg-white rounded-xl shadow-sm px-6 py-5" style={{ border: "1px solid #e5e7eb" }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: "#374151" }}>Filter Audit Logs</h3>
                {hasStaged && (
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: "#e8192c" }}
                    >
                        <RotateCcw className="w-3 h-3" /> Clear all
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Employee Name */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>Employee Name</label>
                    <Input
                        value={staged.performedBy}
                        onChange={e => setStaged(p => ({ ...p, performedBy: e.target.value }))}
                        placeholder="Search by employee name..."
                        className={inputClass}
                    />
                </div>

                {/* Action Type */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>Action Type</label>
                    <Select
                        value={staged.operationType || "all"}
                        onValueChange={val =>
                            setStaged(p => ({ ...p, operationType: (val === "all" ? "" : val) as OperationType | "" }))
                        }
                    >
                        <SelectTrigger className="h-10 rounded-lg border-slate-300 focus:ring-0 focus:border-[#1a4ab5]">
                            <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All actions</SelectItem>
                            <SelectItem value="INSERT">Added / Created</SelectItem>
                            <SelectItem value="UPDATE">Updated</SelectItem>
                            <SelectItem value="DELETE">Deleted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table / Module */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>Module / Section</label>
                    <Input
                        value={staged.tableName}
                        onChange={e => setStaged(p => ({ ...p, tableName: e.target.value }))}
                        placeholder="e.g. employees, departments..."
                        className={inputClass}
                    />
                </div>

                {/* From Date */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>From Date & Time</label>
                    <Input
                        type="datetime-local"
                        value={staged.startDate}
                        onChange={e => setStaged(p => ({ ...p, startDate: e.target.value }))}
                        className={inputClass}
                    />
                </div>

                {/* To Date */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>To Date & Time</label>
                    <Input
                        type="datetime-local"
                        value={staged.endDate}
                        onChange={e => setStaged(p => ({ ...p, endDate: e.target.value }))}
                        className={inputClass}
                    />
                </div>

                {/* Apply button */}
                <div className="flex items-end">
                    <Button
                        onClick={() => onApply(staged)}
                        className="w-full h-10 rounded-lg font-semibold text-white hover:opacity-90"
                        style={{ backgroundColor: "#1a4ab5", border: "none" }}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}