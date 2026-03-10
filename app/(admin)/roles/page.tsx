"use client";

import React, { useState } from "react";
import { Shield, UserPlus, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

// Modular Components
import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { RolesSection } from "@/components/features/admin/roles/RolesSection";
import { AssignmentsSection } from "@/components/features/admin/roles/AssignmentsSection";
import { RoutePermissionsSection } from "@/components/features/admin/roles/RoutePermissionsSection";

// ─── Tab Config ───────────────────────────────────────────────────────────────

type Tab = "roles" | "assignments" | "permissions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "roles", label: "Roles", icon: <Shield className="w-4 h-4" /> },
  { id: "assignments", label: "Assignments", icon: <UserPlus className="w-4 h-4" /> },
  { id: "permissions", label: "Route Permissions", icon: <Lock className="w-4 h-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const { toasts, show: toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-purple-700" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Roles & Permissions
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Manage roles, assign them to employees, and control
                route-level access
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border border-gray-200 rounded-xl p-1 bg-gray-50 w-fit">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${tab === t.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <Card>
              <CardContent className="pt-6">
                {tab === "roles" && <RolesSection toast={toast} />}
                {tab === "assignments" && (
                  <AssignmentsSection toast={toast} />
                )}
                {tab === "permissions" && (
                  <RoutePermissionsSection toast={toast} />
                )}
              </CardContent>
            </Card>

            <ToastContainer toasts={toasts} />
          </div>
        </main>
      </div>
    </div>
  );
}