"use client";

import { useState } from "react";
import { ShoppingBag, Loader2, CheckCircle2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { redeemReward } from "@/services/redeem-api";
import { DialogState, RedemptionResponse } from "@/types/redeem-types";

type Phase = "confirm" | "loading" | "success" | "error";

interface Props {
  open: boolean;
  state: DialogState | null;
  availablePoints: number;
  walletId: string;
  onClose: () => void;
  onSuccess: (result: RedemptionResponse, ptsSpent: number) => void;
}

/* ─────────── Inner body – remounted via key when dialog opens ─────────── */

function RedeemDialogBody({
  state,
  availablePoints,
  walletId,
  onClose,
  onSuccess,
}: Omit<Props, "open">) {
  const [comment, setComment] = useState("");
  const [phase, setPhase] = useState<Phase>("confirm");
  const [result, setResult] = useState<RedemptionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const item = state?.phase === "confirm" ? state.item : null;

  async function handleConfirm() {
    if (!item) return;

    setPhase("loading");

    try {
      const res = await redeemReward(
        walletId,
        item.catalog_id,
        item.default_points,
        comment || undefined,
      );

      setResult(res);
      setPhase("success");
      onSuccess(res, item.default_points);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Redemption failed");
      setPhase("error");
    }
  }

  /* ───────── CONFIRM ───────── */
  if (phase === "confirm" && item) {
    return (
      <>
        <div className="px-7 pt-7 pb-5">
          <DialogHeader className="flex-row items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <ShoppingBag size={22} className="text-indigo-600" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-lg font-bold text-slate-800">
                Confirm Redemption
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                You&apos;re about to redeem this reward from your points
                balance.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Item summary */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
            <p className="font-semibold text-slate-800 text-sm mb-1">
              {item.reward_name}
            </p>

            {item.description && (
              <p className="text-xs text-slate-400 mb-3">
                {item.description}
              </p>
            )}

            <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
              <span>Cost</span>
              <span className="font-bold text-slate-800">
                {item.default_points.toLocaleString()} pts
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
              <span>Balance after</span>
              <span
                className={`font-bold ${availablePoints - item.default_points < 0
                    ? "text-red-500"
                    : "text-emerald-600"
                  }`}
              >
                {(availablePoints - item.default_points).toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Optional note */}
          <div className="space-y-1.5">
            <Label
              htmlFor="redeem-note"
              className="text-xs font-medium text-slate-500"
            >
              Note (optional)
            </Label>
            <Input
              id="redeem-note"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. for team lunch"
              maxLength={200}
              className="rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <DialogFooter className="px-7 pb-7 flex gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Confirm
          </Button>
        </DialogFooter>
      </>
    );
  }

  /* ───────── LOADING ───────── */
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-7">
        <Loader2 size={36} className="text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">
          Processing redemption…
        </p>
      </div>
    );
  }

  /* ───────── SUCCESS ───────── */
  if (phase === "success" && result && item) {
    return (
      <div className="flex flex-col items-center text-center px-7 py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <DialogHeader className="items-center mb-5">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Redemption Successful!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {item.reward_name}
            </span>{" "}
            has been redeemed.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6 text-left">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Points spent</span>
            <span className="font-bold text-slate-800">
              −{item.default_points.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Reference</span>
            <span className="font-mono text-slate-600 text-[10px]">
              {result.history_id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          Done
        </Button>
      </div>
    );
  }

  /* ───────── ERROR ───────── */
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center text-center px-7 py-10">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <XCircle size={32} className="text-red-500" />
        </div>
        <DialogHeader className="items-center mb-6">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Redemption Failed
          </DialogTitle>
          <DialogDescription className="text-sm text-red-500">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full rounded-xl border-slate-200 text-slate-600"
        >
          Close
        </Button>
      </div>
    );
  }

  return null;
}

/* ─────────── Outer shell – controls open/close ─────────── */

export default function RedeemDialog({
  open,
  state,
  availablePoints,
  walletId,
  onClose,
  onSuccess,
}: Props) {
  // Prevent closing during loading (Radix calls onOpenChange when
  // pressing Escape or clicking the overlay)
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-3xl p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {/*
          key={String(open)} remounts the body when `open` toggles,
          automatically resetting all internal state (phase, comment, etc.)
          without needing a useEffect → avoids the set-state-in-effect lint error.
        */}
        <RedeemDialogBody
          key={String(open)}
          state={state}
          availablePoints={availablePoints}
          walletId={walletId}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
