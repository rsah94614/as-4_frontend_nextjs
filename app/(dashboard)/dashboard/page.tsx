"use client";

import { useEffect, useState } from "react";
import { isAdminUser } from "@/lib/role-utils";
import AdminDashboard from "@/components/features/dashboard/AdminDashboard";
import DashboardLeaderboardSection from "@/components/features/dashboard/DashboardLeaderboardSection";
import DashboardStatsSection from "@/components/features/dashboard/DashboardStatsSection";
import DashboardRecognitionSection from "@/components/features/dashboard/DashboardRecognitionSection";

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div>
      {/* Stats Grid */}
      <DashboardStatsSection />

      {/* Recent Recognitions & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* Recent Reviews – wider (3 of 5 cols) */}
        <DashboardRecognitionSection />

        {/* Leaderboard – narrower (2 of 5 cols) */}
        <DashboardLeaderboardSection />
      </div>
    </div>
  );
}