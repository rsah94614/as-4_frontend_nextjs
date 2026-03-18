import DashboardHeroSection from "../features/dashboard/dashboard/user/DashboardHeroSection";
import DashboardLeaderboardSection from "../features/dashboard/dashboard/user/DashboardLeaderboardSection";
import DashboardRecognitionSection from "../features/dashboard/dashboard/user/DashboardRecognitionSection";
import DashboardStatsSection from "../features/dashboard/dashboard/user/DashboardStatsSection";



export default function UserDashboard() {
    return (
        <div className="space-y-6">
            {/* Hero greeting */}
            <DashboardHeroSection />
            {/* Stats */}
            <DashboardStatsSection />

            {/* Reviews + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <DashboardRecognitionSection />
                <DashboardLeaderboardSection />
            </div>
        </div>
    )
}