export interface Category {
    category_id: string;
    category_name: string;
    category_code: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateCategoryPayload {
    category_name: string;
    category_code: string;
    description?: string;
}

export interface UpdateCategoryPayload {
    category_name: string;
    description?: string;
    is_active: boolean;
}

export interface RewardItem {
    catalog_id: string;
    reward_name: string;
    reward_code: string;
    description?: string;
    default_points: number;
    min_points: number;
    max_points: number;
    is_active: boolean;
    created_at: string;
    stock_status: string;
    available_stock: number;
    category?: {
        category_id: string;
        category_name: string;
        category_code: string;
    };
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export type CategoryFilter = "all" | "active" | "inactive";
