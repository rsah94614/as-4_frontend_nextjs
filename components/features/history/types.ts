export interface RewardCatalog {
    reward_name: string;
    reward_code: string;
}

export interface HistoryItem {
    history_id: string;
    points: number;
    comment?: string;
    granted_at: string;
    reward_catalog?: RewardCatalog;
}

export interface PaginatedHistoryResponse {
    data: HistoryItem[];
    total_items: number;
    page: number;
    size: number;
}

export type PeriodFilter = "All History" | "Redeem History" | "Points History";
export type TypeFilter = "All" | "Gift Voucher" | "Spot Award" | "Merchandises";
