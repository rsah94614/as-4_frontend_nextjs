export interface RewardItem {
    id: string;
    title: string;
    type: "item" | "coupon";
    points_required: number;
    monetary_value: number;
    image?: string;
    is_out_of_stock: boolean;
    is_active: boolean;
    category_ids: string[];
    bgColor?: string;
}
