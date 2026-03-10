import { Wallet as WalletIcon, Award, CalendarDays } from "lucide-react";

export function StatCard({
    label,
    value,
    sub,
    subValue,
    variant = "white",
}: {
    label: string;
    value: string | number;
    sub?: string;
    subValue?: string | number;
    variant?: "white" | "green" | "purple";
}) {
    const styles = {
        white: "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200",
        green: "bg-emerald-50/80 border-emerald-100 hover:bg-emerald-50 hover:shadow-md hover:border-emerald-200",
        purple: "bg-fuchsia-50/80 border-fuchsia-100 hover:bg-fuchsia-50 hover:shadow-md hover:border-fuchsia-200",
    }[variant];

    // Determine Icon
    const Icon = variant === 'green' ? WalletIcon : Award;
    const iconColor = variant === 'green' ? 'text-emerald-500' : 'text-gray-400';

    return (
        <div className={`rounded-3xl p-7 border transition-all duration-300 group ${styles}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 tracking-wide">{label}</p>
                    <h2 className="text-4xl font-bold mt-2 text-gray-900 tracking-tight group-hover:scale-[1.02] origin-left transition-transform">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </h2>
                </div>
                <div className={`p-3 rounded-2xl bg-white/60 shadow-sm border border-black/5 group-hover:scale-110 transition-transform ${iconColor}`}>
                    <Icon size={22} />
                </div>
            </div>
            {sub && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/5 text-sm font-medium text-gray-500">
                    <span>{sub}</span>
                    <span className="text-gray-700 font-semibold bg-white/60 px-2.5 py-1 rounded-lg">
                        {typeof subValue === "number" ? subValue.toLocaleString() : subValue}
                    </span>
                </div>
            )}
        </div>
    );
}

export function MonthYearCard({
    monthPoints,
    yearPoints,
}: {
    monthPoints: number;
    yearPoints: number;
}) {
    return (
        <div className="rounded-3xl p-7 bg-indigo-50/80 border border-indigo-100 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-indigo-700 tracking-wide">Period Summary</p>
                <div className="p-3 rounded-2xl bg-white/60 shadow-sm border border-black/5 group-hover:scale-110 transition-transform text-indigo-500">
                    <CalendarDays size={22} />
                </div>
            </div>
            <div className="flex flex-col gap-5 text-sm">
                <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50">
                    <span className="text-indigo-800 font-medium">This month</span>
                    <span className="text-xl font-bold text-indigo-950">
                        {monthPoints.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50">
                    <span className="text-indigo-800 font-medium">This year</span>
                    <span className="text-xl font-bold text-indigo-950">
                        {yearPoints.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
