"use client";

import { Layers, TicketPercent } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
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
      <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">
        {/* Wallet Banner */}
        <WalletBanner wallet={redeem.wallet} />

        {/* Categories */}
        {redeem.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => redeem.setActiveCategory("ALL")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                ${redeem.activeCategory === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              All
            </button>

            {redeem.categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => redeem.setActiveCategory(cat.category_id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                  ${redeem.activeCategory === cat.category_id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        )}

        {/* Coupons */}
        {redeem.couponItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-semibold text-slate-800">
                Coupons & Vouchers
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {redeem.couponItems.length} available
              </span>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2 mb-12">
              {redeem.couponItems.map((coupon) => (
                <div
                  key={coupon.catalog_id}
                  onClick={() =>
                    coupon.stock_status !== "Out of Stock" &&
                    redeem.availablePoints >= coupon.default_points &&
                    redeem.openRedeem(coupon)
                  }
                  className="min-w-[230px] h-[200px] rounded-[28px] flex flex-col items-center justify-center gap-3 text-center px-6 relative overflow-hidden cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #fcd34d",
                  }}
                >
                  <TicketPercent size={36} className="text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-900 text-sm">
                      {coupon.reward_name}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {coupon.default_points.toLocaleString()} pts
                    </p>
                  </div>
                  <StockBadge status={coupon.stock_status} />
                </div>
              ))}
            </div>
          </>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {redeem.productItems.map((item) => (
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
      </div>

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
