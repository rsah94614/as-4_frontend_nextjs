"use client";

import AdminParticipationSection from "../features/dashboard/dashboard/admin/AdminParticipationSection";
import AdminRecognitionTrendSection from "../features/dashboard/dashboard/admin/AdminRecognitionTrendSection";
import AdminRecognitionSection from "../features/dashboard/dashboard/admin/AdminRecognitionSection";
import AdminTeamReportsSection from "../features/dashboard/dashboard/admin/AdminTeamReportsSection";

export default function AdminDashboard() {
    return (
        <div className="space-y-6 bg-white">
            <AdminParticipationSection />
            <AdminRecognitionTrendSection />
            <AdminRecognitionSection />
            <AdminTeamReportsSection />
        </div>


    );
}