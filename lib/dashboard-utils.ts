/**
 * Dashboard utility functions.
 * Extracted from the dashboard page for reusability and testability.
 */

export function formatNumber(n: number | null): string {
    if (n === null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export function formatGrowth(pct: number | null): string | undefined {
    if (pct === null || pct === undefined) return undefined;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct}%`;
}
