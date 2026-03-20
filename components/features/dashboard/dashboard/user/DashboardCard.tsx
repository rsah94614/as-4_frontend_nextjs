import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatMonthComparison } from "@/lib/dashboard-utils";
import { type Metric } from "@/types/dashboard-types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardCardProps {
    label: string;
    icon: LucideIcon;
    stat?: Metric;
    loading?: boolean;
    className?: string;
}

export default function DashboardCard({
    label,
    icon: Icon,
    stat,
    loading = false,
    className,
}: DashboardCardProps) {
    if (loading) {
        return (
            <div className={cn(
                "relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br animate-pulse",
                "from-[#004C8F] to-[#1D6EC5]",
                className,
            )}>
                {/* Decorative circles — same as real card */}
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10" />

                {/* Icon badge + trend pill row */}
                <div className="relative flex items-start justify-between mb-5">
                    <div className="bg-white/20 rounded-xl w-10 h-10" />
                    <div className="bg-white/20 rounded-full w-16 h-6" />
                </div>

                {/* Number + label */}
                <div className="relative space-y-2">
                    <div className="bg-white/20 rounded-lg h-9 w-24" />
                    <div className="bg-white/20 rounded h-3.5 w-28" />
                </div>
            </div>
        );
    }

    const value = formatNumber(stat?.value ?? null);
    const change = formatMonthComparison(stat?.this_month ?? null, stat?.last_month ?? null);
    const isUp = change !== "—" && !change.startsWith("-");
    const isDown = change.startsWith("-");

    return (
        <div className={cn(
            "relative rounded-2xl p-5 text-white overflow-hidden bg-gradient-to-br",
            "from-[#004C8F] to-[#1D6EC5]",
            className,
        )}>
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10" />

            <div className="relative flex items-start justify-between mb-5">
                <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change !== "—" && (
                    <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full",
                        isDown ? "bg-red-500/30 text-red-100" : "bg-white/20 text-white",
                    )}>
                        {isUp && <TrendingUp className="w-3 h-3" />}
                        {isDown && <TrendingDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>

            <div className="relative">
                <h2 className="text-4xl font-black tracking-tight tabular-nums leading-none mb-1">
                    {value}
                </h2>
                <p className="text-white/70 text-sm font-medium">{label}</p>
            </div>
        </div>
    );
}
