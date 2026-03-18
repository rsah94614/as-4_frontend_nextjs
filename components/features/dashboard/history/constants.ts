import type { PeriodFilter, TypeFilter } from "@/types/history-types";

export const PAGE_SIZE = 10;

export const periodOptions: PeriodFilter[] = [
    "All History",
    "Points History",
    "Redeem History",
];

export const typeOptions: TypeFilter[] = [
    "All",
    "Gift Cards",
    "Merchandise",
    "Experiences",
    "Wellness",
];
