/**
 * review-orchestrator.ts
 *
 * Orchestrates the full review submission flow:
 *   1. Per-user monthly limit  — derived from GET /reviews (backend is source of truth)
 *   2. Per-pair reviewed check — derived from the same fetch (no localStorage)
 *   3. Upload files to Cloudinary → get URLs
 *   4. POST review to Recognition Service (category_ids + comment, NO rating)
 *
 * Points formula (backend): raw_points = sum(category_multipliers) × reviewer_weight
 * The frontend does NOT pass rating — the backend computes everything from categories.
 */

import { createAuthenticatedClient } from "@/lib/api-utils";
import { uploadToStorage } from "@/services/s3";
import { requireAuthenticatedUserId, categorizeFileUrls } from "@/lib/api-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import type { ReviewResponse, PaginatedReviewResponse } from "@/types/review";

const recognitionClient = createAuthenticatedClient("/api/proxy/recognition");

// ─── Config ───────────────────────────────────────────────────────────────────

const ENDPOINTS = {
    REVIEWS_CREATE: "/reviews",
    REVIEWS_LIST:   "/reviews",
} as const;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function requireMyId(): string {
    return requireAuthenticatedUserId();
}

function currentMonthStart(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

// ─── Request deduplication ────────────────────────────────────────────────────

let _inFlightMonthlyState: Promise<MonthlyReviewState> | null = null;

function _fetchMonthlyReviewStateOnce(): Promise<MonthlyReviewState> {
    if (_inFlightMonthlyState) return _inFlightMonthlyState;

    _inFlightMonthlyState = _doFetchMonthlyReviewState().finally(() => {
        _inFlightMonthlyState = null;
    });

    return _inFlightMonthlyState;
}

export function invalidateMonthlyReviewState(): void {
    _inFlightMonthlyState = null;
}

// ─── Monthly state ────────────────────────────────────────────────────────────

export interface MonthlyReviewState {
    reviewsUsed:         number;
    reviewedReceiverIds: Set<string>;
    reviewsRemaining:    number;
    canSubmit:           boolean;
}

async function _doFetchMonthlyReviewState(): Promise<MonthlyReviewState> {
    const myId       = requireMyId();
    const monthStart = currentMonthStart();

    const receiverIds = new Set<string>();
    let page = 1;
    const pageSize = 100;

    while (true) {
        const res = await recognitionClient.get<PaginatedReviewResponse>(
            `${ENDPOINTS.REVIEWS_LIST}?page=${page}&page_size=${pageSize}`
        );
        const { data, pagination } = res.data;

        for (const review of data) {
            if (review.reviewer_id === myId && review.review_at >= monthStart) {
                receiverIds.add(review.receiver_id);
            }
        }

        if (!pagination.has_next) break;
        page++;
    }

    const reviewsUsed      = receiverIds.size;
    // Quota is enforced server-side; we use a generous client-side cap for UX only
    const CLIENT_QUOTA_CAP = 99;
    const reviewsRemaining = Math.max(0, CLIENT_QUOTA_CAP - reviewsUsed);

    return {
        reviewsUsed,
        reviewedReceiverIds: receiverIds,
        reviewsRemaining,
        canSubmit: true, // backend is source of truth for quota; don't block client-side
    };
}

export async function fetchMonthlyReviewState(): Promise<MonthlyReviewState> {
    return _fetchMonthlyReviewStateOnce();
}

// Convenience wrappers
export async function getReviewsUsed():       Promise<number>       { return (await fetchMonthlyReviewState()).reviewsUsed; }
export async function getReviewsRemaining():  Promise<number>       { return (await fetchMonthlyReviewState()).reviewsRemaining; }
export async function canSubmitReview():      Promise<boolean>      { return (await fetchMonthlyReviewState()).canSubmit; }
export async function getReviewedThisMonth(): Promise<Set<string>>  { return (await fetchMonthlyReviewState()).reviewedReceiverIds; }
export async function hasAlreadyReviewed(receiverId: string): Promise<boolean> {
    return (await getReviewedThisMonth()).has(receiverId);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubmitReviewParams {
    receiverId:  string;
    categoryIds: string[];   // 1–5 UUIDs from GET /review-categories
    comment:     string;
    files?:      File[];
}

export interface SubmitReviewResult {
    review:           ReviewResponse;
    reviewsRemaining: number;
}

// ─── Core orchestrator ────────────────────────────────────────────────────────

export async function submitReview(params: SubmitReviewParams): Promise<SubmitReviewResult> {
    const myId = requireMyId();

    const monthlyState = await fetchMonthlyReviewState();

    const { receiverId, categoryIds, comment, files = [] } = params;

    if (monthlyState.reviewedReceiverIds.has(receiverId)) {
        throw new Error("You've already reviewed this person this month.");
    }

    if (!comment || comment.trim().length < 10) {
        throw new Error("Comment must be at least 10 characters.");
    }
    if (!categoryIds || categoryIds.length === 0) {
        throw new Error("Please select at least one recognition category.");
    }
    if (receiverId === myId) {
        throw new Error("You cannot review yourself.");
    }

    // Upload files in parallel
    const uploads = await Promise.all(
        files.map(async (file) => ({
            kind: file.type.split("/")[0],
            url:  (await uploadToStorage(file)).url,
        }))
    );
    const { imageUrl, videoUrl } = categorizeFileUrls(uploads);

    try {
        const reviewRes = await recognitionClient.post<ReviewResponse>(ENDPOINTS.REVIEWS_CREATE, {
            receiver_id:  receiverId,
            category_ids: categoryIds,
            comment:      comment.trim(),
            ...(imageUrl && { image_url: imageUrl }),
            ...(videoUrl && { video_url: videoUrl }),
        });

        const review = reviewRes.data;

        // Invalidate so next call gets a fresh count
        invalidateMonthlyReviewState();
        const updatedState = await fetchMonthlyReviewState();

        return {
            review,
            reviewsRemaining: updatedState.reviewsRemaining,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to create review."));
    }
}

// ─── Review list ──────────────────────────────────────────────────────────────

export async function listReviews(page = 1, pageSize = 20): Promise<PaginatedReviewResponse> {
    try {
        const res = await recognitionClient.get<PaginatedReviewResponse>(
            `${ENDPOINTS.REVIEWS_LIST}?page=${page}&page_size=${pageSize}`
        );
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to fetch reviews."));
    }
}
