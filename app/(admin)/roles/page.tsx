"use client";

import React, { useState } from "react";
import { Shield, UserPlus, Lock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { RolesSection } from "@/components/features/admin/roles/RolesSection";
import { AssignmentsSection } from "@/components/features/admin/roles/AssignmentsSection";
import { RoutePermissionsSection } from "@/components/features/admin/roles/RoutePermissionsSection";

type Tab = "roles" | "assignments" | "permissions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roles",       label: "Roles",            icon: <Shield   className="w-4 h-4" /> },
    { id: "assignments", label: "Assignments",       icon: <UserPlus className="w-4 h-4" /> },
    { id: "permissions", label: "Route Permissions", icon: <Lock     className="w-4 h-4" /> },
];

export default function RolesPage() {
    const [tab, setTab]                 = useState<Tab>("roles");
    const { toasts, show: toast }       = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-white">

                    {/* ── Page Header ── */}
                    <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
                        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                            <div>
                                {/* Back to Control Panel */}
                                <Link
                                    href="/control-panel"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all duration-150 mb-3 group"
                                >
                                    <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
                                    Back to Control Panel
                                </Link>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E31837" }}>
                                    Admin · Control Panel
                                </p>
                                <h1 className="text-2xl font-bold leading-tight" style={{ color: "#004C8F" }}>
                                    Roles &amp; Permissions
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    Manage roles · Assign to employees · Control route-level access
                                </p>
                            </div>
                            <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
                                <span style={{ color: "#E31837" }}>A</span>
                                <span style={{ color: "#004C8F" }}>abhar</span>
                            </span>
                        </div>
                    </div>

                    {/* Red accent line */}
                    <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

                    {/* ── Tab bar ── */}
                    <div className="bg-white border-b border-gray-200 px-8 md:px-10">
                        <div className="max-w-[1200px] mx-auto flex">
                            {TABS.map((t) => {
                                const active = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className="flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all -mb-px"
                                        style={
                                            active
                                                ? { color: "#004C8F", borderColor: "#E31837" }
                                                : { color: "#9CA3AF", borderColor: "transparent" }
                                        }
                                    >
                                        {t.icon}
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Main content ── */}
                    <div className="px-8 md:px-10 py-8" style={{ background: "#F7F9FC" }}>
                        <div className="max-w-[1200px] mx-auto">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                {tab === "roles"       && <RolesSection            toast={toast} />}
                                {tab === "assignments" && <AssignmentsSection      toast={toast} />}
                                {tab === "permissions" && <RoutePermissionsSection toast={toast} />}
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            <ToastContainer toasts={toasts} />
        </div>
    );
}