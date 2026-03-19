export interface RewardCatalog {
    reward_name: string;
    reward_code: string;
    category_name?: string;
    category_code?: string;
}

export interface HistoryTypeOption {
    value: string;
    label: string;
}

export interface GrantedByEmployee {
    username: string;
    email?: string;
}

export interface HistoryItem {
    history_id: string;
    points: number;
    comment?: string;
    granted_at: string;
    reward_catalog?: RewardCatalog;
    employees_reward_history_granted_byToemployees?: GrantedByEmployee;
}

export interface PaginatedHistoryResponse {
    data: HistoryItem[];
    total_items: number;
    page: number;
    size: number;
}

export type PeriodFilter = "All History" | "Redeem History" | "Points History";
export type TypeFilter = "All" | string;
