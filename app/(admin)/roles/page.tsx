"use client";

import React, { useState } from "react";
import { Shield, UserPlus, Lock } from "lucide-react";


import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { RolesSection } from "@/components/features/admin/roles/RolesSection";
import { AssignmentsSection } from "@/components/features/admin/roles/AssignmentsSection";
import { RoutePermissionsSection } from "@/components/features/admin/roles/RoutePermissionsSection";

type Tab = "roles" | "assignments" | "permissions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roles", label: "Roles", icon: <Shield className="w-4 h-4" /> },
    { id: "assignments", label: "Assignments", icon: <UserPlus className="w-4 h-4" /> },
    { id: "permissions", label: "Route Permissions", icon: <Lock className="w-4 h-4" /> },
];

export default function RolesPage() {
    const [tab, setTab] = useState<Tab>("roles");
    const { toasts, show: toast } = useToast();

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-white">

                {/* Red accent line */}
                <div className="h-0.5 shrink-0" style={{ background: "#E31837" }} />

                {/* ── Tab bar ── */}
                <div className="bg-white border-b border-gray-200 px-3 sm:px-5 lg:px-8">
                    <div className="max-w-[1200px] mx-auto flex overflow-x-auto scrollbar-thin">
                        {TABS.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className="flex shrink-0 items-center gap-2 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
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
                <div className="px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8" style={{ background: "#F7F9FC" }}>
                    <div className="max-w-[1200px] mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5 lg:p-8">
                            {tab === "roles" && <RolesSection toast={toast} />}
                            {tab === "assignments" && <AssignmentsSection toast={toast} />}
                            {tab === "permissions" && <RoutePermissionsSection toast={toast} />}
                        </div>
                    </div>
                </div>

            </main>
            <ToastContainer toasts={toasts} />
        </>
    );
}
