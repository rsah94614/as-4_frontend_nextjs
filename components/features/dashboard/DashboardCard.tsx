import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatGrowth } from "@/lib/dashboard-utils";

interface StatValue {
    value: number | null;
    growth_percent: number | null;
}

interface DashboardCardProps {
    label: string;
    icon: LucideIcon;
    stat?: StatValue;
    loading?: boolean;
    changeLabel?: string;
    className?: string;
    iconBgColor?: string;
}

export default function DashboardCard({
    label,
    icon: Icon,
    stat,
    loading = false,
    changeLabel = "from last month",
    className,
    iconBgColor,
}: DashboardCardProps) {
    const value = formatNumber(stat?.value ?? null);
    const change = formatGrowth(stat?.growth_percent ?? null);

    return (
        <Card className={cn("rounded-3xl border-0 shadow-none h-full", className)}>
            <CardContent className="px-6 py-4 flex flex-col gap-6">

                {loading ? (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-40 rounded-lg" />
                    </div>
                ) : (
                    <>
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
                            <p className={cn(
                                "text-sm font-medium",
                                change.startsWith("-") ? "text-red-500" : "text-green-600"
                            )}>
                                {change} {changeLabel}
                            </p>
                        )}
                    </>
                )}

            </CardContent>
        </Card>
    );
}