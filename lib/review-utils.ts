// ─── Review Feature Config & Helpers ──────────────────────────────────────────

export const RATING_LABELS: Record<number, string> = {
    1: "Poor",
    2: "Below Average",
    3: "Good",
    4: "Great",
    5: "Exceptional",
}

export const RATING_COLORS: Record<number, string> = {
    1: "text-red-500",
    2: "text-orange-400",
    3: "text-amber-500",
    4: "text-green-600",
    5: "text-indigo-600",
}

export function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}
