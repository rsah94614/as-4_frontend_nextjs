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
        : "-";

    return (
        <>
            <main className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-5">
                {/* ─── Page Header (matches Employee page) ─── */}
                <div>
                    <div className="bg-white border-b border-border px-8 md:px-10 py-5">
                        <div className="mx-auto flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                                    Designations
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Create and manage employee designations
                                </p>
                            </div>
                            <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                                <span style={{ color: "#E31837" }}>A</span>
                                <span style={{ color: "#004C8F" }}>abhar</span>
                            </span>
                        </div>
                    </div>

                </div>
                <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
                    <DesignationStats total={totalCount} active={activeCount} avgLevel={avgLevel} />

                    <div className="bg-white rounded-xl shadow-sm px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="relative w-full sm:flex-1 sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                                <Input
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                                    placeholder="Search by name or code..."
                                    className="pl-9 h-10 rounded-lg border-border focus-visible:ring-0 focus-visible:border-primary"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-10 w-full sm:w-auto px-5 rounded-lg font-semibold text-white hover:opacity-90"
                                style={{ backgroundColor: "#1a4ab5", border: "none" }}
                            >
                                Search
                            </Button>
                            {search && (
                                <Button
                                    variant="outline"
                                    onClick={clearSearch}
                                    className="h-10 w-full sm:w-auto px-4 rounded-lg border-border text-foreground hover:bg-muted"
                                >
                                    <X className="w-3 h-3 mr-1.5" /> Clear
                                </Button>
                            )}
                            <Button
                                onClick={openCreate}
                                className="h-10 w-full sm:w-auto px-5 rounded-lg font-semibold text-white hover:opacity-90"
                            >
                                <Plus className="w-4 h-4 " />
                                Designation
                            </Button>
                            <Button
                                variant="outline"
                                onClick={refresh}
                                className="h-10 w-full sm:w-10 sm:ml-auto p-0 rounded-lg border-border text-muted-foreground hover:bg-muted"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>

                        {error && (
                            <div
                                className="px-4 py-3 rounded-lg text-sm"
                                style={{
                                    backgroundColor: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    color: "#b91c1c",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <DesignationTable
                            designations={displayList}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onEdit={openEdit}
                        />
                    </div>
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
