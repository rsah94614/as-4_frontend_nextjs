"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDashboardPage = pathname === "/dashboard";

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F0F4F8]">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 w-full">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className={`flex-1 min-h-0 overflow-auto ${isDashboardPage ? "p-4" : ""}`}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
