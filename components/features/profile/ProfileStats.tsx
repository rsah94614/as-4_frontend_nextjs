import { Award, Gift, Star } from "lucide-react";
import type { WalletInfo } from "@/types/profile-types";

interface ProfileStatsProps {
    wallet?: WalletInfo;
}

export default function ProfileStats({ wallet }: ProfileStatsProps) {
    const stats = [
        {
            icon: <Award className="w-6 h-6 text-amber-500" />,
            label: "Recognitions",
            value: wallet ? Math.floor(wallet.total_earned_points / 200) || 5 : 5,
            subtext: "Received",
            bg: "bg-amber-50",
            border: "border-amber-100"
        },
        {
            icon: <Gift className="w-6 h-6 text-fuchsia-500" />,
            label: "Rewards",
            value: wallet ? Math.floor(wallet.redeemed_points / 500) || 2 : 2,
            subtext: "Redeemed",
            bg: "bg-fuchsia-50",
            border: "border-fuchsia-100"
        },
        {
            icon: <Star className="w-6 h-6 text-indigo-500" />,
            label: "Rating",
            value: "4.8",
            subtext: "Average",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-b border-gray-100">
            {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md group">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.border} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
