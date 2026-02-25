"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "@/services/auth-service";
import {
  fetchCatalog,
  fetchCategories,
  fetchWallet,
} from "@/services/redeem-api";

import {
  RewardItem,
  CategoryInfo,
  WalletData,
  DialogState,
  RedemptionResponse,
} from "@/types/redeem-types";

export function useRedeem() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.getUser();
      if (!user?.employee_id) throw new Error("Not authenticated");

      const [catalogData, catsData, walletData] = await Promise.all([
        fetchCatalog(),
        fetchCategories(),
        fetchWallet(user.employee_id),
      ]);

      setItems(catalogData);
      setCategories(catsData);
      setWallet(walletData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "ALL") return items;
    return items.filter((i) => i.category?.category_id === activeCategory);
  }, [items, activeCategory]);

  const couponItems = useMemo(() =>
    filteredItems.filter((i) =>
      i.reward_code.toLowerCase().includes("coupon") ||
      i.reward_code.toLowerCase().includes("voucher") ||
      i.category?.category_code.toLowerCase().includes("coupon") ||
      i.category?.category_code.toLowerCase().includes("voucher")
    ), [filteredItems]);

  const productItems = useMemo(() =>
    filteredItems.filter((i) => !couponItems.includes(i)),
    [filteredItems, couponItems]);

  const availablePoints = wallet?.available_points ?? 0;

  function openRedeem(item: RewardItem) {
    setDialogState({ phase: "confirm", item });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setTimeout(() => setDialogState(null), 200);
  }

  function handleSuccess(result: RedemptionResponse, ptsSpent: number) {
    setWallet((prev) =>
      prev
        ? {
            ...prev,
            available_points: prev.available_points - ptsSpent,
            redeemed_points: prev.redeemed_points + ptsSpent,
          }
        : prev
    );

    setItems((prev) =>
      prev.map((i) => {
        if (
          dialogState?.phase === "confirm" &&
          i.catalog_id === dialogState.item.catalog_id
        ) {
          const newStock = i.available_stock - 1;
          return {
            ...i,
            available_stock: newStock,
            stock_status:
              newStock <= 0
                ? "Out of Stock"
                : newStock < 10
                ? "Limited Stock"
                : "In Stock",
          };
        }
        return i;
      })
    );
  }

  return {
    items,
    categories,
    wallet,
    loading,
    error,
    availablePoints,
    activeCategory,
    setActiveCategory,
    filteredItems,
    couponItems,
    productItems,
    dialogState,
    dialogOpen,
    openRedeem,
    closeDialog,
    handleSuccess,
    reload: loadAll,
  };
}