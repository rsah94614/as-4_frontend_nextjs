import { LayoutGrid, Users, Trophy, TrendingUp, Star } from "lucide-react";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import DashboardRecognitionSection from "@/components/ui/dashboard/DashboardRecogntionSection";
import DashboardLeaderboardSection from "@/components/ui/dashboard/DashboardLeaderboardSection";




export default function DashboardPage() {
  const stats = [
    { label: "Total Points:", value: "1,248", icon: Users, change: "+12%", color: "bg-[#FFE69C]" },
    { label: "Rewards Given:", value: "3,462", icon: Trophy, change: "+8%", color: "bg-[#EED9FF]" },
    { label: "Active Reviews:", value: "186", icon: LayoutGrid, change: "+24%", color: "bg-[#D1FFD7]" },
    { label: "Active Users:", value: "777", icon: TrendingUp, change: "+5%", color: "bg-[#DFDFFF]" },
  ];

  return (
    <div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
        {stats.map((stat) => (
          <DashboardCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            iconBgColor={stat.color}
          />
        ))}
      </div>

      {/* Recent Recognitions & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">

        {/* Recent Recognitions – wider (3 of 5 cols) */}
        <DashboardRecognitionSection />

        {/* Leaderboard – narrower (2 of 5 cols) */}
        <DashboardLeaderboardSection />


      </div>
    </div>
  );
}