import { LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total Employees", value: "1,248", icon: Users, change: "+12%" },
    { label: "Rewards Given", value: "3,462", icon: Trophy, change: "+8%" },
    { label: "Active Reviews", value: "186", icon: LayoutGrid, change: "+24%" },
    { label: "Engagement Rate", value: "87%", icon: TrendingUp, change: "+5%" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Welcome back! Here&apos;s an overview of your organization.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <stat.icon className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-3">{stat.value}</p>
            <span className="text-sm text-green-600 font-medium">
              {stat.change} from last month
            </span>
          </div>
        ))}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl border p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">
            Latest recognition and reward activity
          </p>
          <div className="mt-6 flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Activity feed coming soon</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold">Top Performers</h2>
          <p className="text-sm text-gray-500 mt-1">
            Employees with the most recognition this month
          </p>
          <div className="mt-6 flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">
              Leaderboard coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}