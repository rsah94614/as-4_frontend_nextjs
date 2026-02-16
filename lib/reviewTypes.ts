/**
 * TypeScript types matching backend Recognition Service Pydantic schemas.
 * Keep in sync with: src/recognition/schemas.py
 */

// -------------------------
// CREATE REQUEST
// -------------------------
export interface ReviewCreateRequest {
    receiver_id: string; // UUID
    rating: number; // 1-5
    comment: string; // 10-2000 chars
    image_url?: string | null;
    video_url?: string | null;
}

// -------------------------
// UPDATE REQUEST
// -------------------------
export interface ReviewUpdateRequest {
    rating?: number; // 1-5
    comment?: string; // 10-2000 chars
    image_url?: string | null;
    video_url?: string | null;
}

// -------------------------
// RESPONSE MODELS
// -------------------------
export interface ReviewResponse {
    review_id: string;
    reviewer_id: string;
    receiver_id: string;
    rating: number;
    comment: string;
    image_url: string | null;
    video_url: string | null;
    status_id: string;
    review_at: string; // ISO datetime
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface PaginatedReviewResponse {
    data: ReviewResponse[];
    pagination: PaginationMeta;
}
