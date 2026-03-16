import type { HistoryItem, PeriodFilter, TypeFilter } from "../types/history-types";

/** Returns true if the item matches the chosen period filter */
export function matchesPeriod(item: HistoryItem, period: PeriodFilter): boolean {
    if (period === "All History") return true;
    if (period === "Redeem History") return !!item.reward_catalog;
    if (period === "Points History") return !item.reward_catalog;
    return true;
}

/** Returns true if the item matches the chosen transaction-type filter */
export function matchesType(item: HistoryItem, type: TypeFilter): boolean {
    if (type === "All") return true;
    
    // If filtering by a specific reward type (e.g., "Gift Voucher"), 
    // it must be a redemption (has reward_catalog) and match the name.
    // If it's a points transaction (no reward_catalog), it does not match a reward type filter.
    if (!item.reward_catalog) return false;
    
    const name = item.reward_catalog.reward_name?.toLowerCase() ?? "";
    return name.includes(type.toLowerCase());
}

/** Derives a human-readable message for a history row */
export function getMessage(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    return item.comment ?? "Points awarded";
}
