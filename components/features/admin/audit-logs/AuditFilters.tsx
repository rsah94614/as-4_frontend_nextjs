"use client";

import { useState } from "react";
import { Search, RotateCcw, Info } from "lucide-react";
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
        <div className="bg-white rounded-xl shadow-sm px-3 sm:px-4 md:px-5 lg:px-6 py-4 space-y-4 overflow-x-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Info banner about employee filter */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1a4ab5" }}>
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                    <strong>Note:</strong> To filter by a specific employee, paste their Employee ID (UUID) from the Employees page into the Employee ID field.
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {/* Action Type — most useful filter */}
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

                {/* Module / Table name */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>Module / Section</label>
                    <Input
                        value={staged.tableName}
                        onChange={e => setStaged(p => ({ ...p, tableName: e.target.value }))}
                        placeholder="e.g. departments, designations..."
                        className={inputClass}
                    />
                </div>

                {/* Employee ID (UUID) */}
                <div>
                    <label className={labelStyle} style={{ color: "#6b7280" }}>Employee ID</label>
                    <Input
                        value={staged.performedBy}
                        onChange={e => setStaged(p => ({ ...p, performedBy: e.target.value }))}
                        placeholder="Paste employee UUID..."
                        className={inputClass + " font-mono text-xs"}
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

                {/* Apply */}
                <div className="flex items-end md:col-span-2 xl:col-span-1">
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
