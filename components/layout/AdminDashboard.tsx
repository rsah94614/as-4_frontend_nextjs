"use client";

import AdminParticipationSection from "../features/dashboard/admin/AdminParticipationSection";
import AdminRecognitionTrendSection from "../features/dashboard/admin/AdminRecognitionTrendSection";
import AdminRecognitionSection from "../features/dashboard/admin/AdminRecognitionSection";
import AdminTeamReportsSection from "../features/dashboard/admin/AdminTeamReportsSection";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <AdminParticipationSection />
            <AdminRecognitionTrendSection />
            <AdminRecognitionSection />
            <AdminTeamReportsSection />
        </div>


    );
}