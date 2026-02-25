"use client";

import { Coins } from "lucide-react";
import { WalletData } from "@/types/redeem-types";

interface Props {
  wallet: WalletData | null;
}

export default function WalletBanner({ wallet }: Props) {
  if (!wallet) return null;

  const availablePoints = wallet.available_points;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-indigo-50 border border-indigo-100 px-6 py-4 mb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Coins size={20} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-xs text-indigo-500 font-medium">
            Available Balance
          </p>
          <p className="text-2xl font-bold text-indigo-800 leading-none">
            {availablePoints.toLocaleString()}
            <span className="text-sm font-normal text-indigo-400 ml-1.5">
              pts
            </span>
          </p>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-xs text-slate-400">Total earned</p>
        <p className="text-sm font-semibold text-slate-600">
          {wallet.total_earned_points.toLocaleString()} pts
        </p>
        <p className="text-xs text-slate-400">
          Redeemed: {wallet.redeemed_points.toLocaleString()} pts
        </p>
      </div>
    </div>
  );
}
