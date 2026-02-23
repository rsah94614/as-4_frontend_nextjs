import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardRecognitionCardProps {
    id: string;
    from: string;
    fromInitials: string;
    to: string;
    toInitials: string;
    message: string;
    points: number;
    time: string;
    color: string;
    image: string | null;
}

export default function DashboardRecognitionCard({
    from,
    fromInitials,
    to,
    message,
    points,
    time,
    color,
    image,
}: DashboardRecognitionCardProps) {
    return (
        <Card className="border border-[#d9d9d9] shadow-none rounded-3xl p-3">
            <CardContent className="p-0">
                <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={image ?? undefined} />
                            <AvatarFallback className={`${color} text-white font-semibold`}>
                                {fromInitials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                        <div>
                            <p className="text-base">
                                <span className="font-bold">{from}</span>
                                {" recognised "}
                                <span className="font-bold">{to}</span>
                            </p>
                            <span className="text-xs text-gray-400">{time}</span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{message}</p>

                        {points > 0 && (
                            <div className="flex gap-3">
                                <span className="px-4 py-1.5 text-xs text-white bg-[#8B5CF6] rounded-full">
                                    +{points} pts
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}