"use client";

import { TicketPercent, Package } from "lucide-react";
import StockBadge from "@/components/features/redeem/StockBadge";
import { RewardItem } from "@/types/redeem-types";
import {
  CARD_CONTAINER,
  CARD_ENABLED,
  CARD_DISABLED,
  CARD_BODY,
  ICON_BOX,
  GRADIENT_PRIMARY,
  GRADIENT_PRIMARY_HOVER,
  GRADIENT_SECONDARY,
  ANIMATE_FADE_IN_UP,
} from "@/components/features/redeem/redeem-styles";

interface Props {
  item: RewardItem;
  canAfford: boolean;
  onRedeem: (item: RewardItem) => void;
  staggerIndex?: number;
}

export default function RewardCard({ item, canAfford, onRedeem, staggerIndex = 0 }: Props) {
  const outOfStock = item.stock_status === "Out of Stock";

  const isVoucher =
    item.category?.category_code?.toLowerCase().includes("voucher") ||
    item.reward_code?.toLowerCase().includes("voucher");

  const disabled = outOfStock || !canAfford;

  const staggerDelay = `stagger-${Math.min(staggerIndex + 1, 8)}`;

  return (
    <div
      className={`${CARD_CONTAINER} ${disabled ? CARD_DISABLED : CARD_ENABLED} ${ANIMATE_FADE_IN_UP} ${staggerDelay}`}
    >
      {/* Top gradient stripe with shimmer on hover */}
      <div
        className={`h-2 w-full hover-gradient-shimmer transition-all duration-300 ${
          isVoucher ? GRADIENT_SECONDARY : GRADIENT_PRIMARY
        }`}
      />

      <div className={CARD_BODY}>
        <div className="flex items-start justify-between mb-3">
          <div
            className={`${ICON_BOX} transition-transform duration-200 group-hover:scale-110 ${
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
              <p className={`text-lg font-bold text-slate-800 transition-all duration-300 ${
                canAfford && !outOfStock ? "group-hover:text-purple-700" : ""
              }`}>
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
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                disabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : `${GRADIENT_PRIMARY} text-white ${GRADIENT_PRIMARY_HOVER} active:scale-95 hover:shadow-md hover:shadow-purple-200`
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
