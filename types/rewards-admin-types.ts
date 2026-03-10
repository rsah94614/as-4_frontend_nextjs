export interface RewardCategory {
  category_id: string;
  category_name: string;
  category_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminRewardItem {
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
