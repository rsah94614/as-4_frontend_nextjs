"use client";

import { useEffect, useRef, useState } from "react";
import { Coins } from "lucide-react";
import type { WalletData } from "@/types";

interface Props {
  wallet: WalletData | null;
}

/** Animated count-up from 0 to target value */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) {
      return;
    }

    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
    prevTarget.current = target;
  }, [target, duration]);

  return value;
}

export default function WalletBanner({ wallet }: Props) {
  if (!wallet) return null;

  const availablePoints = wallet.available_points;

  return <WalletBannerInner wallet={wallet} availablePoints={availablePoints} />;
}

/** Inner component so the hook always runs (no early return before hooks) */
function WalletBannerInner({
  wallet,
  availablePoints,
}: {
  wallet: WalletData;
  availablePoints: number;
}) {
  const displayPoints = useCountUp(availablePoints);
  const [glowing, setGlowing] = useState(false);
  const prevPoints = useRef(availablePoints);

  // Trigger glow when points change (e.g. after redemption)
  useEffect(() => {
    if (prevPoints.current !== availablePoints && prevPoints.current !== 0) {
      const startTimer = setTimeout(() => setGlowing(true), 50);
      const stopTimer = setTimeout(() => setGlowing(false), 3000);
      prevPoints.current = availablePoints;
      return () => {
        clearTimeout(startTimer);
        clearTimeout(stopTimer);
      };
    }
    prevPoints.current = availablePoints;
  }, [availablePoints]);

  return (
    <div className="animate-slide-down flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100 px-6 py-4 mb-10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Coins size={20} className="text-purple-700 animate-sparkle" />
        </div>
        <div>
          <p className="text-xs text-purple-600 font-medium">
            Available Balance
          </p>
          <p
            className={`text-2xl font-bold text-purple-800 leading-none transition-all duration-300 ${
              glowing ? "animate-pulse-glow" : ""
            }`}
          >
            {displayPoints.toLocaleString()}
            <span className="text-sm font-normal text-purple-400 ml-1.5">
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
