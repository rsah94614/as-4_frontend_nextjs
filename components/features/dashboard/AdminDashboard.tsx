"use client";

import  AdminParticipationSection  from "./AdminParticipationSection";
import  AdminRecognitionTrendSection  from "./AdminRecognitionTrendSection";
import  AdminRecognitionSection  from "./AdminRecognitionSection";
import  AdminTeamReportsSection  from "./AdminTeamReportsSection";

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