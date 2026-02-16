"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { TicketPercent, ChevronLeft, ChevronRight } from "lucide-react";
import { coupons, mostRedeemedProducts, rewardCategories } from "./data";

export default function RedeemPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const carouselRef = useRef<HTMLDivElement>(null);

  /* ================= SCROLL FUNCTION ================= */
  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = 300;

    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  /* ================= FILTER COUPONS ================= */
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      if (!coupon.is_active) return false;
      if (!selectedCategory) return true;

      // 🔥 Supports multiple categories
      return coupon.category_id.includes(selectedCategory);
    });
  }, [selectedCategory]);

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    return mostRedeemedProducts.filter((product) => {
      if (!product.is_active) return false;
      if (!selectedCategory) return true;

      return product.category_id === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="flex-1">
        <div className="bg-white rounded-[36px] px-10 py-12 min-h-full max-w-[1200px] mx-auto">
          {/* ================= CATEGORY DROPDOWN ================= */}
          <div className="mb-10">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Reward Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-[280px] h-[42px] rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Categories</option>

              {rewardCategories
                .filter((cat) => cat.is_active)
                .map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
            </select>
          </div>

          {/* ================= COUPONS ================= */}
          <h2 className="text-[22px] font-semibold text-gray-900 mb-8">
            Coupons
          </h2>

          <div className="relative mb-12">
            {/* LEFT ARROW */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
            >
              <ChevronLeft size={20} />
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
            >
              <ChevronRight size={20} />
            </button>

            {/* SCROLL CONTAINER */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x px-10"
            >
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <div
                    key={coupon.coupon_id}
                    className="flex-shrink-0 snap-item"
                  >
                    <Card
                      className="w-[240px] h-[215px] p-6 rounded-[28px] shadow border-0 transition hover:scale-[1.03]"
                      style={{ backgroundColor: coupon.bgColor }}
                    >
                      <CardContent className="h-full flex flex-col items-left justify-center text-left gap-4">
                        <TicketPercent
                          className="mx-auto"
                          size={65}
                          strokeWidth={2.5}
                        />

                        <div>
                          <p className="font-semibold text-[16px]">
                            {coupon.coupon_name}
                          </p>

                          <p className="text-[11px] text-gray-700">
                            {coupon.points_required.toLocaleString()} points
                          </p>
                        </div>

                        <div className="text-[11px]  font-medium">
                          ₹{coupon.monetary_value.toLocaleString()} each
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-4">
                  No coupons available.
                </p>
              )}
            </div>
          </div>

          {/* ================= MOST REDEEMED ================= */}
          <h2 className="text-[22px] font-semibold text-gray-900 mb-6">
            Most Redeemed
          </h2>

          <div className="flex gap-6 flex-wrap">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="w-[200px] h-[215px] rounded-[28px] bg-white border shadow-sm"
                >
                  <CardContent className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="w-20 object-contain"
                    />

                    <div>
                      <p className="font-semibold text-[16px]">
                        {product.product_name}
                      </p>

                      <p className="text-[11px] text-gray-600">
                        {product.points_required.toLocaleString()} points
                      </p>
                    </div>

                    <p className="text-[11px] font-medium">
                      Worth ₹{product.monetary_value.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No most redeemed items available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
