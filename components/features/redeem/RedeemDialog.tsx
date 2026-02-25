"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Loader2, CheckCircle2, XCircle, X } from "lucide-react";

import { redeemReward } from "@/services/redeem-api";
import { DialogState, RedemptionResponse } from "@/types/redeem-types";

interface Props {
  state: DialogState | null;
  availablePoints: number;
  walletId: string;
  onClose: () => void;
  onSuccess: (result: RedemptionResponse, ptsSpent: number) => void;
}

export default function RedeemDialog({
  state,
  availablePoints,
  walletId,
  onClose,
  onSuccess,
}: Props) {
  const [comment, setComment] = useState("");
  const [innerState, setInnerState] = useState<DialogState | null>(state);

  useEffect(() => {
    setInnerState(state);
    setComment("");
  }, [state]);

  if (!state || !innerState) return null;

  async function handleConfirm() {
    if (innerState.phase !== "confirm") return;

    const item = innerState.item;
    setInnerState({ phase: "loading" });

    try {
      const result = await redeemReward(
        walletId,
        item.catalog_id,
        item.default_points,
        comment || undefined
      );

      setInnerState({
        phase: "success",
        result,
        itemName: item.reward_name,
        pts: item.default_points,
      });

      onSuccess(result, item.default_points);
    } catch (e) {
      setInnerState({
        phase: "error",
        message: e instanceof Error ? e.message : "Redemption failed",
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ───────── CONFIRM PHASE ───────── */}
        {innerState.phase === "confirm" && (
          <>
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <ShoppingBag size={22} className="text-indigo-600" />
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Confirm Redemption
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                Youre about to redeem this reward from your points balance.
              </p>

              {/* Item summary */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                <p className="font-semibold text-slate-800 text-sm mb-1">
                  {innerState.item.reward_name}
                </p>

                {innerState.item.description && (
                  <p className="text-xs text-slate-400 mb-3">
                    {innerState.item.description}
                  </p>
                )}

                <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>Cost</span>
                  <span className="font-bold text-slate-800">
                    {innerState.item.default_points.toLocaleString()} pts
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                  <span>Balance after</span>
                  <span
                    className={`font-bold ${
                      availablePoints - innerState.item.default_points < 0
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {(
                      availablePoints - innerState.item.default_points
                    ).toLocaleString()}{" "}
                    pts
                  </span>
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Note (optional)
                </label>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. for team lunch"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                  text-slate-800 placeholder:text-slate-400 focus:outline-none
                  focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                />
              </div>
            </div>

            <div className="px-7 pb-7 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold
                text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold
                text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {/* ───────── LOADING PHASE ───────── */}
        {innerState.phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 px-7">
            <Loader2 size={36} className="text-indigo-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500 font-medium">
              Processing redemption…
            </p>
          </div>
        )}

        {/* ───────── SUCCESS PHASE ───────── */}
        {innerState.phase === "success" && (
          <div className="flex flex-col items-center text-center px-7 py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Redemption Successful!
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-semibold text-slate-700">
                {innerState.itemName}
              </span>{" "}
              has been redeemed.
            </p>

            <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6 text-left">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Points spent</span>
                <span className="font-bold text-slate-800">
                  −{innerState.pts.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Reference</span>
                <span className="font-mono text-slate-600 text-[10px]">
                  {innerState.result.history_id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold
              text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* ───────── ERROR PHASE ───────── */}
        {innerState.phase === "error" && (
          <div className="flex flex-col items-center text-center px-7 py-10">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Redemption Failed
            </h3>
            <p className="text-sm text-red-500 mb-6">{innerState.message}</p>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold
              text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
