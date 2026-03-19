import type { HistoryItem, PeriodFilter, TypeFilter } from "../types/history-types";

const GIFT_CARD_KEYWORDS = [
    "AMAZON",
    "FLIPKART",
    "MYNTRA",
    "NYKAA",
    "SWIGGY",
    "ZOMATO",
    "UBER",
    "PVR",
    "GIFT CARD",
    "VOUCHER",
];

const MERCHANDISE_KEYWORDS = [
    "MERCH",
    "MERCHANDISE",
    "EARBUD",
    "EARPHONE",
    "HEADPHONE",
    "SPEAKER",
    "WATCH",
    "BOTTLE",
    "MUG",
    "BAG",
    "BACKPACK",
    "TSHIRT",
    "T-SHIRT",
    "HOODIE",
    "LAPTOP",
    "PHONE",
    "TABLET",
    "KEYBOARD",
    "MOUSE",
    "POWER BANK",
    "BLENDER",
    "APPLIANCE",
];

const EXPERIENCE_KEYWORDS = [
    "EXPERIENCE",
    "WORKSHOP",
    "COURSE",
    "LEARNING",
    "TRAINING",
    "CLASS",
    "EVENT",
    "TRIP",
    "ADVENTURE",
    "GETAWAY",
];

const WELLNESS_KEYWORDS = [
    "WELLNESS",
    "FITNESS",
    "HEALTH",
    "GYM",
    "YOGA",
    "SPA",
    "CARE",
    "THERAPY",
];

function containsKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
}

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
function getRewardCategory(
    rewardCode: string,
    rewardName?: string,
    categoryCode?: string,
    categoryName?: string
): TypeFilter {
    const code = rewardCode.toUpperCase();
    const name = rewardName?.toUpperCase() ?? "";
    const categoryCodeValue = categoryCode?.toUpperCase() ?? "";
    const categoryNameValue = categoryName?.toUpperCase() ?? "";
    const haystack = `${code} ${name} ${categoryCodeValue} ${categoryNameValue}`;

    // Gift Cards
    if (
        code.startsWith("REW-AMZ") ||
        code.startsWith("REW-FLIP") ||
        categoryCodeValue.includes("GIFT") ||
        categoryCodeValue.includes("VOUCHER") ||
        categoryNameValue.includes("GIFT") ||
        categoryNameValue.includes("VOUCHER") ||
        code.includes("VOUCHER") ||
        containsKeyword(haystack, GIFT_CARD_KEYWORDS)
    )
        return "Gift Cards";

    // Merchandise
    if (
        code.startsWith("REW-MERCH") ||
        categoryCodeValue.includes("MERCH") ||
        categoryNameValue.includes("MERCH") ||
        containsKeyword(haystack, MERCHANDISE_KEYWORDS)
    )
        return "Merchandise";

    // Experiences (learning + experiential)
    if (
        code.startsWith("REW-LEARN") ||
        code.startsWith("REW-EXP") ||
        categoryCodeValue.includes("EXP") ||
        categoryCodeValue.includes("LEARN") ||
        categoryNameValue.includes("EXPERIENCE") ||
        categoryNameValue.includes("LEARNING") ||
        containsKeyword(haystack, EXPERIENCE_KEYWORDS)
    )
        return "Experiences";

    // Wellness
    if (
        code.startsWith("REW-WELL") ||
        categoryCodeValue.includes("WELL") ||
        categoryNameValue.includes("WELL") ||
        containsKeyword(haystack, WELLNESS_KEYWORDS)
    )
        return "Wellness";

    // Fallback — unknown category, return "All" so it's always visible
    return "All";
}

/** Returns true if the item matches the chosen transaction-type filter */
export function matchesType(item: HistoryItem, type: TypeFilter): boolean {
    if (type === "All") return true;

    // Points-earned transactions (no reward_catalog) don't belong to any reward category
    if (!item.reward_catalog) return false;

    // Match by reward_code category, with reward_name heuristics for wallet fallback rows
    return getRewardCategory(
        item.reward_catalog.reward_code,
        item.reward_catalog.reward_name,
        item.reward_catalog.category_code,
        item.reward_catalog.category_name
    ) === type;
}

/** Derives a human-readable message for a history row */
export function getMessage(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    return item.comment ?? "Points awarded";
}
