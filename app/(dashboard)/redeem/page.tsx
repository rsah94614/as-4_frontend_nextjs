"use client";

import { Layers } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletBanner from "@/components/features/redeem/WalletBanner";
import RewardCard from "@/components/features/redeem/RewardCard";
import RedeemDialog from "@/components/features/redeem/RedeemDialog";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RedeemPage() {
  const redeem = useRedeem();

  if (redeem.loading)
    return (
      <div className="flex-1 w-full">
        <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">
          {/* Wallet Banner Skeleton */}
          <div className="rounded-2xl bg-slate-50 p-6 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          {/* Category Pills Skeleton */}
          <div className="flex gap-2 flex-wrap mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>

          {/* Products Header Skeleton */}
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Product Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-3">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  if (redeem.error) return <div className="p-10">{redeem.error}</div>;

  return (
    <div className="flex-1 w-full">
      <Card className="rounded-[36px] shadow-none border-none bg-white max-w-[1200px] mx-auto py-0">
        <CardContent className="px-8 md:px-10 py-10">
          {/* Wallet Banner */}
          <WalletBanner wallet={redeem.wallet} />

          {/* Categories */}
          {redeem.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              <Button
                variant={redeem.activeCategory === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => redeem.setActiveCategory("ALL")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                  ${redeem.activeCategory === "ALL"
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                  }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {redeem.productItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-semibold text-slate-800">
                Products
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Layers size={13} />
                {redeem.productItems.length} items
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {redeem.items.map((item) => (
                  <RewardCard
                    key={item.catalog_id}
                    item={item}
                    canAfford={redeem.availablePoints >= item.default_points}
                    onRedeem={redeem.openRedeem}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <RedeemDialog
        open={redeem.dialogOpen}
        state={redeem.dialogState}
        availablePoints={redeem.availablePoints}
        walletId={redeem.wallet?.wallet_id ?? ""}
        onClose={redeem.closeDialog}
        onSuccess={redeem.handleSuccess}
      />
    </div>
  );
}
