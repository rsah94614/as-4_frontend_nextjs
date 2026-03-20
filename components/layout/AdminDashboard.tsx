"use client";

import AdminParticipationSection from "../features/dashboard/dashboard/admin/AdminParticipationSection";
import AdminRecognitionTrendSection from "../features/dashboard/dashboard/admin/AdminRecognitionTrendSection";
import AdminRecognitionSection from "../features/dashboard/dashboard/admin/AdminRecognitionSection";
import AdminTeamReportsSection from "../features/dashboard/dashboard/admin/AdminTeamReportsSection";

export default function AdminDashboard() {
    return (
        <div className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
            <div className="space-y-6 px-8 md:px-10 py-8">
                <AdminParticipationSection />
                <AdminRecognitionTrendSection />
                <AdminRecognitionSection />
                <AdminTeamReportsSection />
            </div>
        </div>
    );
}