/**
 * review-orchestrator.ts
 *
 * Orchestrates the full review submission flow:
 *   1. Per-user monthly limit  — derived from GET /v1/reviews (backend is source of truth)
 *   2. Per-pair reviewed check — derived from the same fetch (no localStorage)
 *   3. Upload files to Cloudinary → get URLs
 *   4. POST review to Recognition Service
 *   5. POST /v1/wallets/credit-from-review → Wallet Service
 */

import { createAuthenticatedClient } from "@/lib/api-utils";

const recognitionClient = createAuthenticatedClient("/api/proxy/recognition");
const walletClient      = createAuthenticatedClient("/api/proxy/wallet");
import { uploadToStorage } from "@/services/cloudinary";
import { extractApiError, validateReviewInput, requireAuthenticatedUserId, categorizeFileUrls } from "@/lib/api-utils";
import type { ReviewResponse, PaginatedReviewResponse } from "@/types/review";

// ─── Config ───────────────────────────────────────────────────────────────────

const ENDPOINTS = {
    REVIEWS_CREATE:     "/reviews",
    REVIEWS_LIST:       "/reviews",
    CREDIT_FROM_REVIEW: "/credit-from-review",
} as const;

export const MAX_REVIEWS_PER_MONTH = 5;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function requireMyId(): string {
    return requireAuthenticatedUserId();
}

function currentMonthStart(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

// ─── Request deduplication ────────────────────────────────────────────────────
// fetchMonthlyReviewState was previously called independently by canSubmitReview,
// getReviewsUsed, getReviewsRemaining, and getReviewedThisMonth — resulting in
// 4 identical paginated API calls per page load.
//
// The in-flight cache below ensures that no matter how many callers invoke
// fetchMonthlyReviewState concurrently, only ONE request goes to the backend.
// The promise is cleared as soon as it settles so the next call (e.g. after
// a review is submitted) gets a fresh fetch.

let _inFlightMonthlyState: Promise<MonthlyReviewState> | null = null;

function _fetchMonthlyReviewStateOnce(): Promise<MonthlyReviewState> {
    if (_inFlightMonthlyState) return _inFlightMonthlyState;

    _inFlightMonthlyState = _doFetchMonthlyReviewState().finally(() => {
        _inFlightMonthlyState = null;
    });

    return _inFlightMonthlyState;
}

/** Call this after submitting a review to force a fresh fetch next time. */
export function invalidateMonthlyReviewState(): void {
    _inFlightMonthlyState = null;
}

// ─── Monthly state — fetched from the backend ─────────────────────────────────

export interface MonthlyReviewState {
    reviewsUsed:          number;
    reviewedReceiverIds:  Set<string>;
    reviewsRemaining:     number;
    canSubmit:            boolean;
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
    const reviewsRemaining = Math.max(0, MAX_REVIEWS_PER_MONTH - reviewsUsed);

    return {
        reviewsUsed,
        reviewedReceiverIds: receiverIds,
        reviewsRemaining,
        canSubmit: reviewsRemaining > 0,
    };
}

/**
 * Fetches monthly review state — deduplicated so concurrent callers
 * share a single in-flight request.
 */
export async function fetchMonthlyReviewState(): Promise<MonthlyReviewState> {
    return _fetchMonthlyReviewStateOnce();
}

// ─── Convenience wrappers — all share the same single fetch ───────────────────

export async function getReviewsUsed():      Promise<number>       { return (await fetchMonthlyReviewState()).reviewsUsed; }
export async function getReviewsRemaining(): Promise<number>       { return (await fetchMonthlyReviewState()).reviewsRemaining; }
export async function canSubmitReview():     Promise<boolean>      { return (await fetchMonthlyReviewState()).canSubmit; }
export async function getReviewedThisMonth(): Promise<Set<string>> { return (await fetchMonthlyReviewState()).reviewedReceiverIds; }
export async function hasAlreadyReviewed(receiverId: string): Promise<boolean> {
    return (await getReviewedThisMonth()).has(receiverId);
}

// ─── Points mapping ───────────────────────────────────────────────────────────

export const RATING_POINTS_MAP: Record<number, number> = {
    1: 0, 2: 0, 3: 10, 4: 20, 5: 50,
};

export function getPointsForRating(rating: number): number {
    return RATING_POINTS_MAP[rating] ?? 0;
}

export const RATING_LABELS: Record<number, string> = {
    1: "Poor", 2: "Below Average", 3: "Good", 4: "Great", 5: "Exceptional",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubmitReviewParams {
    receiverId: string;
    rating:     number;
    comment:    string;
    files?:     File[];
}

export interface SubmitReviewResult {
    review:               ReviewResponse;
    pointsCredited:       number;
    reviewsRemaining:     number;
    walletCreditSuccess:  boolean;
    walletCreditError?:   string;
}

// ─── Core orchestrator ────────────────────────────────────────────────────────

export async function submitReview(params: SubmitReviewParams): Promise<SubmitReviewResult> {
    const myId = requireMyId();

    // Single fetch — covers both limit check and per-pair check
    const monthlyState = await fetchMonthlyReviewState();

    if (!monthlyState.canSubmit) {
        throw new Error(
            `You've reached the ${MAX_REVIEWS_PER_MONTH}-review monthly limit. Resets on the 1st.`
        );
    }

    const { receiverId, rating, comment, files = [] } = params;

    if (monthlyState.reviewedReceiverIds.has(receiverId)) {
        throw new Error("You've already reviewed this person this month.");
    }

    validateReviewInput(rating, comment);
    if (receiverId === myId) throw new Error("You cannot review yourself.");

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
            receiver_id: receiverId,
            rating,
            comment: comment.trim(),
            ...(imageUrl && { image_url: imageUrl }),
            ...(videoUrl && { video_url: videoUrl }),
        });

        const review = reviewRes.data;

        let walletCreditSuccess = false;
        let walletCreditError: string | undefined;

        try {
            const creditRes = await walletClient.post(
                `${ENDPOINTS.CREDIT_FROM_REVIEW}?review_id=${review.review_id}`
            );
            if (creditRes.status === 200 || creditRes.status === 201) {
                walletCreditSuccess = true;
            }
        } catch (e: unknown) {
            const axiosErr = e as { response?: { status?: number; data?: { detail?: string } }; message?: string };
            if (axiosErr.response?.status === 409) {
                walletCreditSuccess = true; // idempotent duplicate → success
            } else {
                walletCreditError = axiosErr.response?.data?.detail || axiosErr.message || "Wallet credit failed.";
            }
        }

        // Invalidate so next call gets a fresh count
        invalidateMonthlyReviewState();
        const updatedState = await fetchMonthlyReviewState();

        return {
            review,
            pointsCredited:      getPointsForRating(rating),
            reviewsRemaining:    updatedState.reviewsRemaining,
            walletCreditSuccess,
            walletCreditError,
        };
    } catch (error: unknown) {
        throw new Error(extractApiError(error, "Failed to create review."));
    }
}

// ─── Review list ──────────────────────────────────────────────────────────────

export async function listReviews(page = 1, pageSize = 20): Promise<PaginatedReviewResponse> {
    try {
        const res = await recognitionClient.get<PaginatedReviewResponse>(
            `${ENDPOINTS.REVIEWS_LIST}?page=${page}&page_size=${pageSize}`
        );
        return res.data;
    } catch (error: unknown) {
        throw new Error(extractApiError(error, "Failed to fetch reviews."));
    }
}