"use client";

import dynamic from "next/dynamic";
import { Layers } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletBanner from "@/components/features/redeem/WalletBanner";
import RewardCard from "@/components/features/redeem/RewardCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PAGE_WRAPPER,
  PAGE_CARD,
  PAGE_CONTENT,
  PRODUCT_GRID,
  CATEGORY_WRAP,
  PILL_BASE,
  PILL_ACTIVE,
  PILL_INACTIVE,
  SECTION_HEADER,
  PAG_BTN_BASE,
  PAG_NUM_BASE,
  PAG_NUM_ACTIVE,
  PAG_NUM_INACTIVE,
} from "@/components/features/redeem/redeem-styles";

const RedeemDialog = dynamic(
  () => import("@/components/features/redeem/RedeemDialog"),
  { ssr: false }
);


export default function RedeemPage() {
  const redeem = useRedeem();

  if (redeem.error) return <div className="p-10">{redeem.error}</div>;

  if (redeem.loading) {
    return (
      <div className={PAGE_WRAPPER}>
        <Card className={PAGE_CARD}>
          <CardContent className={PAGE_CONTENT}>
            {/* Wallet Skeleton */}
            <div className="rounded-2xl bg-slate-50 p-6 mb-10">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className={CATEGORY_WRAP}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>

            {/* Products Skeleton */}
            <div className={SECTION_HEADER}>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className={PRODUCT_GRID}>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={PAGE_WRAPPER}>
      <Card className={PAGE_CARD}>
        <CardContent className={PAGE_CONTENT}>
          <WalletBanner wallet={redeem.wallet} />

          {redeem.categories.length > 0 && (
            <div className={CATEGORY_WRAP}>
              <Button
                variant={redeem.activeCategory === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => redeem.setActiveCategory("ALL")}
                className={`${PILL_BASE} ${
                  redeem.activeCategory === "ALL" ? PILL_ACTIVE : PILL_INACTIVE
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
                  className={`${PILL_BASE} ${
                    redeem.activeCategory === cat.category_id ? PILL_ACTIVE : PILL_INACTIVE
                    }`}
                >
                  {cat.category_name}
                </Button>
              ))}
            </div>
          )}

          {redeem.productItems.length > 0 ? (
            <>
              <div className={SECTION_HEADER}>
                <h2 className="text-[22px] font-semibold text-slate-800">
                  Products
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Layers size={13} className="text-slate-500" />
                  {redeem.activeCategory === "ALL" && redeem.pagination
                    ? redeem.pagination.total
                    : redeem.productItems.length} items
                </div>
              </div>

              <div className={PRODUCT_GRID}>
                {redeem.productItems.map((item) => (
                  <RewardCard
                    key={item.catalog_id}
                    item={item}
                    canAfford={redeem.availablePoints >= item.default_points}
                    onRedeem={redeem.openRedeem}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {redeem.pagination && redeem.pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!redeem.pagination.has_previous}
                    onClick={() => redeem.goToPage(redeem.currentPage - 1)}
                    className={PAG_BTN_BASE}
                  >
                    ← Previous
                  </Button>

                  {/* Page Numbers */}
                  {(() => {
                    const totalPages = redeem.pagination!.total_pages;
                    const current = redeem.currentPage;
                    const pages: (number | string)[] = [];

                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (current > 3) pages.push("...");
                      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                        pages.push(i);
                      }
                      if (current < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }

                    return pages.map((p, idx) =>
                      typeof p === "string" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-600 font-bold text-sm">
                          {p}
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === current ? "default" : "outline"}
                          size="sm"
                          onClick={() => redeem.goToPage(p)}
                          className={`${PAG_NUM_BASE} ${
                            p === current ? PAG_NUM_ACTIVE : PAG_NUM_INACTIVE
                            }`}
                        >
                          {p}
                        </Button>
                      )
                    );
                  })()}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!redeem.pagination.has_next}
                    onClick={() => redeem.goToPage(redeem.currentPage + 1)}
                    className={PAG_BTN_BASE}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          ) : null}
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
