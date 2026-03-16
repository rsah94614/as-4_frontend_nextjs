"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";

import { useDesignations } from "@/hooks/useDesignations";
import { Designation } from "@/types/designation-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DesignationStats } from "@/components/features/admin/designations/DesignationStats";
import { DesignationTable } from "@/components/features/admin/designations/DesignationTable";
import { DesignationModal } from "@/components/features/admin/designations/DesignationModal";

export default function DesignationsPage() {
    const {
        designations,
        pagination,
        loading,
        error,
        setPage,
        search,
        setSearch,
        refresh,
    } = useDesignations();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
    const [searchInput, setSearchInput] = useState("");

    const openCreate = () => {
        setSelectedDesignation(null);
        setModalOpen(true);
    };

    const openEdit = (desig: Designation) => {
        setSelectedDesignation(desig);
        setModalOpen(true);
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const clearSearch = () => {
        setSearch("");
        setSearchInput("");
        setPage(1);
    };

    const displayList = search
        ? designations.filter(
            d =>
                d.designation_name.toLowerCase().includes(search.toLowerCase()) ||
                d.designation_code.toLowerCase().includes(search.toLowerCase())
        )
        : designations;

    const totalCount = pagination?.total ?? designations.length;
    const activeCount = designations.filter(d => d.is_active).length;
    const avgLevel = designations.length
        ? (designations.reduce((s, d) => s + d.level, 0) / designations.length).toFixed(1)
        : "—";

    return (
        <>
            <main className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Blue header bar */}
                    <div
                        className="flex items-center justify-between px-6 py-4 rounded-xl"
                        style={{ backgroundColor: "#1a4ab5" }}
                    >
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            Manage Designations
                        </h1>
                        <Button
                            onClick={openCreate}
                            className="h-10 px-5 rounded-lg font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: "#e8192c", border: "none" }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Designation
                        </Button>
                    </div>

                    {/* Stats */}
                    <DesignationStats
                        total={totalCount}
                        active={activeCount}
                        avgLevel={avgLevel}
                    />

                    {/* White content card */}
                    <div className="bg-white rounded-xl shadow-sm px-6 py-5 space-y-4">

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                                    placeholder="Search by name or code..."
                                    className="pl-9 h-10 rounded-lg border-slate-300 focus-visible:ring-0 focus-visible:border-[#1a4ab5]"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-10 px-5 rounded-lg font-semibold text-white hover:opacity-90"
                                style={{ backgroundColor: "#1a4ab5", border: "none" }}
                            >
                                Search
                            </Button>
                            {search && (
                                <Button
                                    variant="outline"
                                    onClick={clearSearch}
                                    className="h-10 px-4 rounded-lg border-slate-300 text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-3 h-3 mr-1.5" /> Clear
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={refresh}
                                className="ml-auto h-10 w-10 p-0 rounded-lg border-slate-300 text-slate-500 hover:bg-slate-100"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="px-4 py-3 rounded-lg text-sm"
                                style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Table */}
                        <DesignationTable
                            designations={displayList}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onEdit={openEdit}
                        />
                    </div>
                </main>

            <DesignationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDesignation={selectedDesignation}
            />
        </>
    );
}