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
}

export default function DashboardLeaderboardCard({
    rank,
    name,
    initials,
    points,
    color,
}: DashboardLeaderboardCardProps) {
    return (
        <Card className={`border shadow-none rounded-3xl ${rank === 1 ? 'border-[#FFC107] bg-[#FFC1070D]' : 'border-[#d9d9d9]'}`}>
            <CardContent>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-xs">
                        #{rank}
                    </span>

                    <Avatar className="h-12 w-12">
                        <AvatarImage src={undefined} />
                        <AvatarFallback><img src="/avatar.png" alt="avatar" /></AvatarFallback>
                    </Avatar>

                    <span className="text-base font-medium text-gray-900 flex-1 truncate">
                        {name}
                        <br />
                        <span className="text-sm font-semibold text-[#00000083]">
                            {points} pts
                        </span>
                    </span>

                    {rank === 1 && (
                        <span className="text-xl" role="img" aria-label="crown">
                            <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </span>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}
