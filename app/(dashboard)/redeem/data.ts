import { Coupon, Product, RewardCategory } from "./models";

/* ================= REWARD CATEGORIES ================= */

export const rewardCategories: RewardCategory[] = [
  {
    category_id: "550e8400-e29b-41d4-a716-446655440000",
    category_name: "Electronics",
    category_code: "ELEC",
    description: "Electronic gadgets",
    is_active: true,
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655440001",
    category_name: "Fashion",
    category_code: "FASH",
    description: "Clothing and lifestyle",
    is_active: true,
  },
  {
    category_id: "550e8400-e29b-41d4-a716-446655440002",
    category_name: "Food",
    category_code: "FOOD",
    description: "Food and dining vouchers",
    is_active: true,
  },
];

/* ================= COUPONS ================= */

export const coupons: Coupon[] = [
  {
    coupon_id: "flipkart-1",
    coupon_name: "Flipkart Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440000",
                  "550e8400-e29b-41d4-a716-446655440001",], // Electronics & Fashion
    points_required: 15000,
    monetary_value: 2000,
    bgColor: "#BFF4BB",
    is_active: true,
  },
  {
    coupon_id: "myntra-1",
    coupon_name: "Myntra Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",], // Fashion
    points_required: 10000,
    monetary_value: 2000,
    bgColor: "#DAC9FF",
    is_active: true,
  },
  {
    coupon_id: "zomato-1",
    coupon_name: "Zomato Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440002",], // Food
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
  {
    coupon_id: "amazon-1",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-2",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-3",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-4",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-5",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-6",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
   {
    coupon_id: "amazon-7",
    coupon_name: "Amazon Coupon",
    category_id: ["550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440000"], // Fashion & Electronics
    points_required: 15000,
    monetary_value: 500,
    bgColor: "#EFB3CC",
    is_active: true,
  },
  
];

/* ================= MOST REDEEMED PRODUCTS ================= */

export const mostRedeemedProducts: Product[] = [
  {
    product_id: "iphone16",
    product_name: "iPhone 16 Pro",
    category_id: "550e8400-e29b-41d4-a716-446655440000", // Electronics
    points_required: 50000,
    monetary_value: 79990,
    image: "/images/Iphone.png",
    is_active: true,
  },
  {
    product_id: "nike-shoes",
    product_name: "Nike Air Max Sneakers",
    category_id: "550e8400-e29b-41d4-a716-446655440001", // Fashion
    points_required: 25000,
    monetary_value: 12999,
    image: "/images/nike.png",
    is_active: true,
  },
  {
    product_id: "swiggy-voucher",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-1",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-2",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-3",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-4",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-5",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-6",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-7",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-8",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-9",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
   {
    product_id: "swiggy-voucher-10",
    product_name: "Swiggy Premium Voucher",
    category_id: "550e8400-e29b-41d4-a716-446655440002", // Food
    points_required: 8000,
    monetary_value: 1000,
    image: "/images/swiggy.png",
    is_active: true,
  },
  
];