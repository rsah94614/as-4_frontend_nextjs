import type { HistoryItem, PeriodFilter, TypeFilter } from "../types/history-types";

/** Returns true if the item matches the chosen period filter */
export function matchesPeriod(item: HistoryItem, period: PeriodFilter): boolean {
    if (period === "All History") return true;
    if (period === "Redeem History") return !!item.reward_catalog;
    if (period === "Points History") return !item.reward_catalog;
    return true;
}

/**
 * Maps a reward_code prefix to its category.
 *
 * Reward codes follow the pattern: REW-{CATEGORY}-{ITEM}
 *   - REW-AMZ-*, REW-FLIP-*   → Gift Cards
 *   - REW-MERCH-*              → Merchandise
 *   - REW-LEARN-*, REW-EXP-*  → Experiences
 *   - REW-WELL-*               → Wellness
 */
function getRewardCategory(rewardCode: string): TypeFilter {
    const code = rewardCode.toUpperCase();

    // Gift Cards
    if (code.startsWith("REW-AMZ") || code.startsWith("REW-FLIP"))
        return "Gift Cards";

    // Merchandise
    if (code.startsWith("REW-MERCH"))
        return "Merchandise";

    // Experiences (learning + experiential)
    if (code.startsWith("REW-LEARN") || code.startsWith("REW-EXP"))
        return "Experiences";

    // Wellness
    if (code.startsWith("REW-WELL"))
        return "Wellness";

    // Fallback — unknown category, return "All" so it's always visible
    return "All";
}

/** Returns true if the item matches the chosen transaction-type filter */
export function matchesType(item: HistoryItem, type: TypeFilter): boolean {
    if (type === "All") return true;

    // Points-earned transactions (no reward_catalog) don't belong to any reward category
    if (!item.reward_catalog) return false;

    // Match by reward_code category
    return getRewardCategory(item.reward_catalog.reward_code) === type;
}

/** Derives a human-readable message for a history row */
export function getMessage(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    return item.comment ?? "Points awarded";
}
