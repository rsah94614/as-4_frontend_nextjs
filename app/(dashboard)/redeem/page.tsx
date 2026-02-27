"use client";

import { Layers } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletBanner from "@/components/features/redeem/WalletBanner";
import RewardCard from "@/components/features/redeem/RewardCard";
import RedeemDialog from "@/components/features/redeem/RedeemDialog";
import StockBadge from "@/components/features/redeem/StockBadge";

export default function RedeemPage() {
  const redeem = useRedeem();

  if (redeem.loading) return <div className="p-10">Loading...</div>;
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
                All
              </Button>

              {redeem.categories.map((cat) => (
                <Button
                  key={cat.category_id}
                  variant={redeem.activeCategory === cat.category_id ? "default" : "outline"}
                  size="sm"
                  onClick={() => redeem.setActiveCategory(cat.category_id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                    ${redeem.activeCategory === cat.category_id
                      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                    }`}
                >
                  {cat.category_name}
                </Button>
              ))}
            </div>
          )}


          {/* Products */}
          {redeem.items.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[22px] font-semibold text-slate-800">
                  Products
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Layers size={13} />
                  {redeem.items.length} items
                </div>
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
