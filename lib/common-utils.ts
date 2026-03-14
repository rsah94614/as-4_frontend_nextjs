
export function scoreColor(score: number) {
    if (score >= 75) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", label: "Excellent" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-400", label: "Good" };
    if (score >= 25) return { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-400", label: "Fair" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", label: "Needs Attention" };
}