"use client";

import { TicketPercent, Package } from "lucide-react";
import StockBadge from "@/components/features/redeem/StockBadge";
import { RewardItem } from "@/types/redeem-types";

interface Props {
  item: RewardItem;
  canAfford: boolean;
  onRedeem: (item: RewardItem) => void;
}

export default function RewardCard({ item, canAfford, onRedeem }: Props) {
  const outOfStock = item.stock_status === "Out of Stock";

  const isCoupon =
    item.category?.category_code?.toLowerCase().includes("coupon") ||
    item.reward_code?.toLowerCase().includes("coupon") ||
    item.reward_code?.toLowerCase().includes("voucher");

  const disabled = outOfStock || !canAfford;

  return (
    <div
      className={`group relative rounded-3xl border bg-white flex flex-col overflow-hidden transition-all duration-200
        ${
          disabled
            ? "opacity-60 cursor-not-allowed border-slate-100"
            : "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 border-slate-100 shadow-sm"
        }`}
    >
      <div
        className={`h-2 w-full ${
          isCoupon
            ? "bg-gradient-to-r from-amber-400 to-orange-400"
            : "bg-gradient-to-r from-indigo-400 to-violet-500"
        }`}
      />

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isCoupon ? "bg-amber-50" : "bg-indigo-50"
            }`}
          >
            {isCoupon ? (
              <TicketPercent size={22} className="text-amber-500" />
            ) : (
              <Package size={22} className="text-indigo-500" />
            )}
          </div>
          <StockBadge status={item.stock_status} />
        </div>

        <p className="font-semibold text-slate-800 text-sm leading-snug mb-1">
          {item.reward_name}
        </p>

        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {item.category && (
          <span className="inline-block text-[10px] font-medium bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 w-fit mb-3">
            {item.category.category_name}
          </span>
        )}

        <div className="mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">
                Points required
              </p>
              <p className="text-lg font-bold text-slate-800">
                {item.default_points.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  pts
                </span>
              </p>
              {item.min_points !== item.max_points && (
                <p className="text-[10px] text-slate-400">
                  {item.min_points.toLocaleString()} –{" "}
                  {item.max_points.toLocaleString()} range
                </p>
              )}
            </div>

            <button
              disabled={disabled}
              onClick={() => !disabled && onRedeem(item)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                disabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              }`}
            >
              {outOfStock
                ? "Sold out"
                : !canAfford
                ? "Not enough pts"
                : "Redeem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
