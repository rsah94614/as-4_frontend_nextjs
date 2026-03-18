import { useState, useEffect, useCallback, useMemo } from "react";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import {
  ReviewCategory,
  ReviewCategoryCreatePayload,
  ReviewCategoryUpdatePayload,
} from "@/types/review-category-types";

const client = createAuthenticatedClient("");
const BASE_URL = "/api/proxy/recognition/review-categories";

export function useReviewCategories(activeOnly: boolean | null = null) {
  const [categories, setCategories] = useState<ReviewCategory[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: "1", page_size: "100" };
      params.active_only = "false"; // Fetch all to filter locally

      const res = await client.get<{ data: ReviewCategory[] }>(BASE_URL, { params });
      setCategories(res.data?.data ?? []);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (payload: ReviewCategoryCreatePayload): Promise<ReviewCategory> => {
      const res = await client.post<ReviewCategory>(BASE_URL, payload);
      await fetchCategories();
      return res.data;
    },
    [fetchCategories]
  );

  const updateCategory = useCallback(
    async (id: string, payload: ReviewCategoryUpdatePayload): Promise<ReviewCategory> => {
      const res = await client.put<ReviewCategory>(`${BASE_URL}/${id}`, payload);
      await fetchCategories();
      return res.data;
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