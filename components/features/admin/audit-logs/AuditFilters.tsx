"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    const hasActiveFilters = !!(
        staged.tableName ||
        staged.operationType ||
        staged.performedBy ||
        staged.startDate ||
        staged.endDate
    );

    const handleClear = () => {
        const empty = {
            tableName: "",
            operationType: "" as OperationType | "",
            performedBy: "",
            startDate: "",
            endDate: "",
        };
        setStaged(empty);
        onClear();
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700">Filter Logs</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition font-medium"
                    >
                        <RotateCcw className="w-3 h-3" /> Clear all filters
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <Label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Table / Module
                    </Label>
                    <Input
                        value={staged.tableName}
                        onChange={(e) => setStaged((p: AuditFilters) => ({ ...p, tableName: e.target.value }))}
                        placeholder="e.g. employees, departments"
                    />
                    <p className="text-xs text-gray-300 mt-1">The database table that was changed</p>
                </div>
                <div>
                    <Label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Action Type
                    </Label>
                    <Select
                        value={staged.operationType || "all"}
                        onValueChange={(val) =>
                            setStaged((p: AuditFilters) => ({
                                ...p,
                                operationType: (val === "all" ? "" : val) as OperationType | "",
                            }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All actions</SelectItem>
                            <SelectItem value="INSERT">Created (INSERT)</SelectItem>
                            <SelectItem value="UPDATE">Updated (UPDATE)</SelectItem>
                            <SelectItem value="DELETE">Deleted (DELETE)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Performed By
                    </Label>
                    <Input
                        value={staged.performedBy}
                        onChange={(e) => setStaged((p: AuditFilters) => ({ ...p, performedBy: e.target.value }))}
                        placeholder="Employee ID (UUID)"
                    />
                    <p className="text-xs text-gray-300 mt-1">
                        Paste the employee&apos;s ID from the Employees page
                    </p>
                </div>
                <div>
                    <Label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        From Date &amp; Time
                    </Label>
                    <Input
                        type="datetime-local"
                        value={staged.startDate}
                        onChange={(e) => setStaged((p: AuditFilters) => ({ ...p, startDate: e.target.value }))}
                    />
                </div>
                <div>
                    <Label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        To Date &amp; Time
                    </Label>
                    <Input
                        type="datetime-local"
                        value={staged.endDate}
                        onChange={(e) => setStaged((p: AuditFilters) => ({ ...p, endDate: e.target.value }))}
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        onClick={() => onApply(staged)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200"
                    >
                        <Search className="w-4 h-4" /> Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
