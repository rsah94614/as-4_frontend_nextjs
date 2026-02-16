"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TicketPercent } from "lucide-react";
import { RewardItem } from "@/app/(dashboard)/redeem/models";

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

  const isCoupon = item.type === "coupon";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-8 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-4 mt-4">
          {isCoupon ? (
            <TicketPercent size={60} />
          ) : (
            <img
              src={item.image}
              alt={item.title}
              className="w-28 object-contain"
            />
          )}

          <p className="text-sm text-gray-600">
            {item.points_required.toLocaleString()} points required
          </p>

          <p className="font-medium">
            Worth ₹{item.monetary_value.toLocaleString()}
          </p>

          {item.is_out_of_stock ? (
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
