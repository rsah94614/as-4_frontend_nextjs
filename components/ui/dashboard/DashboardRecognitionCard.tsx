import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardRecognitionCardProps {
    id: number;
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

                    {/* Small Left Column */}
                    <div className="shrink-0">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={image ?? undefined} />
                            <AvatarFallback><img src="/avatar.png" alt="avatar" /></AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Large Right Column */}
                    <div className="flex-1 flex flex-col gap-3">
                        <div>
                            <p className="text-base">
                                <span className="font-bold">
                                    Congratulations!
                                </span>{" "}
                                You received recognition!


                            </p>
                            <span className="text-xs">2 Hours Ago</span>
                        </div>
                        <div className="text-base">
                            Outstanding work on the Q1 presentation! Your attention to detail and clear communication really impressed the clients.
                        </div>

                        <div className="flex gap-3">
                            <span className="px-4 py-1.5 text-xs  text-white bg-[#8B5CF6] rounded-full">
                                #Teamwork
                            </span>
                            <span className="px-4 py-1.5 text-xs  text-white bg-[#8B5CF6] rounded-full">
                                #Collaboration
                            </span>
                        </div>





                    </div>

                </div>
            </CardContent>

        </Card>
    );
}