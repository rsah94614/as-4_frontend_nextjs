/**
 * Review API service — wraps axiosClient for recognition service endpoints.
 * Base route: /reviews
 */

import axiosClient from "./axiosClient";
import type {
    ReviewCreateRequest,
    ReviewUpdateRequest,
    ReviewResponse,
    PaginatedReviewResponse,
} from "./reviewTypes";

const BASE = "/reviews";

/**
 * List reviews with pagination.
 * GET /reviews?page=&page_size=
 */
export async function listReviews(
    page: number = 1,
    pageSize: number = 20
): Promise<PaginatedReviewResponse> {
    const { data } = await axiosClient.get<PaginatedReviewResponse>(BASE, {
        params: { page, page_size: pageSize },
    });
    return data;
}

/**
 * Get a single review by ID.
 * GET /reviews/{id}
 */
export async function getReview(id: string): Promise<ReviewResponse> {
    const { data } = await axiosClient.get<ReviewResponse>(`${BASE}/${id}`);
    return data;
}

/**
 * Create a new review.
 * POST /reviews
 */
export async function createReview(
    payload: ReviewCreateRequest
): Promise<ReviewResponse> {
    const { data } = await axiosClient.post<ReviewResponse>(BASE, payload);
    return data;
}

/**
 * Update an existing review.
 * PUT /reviews/{id}
 */
export async function updateReview(
    id: string,
    payload: ReviewUpdateRequest
): Promise<ReviewResponse> {
    const { data } = await axiosClient.put<ReviewResponse>(
        `${BASE}/${id}`,
        payload
    );
    return data;
}
