import { Wallet } from "lucide-react";
import type { WalletInfo } from "@/types/profile-types";

interface ProfileWalletProps {
    wallet: WalletInfo;
}

export default function ProfileWallet({ wallet }: ProfileWalletProps) {
    const stats = [
        { label: "Available", value: wallet.available_points, color: "text-purple-700" },
        { label: "Redeemed", value: wallet.redeemed_points, color: "text-fuchsia-600" },
        { label: "Total Earned", value: wallet.total_earned_points, color: "text-green-600" },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center border">
                    <Wallet className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label} Points</p>
                </div>
            ))}
        </div>
    );
}
