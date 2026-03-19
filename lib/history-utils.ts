import type { HistoryItem, PeriodFilter, TypeFilter } from "../types/history-types";

function normalizeFilterValue(value?: string | null): string {
    return value?.trim().toLowerCase() ?? "";
}

/** Returns true if the item matches the chosen period filter */
export function matchesPeriod(item: HistoryItem, period: PeriodFilter): boolean {
    if (period === "All History") return true;
    if (period === "Redeem History") return !!item.reward_catalog;
    if (period === "Points History") return !item.reward_catalog;
    return true;
}

export function getHistoryCategoryValue(item: HistoryItem): string | null {
    const categoryCode = item.reward_catalog?.category_code?.trim();
    if (categoryCode) {
        return categoryCode;
    }

    const categoryName = item.reward_catalog?.category_name?.trim();
    if (categoryName) {
        return categoryName;
    }

    return null;
}

export function getHistoryCategoryLabel(item: HistoryItem): string | null {
    const categoryName = item.reward_catalog?.category_name?.trim();
    if (categoryName) {
        return categoryName;
    }

    const categoryCode = item.reward_catalog?.category_code?.trim();
    if (categoryCode) {
        return categoryCode;
    }

    return null;
}

/** Returns true if the item matches the chosen transaction-type filter */
export function matchesType(item: HistoryItem, type: TypeFilter): boolean {
    if (type === "All") return true;
    return normalizeFilterValue(getHistoryCategoryValue(item)) === normalizeFilterValue(type);
}

/** Derives a human-readable message for a history row */
export function getMessage(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    return item.comment ?? "Points awarded";
}
