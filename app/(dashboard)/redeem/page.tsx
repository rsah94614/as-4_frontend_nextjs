"use client";
import { useMemo, useState } from "react";
import RewardDialog from "@/components/ui/RewardDialog";
import { RewardItem } from "./models";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TicketPercent } from "lucide-react";
import { rewardItems } from "./data";

export default function RedeemPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = (item: RewardItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const activeCoupons = useMemo(() => {
    return rewardItems.filter(
      (item) => item.type === "coupon" && item.is_active
    );
  }, []);

  const mostRedeemed = useMemo(() => {
    return rewardItems
      .filter(
        (item) =>
          item.type === "product" && item.is_active && !item.is_out_of_stock
      )
      .slice(0, 4);
  }, []);

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-[36px] px-10 py-12 max-w-[1200px] mx-auto">
        {/* Coupons */}
        <h2 className="text-[22px] font-semibold mb-8">Coupons</h2>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide mb-14">
          {activeCoupons.map((coupon) => (
            <Card
              key={coupon.id}
              onClick={() => handleOpen(coupon)}
              className="min-w-[240px] h-[215px] rounded-[28px] cursor-pointer hover:scale-[1.02] transition"
              style={{ backgroundColor: coupon.bgColor }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <TicketPercent size={48} />
                <div>
                  <p className="font-semibold">{coupon.title}</p>
                  <p className="text-xs text-gray-700">
                    {coupon.points_required.toLocaleString()} points
                  </p>
                </div>
                <p className="text-xs font-medium">
                  ₹{coupon.monetary_value.toLocaleString()} each
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Most Redeemed */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-semibold">Most Redeemed</h2>

          <button
            onClick={() => router.push("/all_products")}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All Products →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mostRedeemed.map((product) => (
            <Card
              key={product.id}
              onClick={() => handleOpen(product)}
              className="rounded-[28px] border cursor-pointer hover:scale-[1.02] transition"
            >
              <CardContent className="p-6 text-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 mx-auto mb-4"
                />
                <p className="font-semibold">{product.title}</p>
                <p className="text-xs text-gray-600">
                  {product.points_required.toLocaleString()} points
                </p>
                <p className="text-xs font-medium mt-1">
                  Worth ₹{product.monetary_value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <RewardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
      />
    </div>
  );
}
