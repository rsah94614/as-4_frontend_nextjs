export interface CategoryInfo {
  category_id: string;
  category_name: string;
  category_code: string;
}

export interface RewardItem {
  catalog_id: string;
  reward_name: string;
  reward_code: string;
  description: string | null;
  default_points: number;
  min_points: number;
  max_points: number;
  is_active: boolean;
  created_at: string;
  stock_status: string;
  available_stock: number;
  category: CategoryInfo | null;
}

export interface PaginatedCatalogResponse {
  data: RewardItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface WalletData {
  wallet_id: string;
  employee_id: string;
  available_points: number;
  redeemed_points: number;
  total_earned_points: number;
}

export interface RedemptionResponse {
  history_id: string;
  points: number;
  granted_at: string;
  status: string;
  new_stock_level: number | null;
}

export type DialogState =
  | { phase: "confirm"; item: RewardItem }
  | { phase: "loading" }
  | { phase: "success"; result: RedemptionResponse; itemName: string; pts: number }
  | { phase: "error"; message: string };