"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { auth } from "@/services/auth-service";
import {
  fetchCatalog,
  fetchCategories,
  fetchWallet,
} from "@/services/rewards-service";
import { extractErrorMessage } from "@/lib/error-utils";

import {
  RewardItem,
  CategoryInfo,
  WalletData,
  DialogState,
  RedemptionResponse,
  PaginatedCatalogResponse,
} from "@/types/redeem-types";

const PAGE_SIZE = 20;

export function useRedeem() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [allItems, setAllItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedCatalogResponse["pagination"] | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cache: avoid re-fetching all items when switching between categories
  const allItemsCacheRef = useRef<RewardItem[] | null>(null);
  const fetchInProgressRef = useRef(false);

  // Fetch a single page of catalog
  const loadCatalog = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const catalogData = await fetchCatalog(page, PAGE_SIZE);
      setItems(catalogData.data);
      setPagination(catalogData.pagination);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to load catalog"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ALL pages and combine items (used for category filtering) — with caching
  const loadAllItems = useCallback(async () => {
    // Return cached if available
    if (allItemsCacheRef.current) {
      setAllItems(allItemsCacheRef.current);
      return;
    }

    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;

    setCategoryLoading(true);
    setError(null);
    try {
      const firstPage = await fetchCatalog(1, PAGE_SIZE);
      let combined = [...firstPage.data];

      if (firstPage.pagination.total_pages > 1) {
        const remaining = await Promise.all(
          Array.from(
            { length: firstPage.pagination.total_pages - 1 },
            (_, i) => fetchCatalog(i + 2, PAGE_SIZE)
          )
        );
        for (const page of remaining) {
          combined = [...combined, ...page.data];
        }
      }

      allItemsCacheRef.current = combined;
      setAllItems(combined);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to load catalog"));
    } finally {
      setCategoryLoading(false);
      fetchInProgressRef.current = false;
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.getUser();
      if (!user?.employee_id) throw new Error("Not authenticated");

      const [catalogData, catsData, walletData] = await Promise.all([
        fetchCatalog(1, PAGE_SIZE),
        fetchCategories(),
        fetchWallet(user.employee_id),
      ]);

      setItems(catalogData.data);
      setPagination(catalogData.pagination);
      setCategories(catsData);
      setWallet(walletData);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  // When page changes
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    if (activeCategory === "ALL") {
      loadCatalog(page);
    }
  }, [loadCatalog, activeCategory]);

  // When category changes: use cache or fetch, don't show full-page loading
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    if (cat === "ALL") {
      loadCatalog(1);
    } else {
      loadAllItems();
    }
  }, [loadCatalog, loadAllItems]);

  // When ALL: use paginated items. When category: filter from allItems
  const filteredItems = useMemo(() => {
    if (activeCategory === "ALL") return items;
    return allItems.filter((i) => i.category?.category_id === activeCategory);
  }, [items, allItems, activeCategory]);

  const voucherItems = useMemo(() =>
    filteredItems.filter((i) =>
      i.reward_code.toLowerCase().includes("voucher") ||
      i.category?.category_code.toLowerCase().includes("voucher")
    ), [filteredItems]);

  const allProductItems = useMemo(() =>
    filteredItems.filter((i) => !voucherItems.includes(i)),
    [filteredItems, voucherItems]);

  // Client-side pagination for filtered category results
  const filteredTotalPages = Math.ceil(allProductItems.length / PAGE_SIZE);

  const productItems = useMemo(() => {
    if (activeCategory === "ALL") return allProductItems;
    const start = (currentPage - 1) * PAGE_SIZE;
    return allProductItems.slice(start, start + PAGE_SIZE);
  }, [allProductItems, activeCategory, currentPage]);

  // Unified pagination info for the UI
  const activePagination = useMemo(() => {
    if (activeCategory === "ALL") return pagination;
    return {
      current_page: currentPage,
      per_page: PAGE_SIZE,
      total: allProductItems.length,
      total_pages: filteredTotalPages,
      has_next: currentPage < filteredTotalPages,
      has_previous: currentPage > 1,
    };
  }, [activeCategory, pagination, currentPage, allProductItems.length, filteredTotalPages]);

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
    // Invalidate the cache so next category switch gets fresh stock data
    allItemsCacheRef.current = null;

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
    categoryLoading,
    error,
    availablePoints,
    activeCategory,
    setActiveCategory: handleCategoryChange,
    filteredItems,
    productItems,
    pagination: activePagination,
    currentPage,
    goToPage,
    dialogState,
    dialogOpen,
    openRedeem,
    closeDialog,
    handleSuccess,
    reload: loadInitial,
  };
}