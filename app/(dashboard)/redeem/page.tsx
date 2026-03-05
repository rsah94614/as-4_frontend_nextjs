"use client";

import { Layers } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletBanner from "@/components/features/redeem/WalletBanner";
import RewardCard from "@/components/features/redeem/RewardCard";
import RedeemDialog from "@/components/features/redeem/RedeemDialog";
import { Skeleton } from "@/components/ui/skeleton";


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
          {redeem.productItems.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[22px] font-semibold text-slate-800">
                  Products
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Layers size={13} />
                  {redeem.activeCategory === "ALL" && redeem.pagination
                    ? redeem.pagination.total
                    : redeem.productItems.length} items
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

              {/* Pagination Controls */}
              {redeem.pagination && redeem.pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!redeem.pagination.has_previous}
                    onClick={() => redeem.goToPage(redeem.currentPage - 1)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600
                      hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">
                          {p}
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === current ? "default" : "outline"}
                          size="sm"
                          onClick={() => redeem.goToPage(p)}
                          className={`rounded-lg min-w-[36px] px-2 py-1.5 text-sm font-medium transition-all
                            ${p === current
                              ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                              : "text-slate-600 hover:bg-slate-100 border-slate-200"
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
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600
                      hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </Button>
                </div>
              )}
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
