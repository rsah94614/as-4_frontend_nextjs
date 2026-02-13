export interface RewardCategory {
  category_id: string;
  category_name: string;
  category_code: string;
  description?: string;
  is_active: boolean;
}

export interface Coupon {
  coupon_id: string;
  coupon_name: string;
  category_id: string[];
  points_required: number;
  monetary_value: number;
  bgColor: string;
  is_active: boolean;
}

export interface Product {
  product_id: string;
  product_name: string;
  category_id: string;
  points_required: number;
  monetary_value: number;
  image: string;
  is_active: boolean;
}