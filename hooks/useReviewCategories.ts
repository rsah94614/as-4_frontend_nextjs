import { useState, useEffect, useCallback, useMemo } from "react";
import { extractErrorMessage } from "@/lib/error-utils";
import { recognitionClient as client } from "@/services/api-clients";
import {
  ReviewCategory,
  ReviewCategoryCreatePayload,
  ReviewCategoryUpdatePayload,
} from "@/types/review-category-types";

const BASE_URL = "/review-categories";

export function useReviewCategories(activeOnly: boolean | null = null) {
  const [categories, setCategories] = useState<ReviewCategory[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: "1", page_size: "100" };
      params.active_only = "false"; // Fetch all to filter locally

      const res = await client.get<{ data: ReviewCategory[] }>(BASE_URL, { params });
      setCategories(res.data?.data ?? []);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to load categories"));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (payload: ReviewCategoryCreatePayload): Promise<ReviewCategory> => {
      const res = await client.post<ReviewCategory>(BASE_URL, payload);
      await fetchCategories(true);
      return res.data;
    },
    [fetchCategories]
  );

  const updateCategory = useCallback(
    async (id: string, payload: ReviewCategoryUpdatePayload): Promise<ReviewCategory> => {
      // Optimistically update the local state for instant UI feedback
      setCategories((prev) =>
        prev.map((c) => (c.category_id === id ? { ...c, ...payload } : c))
      );

      try {
        const res = await client.put<ReviewCategory>(`${BASE_URL}/${id}`, payload);
        // Refresh silently in background to ensure sync with server
        fetchCategories(true);
        return res.data;
      } catch (err) {
        // Revert on failure by refetching
        fetchCategories(true);
        throw err;
      }
    },
    [fetchCategories]
  );

  const filteredCategories = useMemo(() => {
    if (activeOnly === null) return categories;
    return categories.filter((c) => c.is_active === activeOnly);
  }, [categories, activeOnly]);

  return {
    categories: filteredCategories,
    allCategories: categories,
    loading,
    error,
    createCategory,
    updateCategory,
    refetch: fetchCategories,
  };
}