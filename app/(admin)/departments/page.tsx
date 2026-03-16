"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/types/department-types";
import { DepartmentStats } from "@/components/features/admin/departments/DepartmentStats";
import { DepartmentTable } from "@/components/features/admin/departments/DepartmentTable";
import { DepartmentModal } from "@/components/features/admin/departments/DepartmentModal";

export default function DepartmentsPage() {
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

    const totalCount = pagination?.total ?? departments.length;
    const activeCount = departments.filter(d => d.is_active).length;
    const typeCount = new Set(departments.map(d => d.department_type?.type_code).filter(Boolean)).size;

    return (
        <>
            <main className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Blue header bar */}
                    <div
                        className="flex items-center justify-between px-6 py-4 rounded-xl"
                        style={{ backgroundColor: "#1a4ab5" }}
                    >
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            Departments
                        </h1>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 font-semibold text-white px-5 py-2.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "#e8192c" }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Department
                        </button>
                    </div>

                    {/* Stats */}
                    <DepartmentStats
                        total={totalCount}
                        active={activeCount}
                        types={typeCount}
                    />

                    {/* White content card */}
                    <div className="bg-white rounded-xl shadow-sm px-6 py-5 space-y-4">

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                                <input
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                                    placeholder="Search by name or code..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg outline-none transition-all"
                                    style={{ border: "1.5px solid #d1d5db", color: "#374151" }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#1a4ab5")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: "#1a4ab5" }}
                            >
                                Search
                            </button>
                            {search && (
                                <button
                                    onClick={clearSearch}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-slate-100"
                                    style={{ border: "1.5px solid #d1d5db", color: "#6b7280" }}
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                            <button
                                onClick={refresh}
                                className="ml-auto w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-slate-100"
                                style={{ border: "1.5px solid #d1d5db", color: "#6b7280" }}
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
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
                        <DepartmentTable
                            departments={departments}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onEdit={openEdit}
                        />
                    </div>
                </main>

            <DepartmentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDepartment={selectedDepartment}
                departmentTypes={departmentTypes}
            />
        </>
    );
}