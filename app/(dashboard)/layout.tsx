"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#F0F4F8]">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
