import { Trophy, Gift, Star, Award } from "lucide-react";

export default function RewardsPage() {
    const rewardCategories = [
        {
            title: "Spot Awards",
            description: "Instant recognition for outstanding contributions",
            icon: Star,
            count: 45,
            color: "bg-yellow-50 text-yellow-600 border-yellow-200",
        },
        {
            title: "Quarterly Awards",
            description: "Best performers of the quarter",
            icon: Trophy,
            count: 12,
            color: "bg-orange-50 text-orange-600 border-orange-200",
        },
        {
            title: "Peer Recognition",
            description: "Nominations from team members",
            icon: Award,
            count: 89,
            color: "bg-blue-50 text-blue-600 border-blue-200",
        },
        {
            title: "Gift Vouchers",
            description: "Redeemable gift cards and vouchers",
            icon: Gift,
            count: 34,
            color: "bg-green-50 text-green-600 border-green-200",
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and distribute employee rewards.
                    </p>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                    + New Reward
                </button>
            </div>

            {/* Reward Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {rewardCategories.map((category) => (
                    <div
                        key={category.title}
                        className={`rounded-xl border p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${category.color}`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{category.title}</h3>
                                <p className="text-sm mt-1 opacity-80">{category.description}</p>
                            </div>
                            <category.icon className="w-8 h-8 opacity-70" />
                        </div>
                        <p className="text-3xl font-bold mt-4">{category.count}</p>
                        <p className="text-sm opacity-70">rewards given this month</p>
                    </div>
                ))}
            </div>

            {/* Recent Rewards */}
            <div className="bg-white rounded-xl border shadow-sm mt-8 p-6">
                <h2 className="text-lg font-semibold">Recent Rewards</h2>
                <div className="mt-6 flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-400">Reward history will appear here</p>
                </div>
            </div>
        </div>
    );
}
