"use client";

import { TicketPercent, Package } from "lucide-react";
import StockBadge from "@/components/features/dashboard/redeem/StockBadge";
import { RewardItem } from "@/types/redeem-types";
import {
  CARD_CONTAINER,
  CARD_ENABLED,
  CARD_DISABLED,
  CARD_BODY,
  ICON_BOX,
  GRADIENT_PRIMARY,
  GRADIENT_PRIMARY_HOVER,
  ANIMATE_FADE_IN_UP,
} from "@/components/features/dashboard/redeem/redeem-styles";

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


      <div className={CARD_BODY}>
        <div className="flex items-start justify-between mb-3">
          <div
            className={`${ICON_BOX} transition-transform duration-200 group-hover:scale-110 ${isVoucher ? "bg-fuchsia-50" : "bg-blue-50"
              }`}
          >
            {isVoucher ? (
              <TicketPercent size={22} className="text-fuchsia-600" />
            ) : (
              <Package size={22} className="text-blue-600" />
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
              <p className={`text-lg font-bold text-slate-800 transition-all duration-300 ${canAfford && !outOfStock ? "group-hover:text-slate-600" : ""
                }`}>
                {item.default_points.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  pts
                </span>
              </p>
            </div>

            <button
              disabled={disabled}
              onClick={() => !disabled && onRedeem(item)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 border ${disabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border-transparent"
                  : "bg-slate-600 text-white border-[#1E293B] hover:bg-slate-500 active:scale-95 hover:shadow-md hover:shadow-slate-200"
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
