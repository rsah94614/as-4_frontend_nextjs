export type RewardType = "coupon" | "product";

export interface RewardCategory {
  category_id: string;
  category_name: string;
  category_code: string;
  is_active: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  type: RewardType;
  category_ids: string[];
  points_required: number;
  monetary_value: number;
  image?: string;
  bgColor?: string;
  is_active: boolean;
  is_out_of_stock?: boolean;
}