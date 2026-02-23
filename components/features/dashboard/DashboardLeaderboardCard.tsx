import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown } from "lucide-react"

interface DashboardLeaderboardCardProps {
    rank: number;
    name: string;
    initials: string;
    points: number;
    color: string;
    image?: string | null;
}

export default function DashboardLeaderboardCard({
    rank,
    name,
    initials,
    points,
    color,
    image,
}: DashboardLeaderboardCardProps) {
    return (
        <Card className={`border shadow-none rounded-3xl ${rank === 1 ? 'border-[#FFC107] bg-[#FFC1070D]' : 'border-[#d9d9d9]'}`}>
            <CardContent>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-xs w-4 shrink-0">
                        #{rank}
                    </span>

                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={image ?? undefined} />
                        <AvatarFallback className={`${color} text-white font-semibold`}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <span className="text-base font-medium text-gray-900 flex-1 truncate">
                        {name}
                        <br />
                        <span className="text-sm font-semibold text-[#00000083]">
                            {points.toLocaleString()} pts
                        </span>
                    </span>

                    {rank === 1 && (
                        <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}