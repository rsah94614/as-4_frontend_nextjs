"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/types/department-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import { DepartmentStats } from "@/components/features/admin/departments/DepartmentStats";
import { DepartmentTable } from "@/components/features/admin/departments/DepartmentTable";
import { DepartmentModal } from "@/components/features/admin/departments/DepartmentModal";

export default function DepartmentsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {
        departments,
        pagination,
        departmentTypes,
        loading,
        error,
        setPage,
        search,
        setSearch,
        refresh,
    } = useDepartments();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [searchInput, setSearchInput] = useState("");

    const openCreate = () => {
        setSelectedDepartment(null);
        setModalOpen(true);
    };

    const openEdit = (dept: Department) => {
        setSelectedDepartment(dept);
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

    // Summary stats calculation
    const totalCount = pagination?.total ?? departments.length;
    const activeCount = departments.filter(d => d.is_active).length;
    const typeCount = new Set(departments.map(d => d.department_type?.type_code).filter(Boolean)).size;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-black">Departments</h1>
                            <p className="text-slate-500 font-medium">
                                Manage organisational departments and internal structure.
                            </p>
                        </div>
                        <Button
                            onClick={openCreate}
                            className="bg-black text-white hover:bg-slate-800 rounded-xl px-5 h-11"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Department
                        </Button>
                    </div>

                    {/* Summary stats */}
                    <DepartmentStats
                        total={totalCount}
                        active={activeCount}
                        types={typeCount}
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
                                className="pl-9 bg-white border-slate-200 rounded-xl h-11"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            className="bg-black text-white hover:bg-slate-800 rounded-xl h-11 px-6"
                        >
                            Search
                        </Button>
                        {search && (
                            <Button
                                variant="outline"
                                onClick={clearSearch}
                                className="bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl h-11"
                            >
                                <X className="w-3 h-3 mr-2" /> Clear
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={refresh}
                            className="border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-300 rounded-xl h-11 w-11 p-0 ml-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <DepartmentTable
                        departments={departments}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={setPage}
                        onEdit={openEdit}
                    />
                </main>
            </div>

            {/* Modal */}
            <DepartmentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDepartment={selectedDepartment}
                departmentTypes={departmentTypes}
            />
        </div>
    );
}