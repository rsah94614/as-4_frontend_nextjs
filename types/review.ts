/**
 * TypeScript types matching backend Recognition Service Pydantic schemas.
 * Keep in sync with: src/recognition/schemas.py
 *
 * NOTE: rating and seasonal_multiplier removed — points are derived
 * entirely from category multipliers × reviewer weight (server-side).
 */

// -------------------------
// CREATE REQUEST
// -------------------------
export interface ReviewCreateRequest {
    receiver_id:  string;       // UUID
    category_ids: string[];     // one or more category UUIDs
    comment:      string;       // min 10 chars
    image_url?:   string | null;
    video_url?:   string | null;
}

// -------------------------
// UPDATE REQUEST
// -------------------------
export interface ReviewUpdateRequest {
    category_ids?: string[];
    comment?:      string;
    image_url?:    string | null;
    video_url?:    string | null;
}

// -------------------------
// RESPONSE MODELS
// -------------------------
export interface ReviewResponse {
    review_id:    string;
    reviewer_id:  string;
    receiver_id:  string;
    comment:      string;
    image_url:    string | null;
    video_url:    string | null;
    review_at:    string;       // ISO datetime
    created_at:   string;
    created_by:   string;
    updated_at:   string;
    updated_by:   string;
    category_ids:   string[] | null;
    category_codes: string[] | null;
    raw_points:     number | null;
}

import type { PaginationMeta } from "./pagination";
export type { PaginationMeta };

export interface PaginatedReviewResponse {
    data:       ReviewResponse[];
    pagination: PaginationMeta;
}