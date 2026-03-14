export interface ReviewCategory {
  category_id: string;
  category_code: string;
  category_name: string;
  multiplier: number;
  description?: string | null;
  is_active: boolean;
}

export interface ReviewCategoryCreatePayload {
  category_code: string;
  category_name: string;
  multiplier: number;
  description?: string;
}

export interface ReviewCategoryUpdatePayload {
  category_code?: string;
  category_name?: string;
  multiplier?: number;
  description?: string;
  is_active?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedReviewCategoryResponse {
  data: ReviewCategory[];
  pagination: PaginationMeta;
}