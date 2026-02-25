"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TicketPercent } from "lucide-react";
import { RewardItem } from "@/types/redeem-types";

interface RewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RewardItem | null;
}

export default function RewardDialog({
  open,
  onOpenChange,
  item,
}: RewardDialogProps) {
  if (!item) return null;

  const isOutOfStock = item.stock_status === "out_of_stock";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-8 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {item.reward_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-4 mt-4">
          <TicketPercent size={60} />

          <p className="text-sm text-gray-600">
            {item.default_points.toLocaleString()} points required
          </p>

          {item.description && (
            <p className="text-sm text-gray-500">{item.description}</p>
          )}

          {item.available_stock > 0 && (
            <p className="text-xs text-gray-400">
              {item.available_stock} in stock
            </p>
          )}

          {isOutOfStock ? (
            <Button disabled className="w-full">
              Out of Stock
            </Button>
          ) : (
            <Button className="w-full">Redeem Now</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
