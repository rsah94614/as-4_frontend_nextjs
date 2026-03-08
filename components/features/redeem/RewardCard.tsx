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

  const isVoucher =
    item.category?.category_code?.toLowerCase().includes("voucher") ||
    item.reward_code?.toLowerCase().includes("voucher");

  const disabled = outOfStock || !canAfford;

  return (
    <div
      className={`group relative rounded-3xl border bg-white flex flex-col overflow-hidden transition-all duration-200
        ${
          disabled
            ? "opacity-60 cursor-not-allowed border-slate-100"
            : "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-200 border-slate-100 shadow-sm"
        }`}
    >
      <div
        className={`h-2 w-full ${
          isVoucher
            ? "bg-gradient-to-r from-fuchsia-500 to-purple-600"
            : "bg-gradient-to-r from-purple-700 to-fuchsia-600"
        }`}
      />

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isVoucher ? "bg-fuchsia-50" : "bg-purple-50"
            }`}
          >
            {isVoucher ? (
              <TicketPercent size={22} className="text-fuchsia-600" />
            ) : (
              <Package size={22} className="text-purple-600" />
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
                  : "bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white hover:from-purple-800 hover:to-fuchsia-700 active:scale-95"
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
