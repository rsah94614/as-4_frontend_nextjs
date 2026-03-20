import DashboardHeroSection from "../features/dashboard/dashboard/user/DashboardHeroSection";
import DashboardLeaderboardSection from "../features/dashboard/dashboard/user/DashboardLeaderboardSection";
import DashboardRecognitionSection from "../features/dashboard/dashboard/user/DashboardRecognitionSection";
import DashboardStatsSection from "../features/dashboard/dashboard/user/DashboardStatsSection";



export default function UserDashboard() {
    return (
        <div className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
            <div className="space-y-6 px-8 md:px-10 py-8">
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
        </div>
    )
}