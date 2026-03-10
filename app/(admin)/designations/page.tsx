"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useDesignations } from "@/hooks/useDesignations";
import { Designation } from "@/types/designation-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import { DesignationStats } from "@/components/features/admin/designations/DesignationStats";
import { DesignationTable } from "@/components/features/admin/designations/DesignationTable";
import { DesignationModal } from "@/components/features/admin/designations/DesignationModal";

export default function DesignationsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    // Client-side filtering if searching
    const displayList = search
        ? designations.filter(
            d =>
                d.designation_name.toLowerCase().includes(search.toLowerCase()) ||
                d.designation_code.toLowerCase().includes(search.toLowerCase())
        )
        : designations;

    // Summary stats calculation
    const totalCount = pagination?.total ?? designations.length;
    const activeCount = designations.filter(d => d.is_active).length;
    const avgLevel = designations.length
        ? (designations.reduce((s, d) => s + d.level, 0) / designations.length).toFixed(1)
        : "—";

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-black">Designations</h1>
                            <p className="text-slate-500 font-medium">
                                Manage job titles and hierarchy levels across the organisation.
                            </p>
                        </div>
                        <Button
                            onClick={openCreate}
                            className="bg-black text-white hover:bg-slate-800 rounded-xl px-5 h-11 transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Designation
                        </Button>
                    </div>

                    {/* Summary stats */}
                    <DesignationStats
                        total={totalCount}
                        active={activeCount}
                        avgLevel={avgLevel}
                    />

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative max-w-xs flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                            <Input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Search by name or code..."
                                className="pl-9 bg-white border-slate-200 rounded-xl h-11 focus:ring-purple-300"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            className="bg-black text-white hover:bg-slate-800 rounded-xl h-11 px-6 font-bold tracking-tight"
                        >
                            Search
                        </Button>
                        {search && (
                            <Button
                                variant="outline"
                                onClick={clearSearch}
                                className="bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl h-11 font-medium tracking-tight"
                            >
                                <X className="w-3 h-3 mr-2" /> Clear
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={refresh}
                            className="border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-300 rounded-xl h-11 w-11 p-0 ml-auto transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
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
                </main>
            </div>

            {/* Modal */}
            <DesignationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDesignation={selectedDesignation}
            />
        </div>
    );
}