"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute adminOnly>
            <div className="min-h-screen bg-[#F0F4F8] overflow-x-hidden">
                {/* Left Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main Content Area */}
                <div className="flex flex-col min-w-0 w-full overflow-hidden lg:pl-60">
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
