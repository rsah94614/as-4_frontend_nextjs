import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"

import {
    Card,
    CardContent,
} from "@/components/ui/card"

interface DashboardCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    change?: string;
    changeLabel?: string;
    className?: string;
    iconBgColor?: string;
}

export default function DashboardCard({
    label,
    value,
    icon: Icon,
    change,
    changeLabel = "from last month",
    className,
    iconBgColor,
}: DashboardCardProps) {
    return (
        <Card className={cn("rounded-3xl border-0 shadow-none h-full", className)}>
            <CardContent className="px-6 py-4 flex flex-col gap-6">

                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm text-muted-foreground wrap-break-words">
                            {label}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold wrap-break-words">
                            {value}
                        </h2>
                    </div>

                    <div className={cn("p-3 rounded-xl shrink-0", iconBgColor ?? "bg-yellow-200")}>
                        <Icon className="text-blue-600 w-6 h-6" />
                    </div>
                </div>

                {change && (
                    <p className="text-sm text-green-600 font-medium">
                        {change} {changeLabel}
                    </p>
                )}

            </CardContent>
        </Card>
    );
}