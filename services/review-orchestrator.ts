/**
 * review-orchestrator.ts
 *
 * Orchestrates the full review submission flow:
 *   1. Per-user monthly limit  — derived from GET /v1/reviews (backend is source of truth)
 *   2. Per-pair reviewed check — derived from the same fetch (no localStorage)
 *      UI reads this to disable dropdown options already reviewed this month.
 *   3. Upload files to Cloudinary → get URLs
 *   4. POST review to Recognition Service
 *   5. POST /v1/wallets/credit-from-review → Wallet Service
 *
 * Points mapping (mirrors wallet/service.py → calculate_points_from_rating):
 *   5★ → 50 pts  |  4★ → 20 pts  |  3★ → 10 pts  |  1-2★ → 0 pts
 *
 * NOTE: Wallet card removed from the review page entirely.
 *       Wallet data lives only on the dedicated Wallet page.
 */

import { auth } from "@/services/auth-service";
import axiosClient from "@/services/api-client";
import { uploadToStorage } from "@/services/cloudinary";
import { extractApiError, validateReviewInput, requireAuthenticatedUserId, categorizeFileUrls } from "@/lib/api-utils";
import type { ReviewResponse, PaginatedReviewResponse } from "@/types/review";

// ─── Config ───────────────────────────────────────────────────────────────────

const RECOGNITION_API =
    process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005";
const WALLET_API =
    process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004";

const ENDPOINTS = {
    REVIEWS_CREATE: `${RECOGNITION_API}/v1/reviews`,
    REVIEWS_LIST: `${RECOGNITION_API}/v1/reviews`,
    CREDIT_FROM_REVIEW: `${WALLET_API}/v1/wallets/credit-from-review`,
} as const;

export const MAX_REVIEWS_PER_MONTH = 5;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Returns the logged-in employee_id or throws */
function requireMyId(): string {
    return requireAuthenticatedUserId();
}

/** ISO string for the first moment of the current month (UTC) */
function currentMonthStart(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

// ─── Monthly state — fetched from the backend ─────────────────────────────────

export interface MonthlyReviewState {
    /** How many reviews the current user has given this calendar month */
    reviewsUsed: number;
    /** receiverIds the user has already reviewed this month */
    reviewedReceiverIds: Set<string>;
    /** Computed: how many slots remain */
    reviewsRemaining: number;
    /** Computed: whether the user may submit another review */
    canSubmit: boolean;
}

/**
 * Fetches all reviews the current user has **given** this calendar month
 * from the backend and returns derived monthly state.
 *
 * The backend already scopes results to the current user (reviewer_id = me
 * OR receiver_id = me for EMPLOYEE/MANAGER roles), so we additionally filter
 * client-side to only rows where reviewer_id === myId so that reviews
 * *received* don't inflate the count.
 *
 * Paginates automatically — in practice a user can have at most
 * MAX_REVIEWS_PER_MONTH given reviews per month, so a single page is always
 * sufficient, but the loop is here for correctness.
 */
export async function fetchMonthlyReviewState(): Promise<MonthlyReviewState> {
    const myId = requireMyId();
    const monthStart = currentMonthStart();

    const receiverIds = new Set<string>();
    let page = 1;
    const pageSize = 100; // large page — we expect at most MAX_REVIEWS_PER_MONTH results

    while (true) {
        const res = await axiosClient.get<PaginatedReviewResponse>(
            `${ENDPOINTS.REVIEWS_LIST}?page=${page}&page_size=${pageSize}`
        );

        const { data, pagination } = res.data;

        for (const review of data) {
            // Only count reviews given by me this month
            if (
                review.reviewer_id === myId &&
                review.review_at >= monthStart
            ) {
                receiverIds.add(review.receiver_id);
            }
        }

        if (!pagination.has_next) break;
        page++;
    }

    const reviewsUsed = receiverIds.size;
    const reviewsRemaining = Math.max(0, MAX_REVIEWS_PER_MONTH - reviewsUsed);

    return {
        reviewsUsed,
        reviewedReceiverIds: receiverIds,
        reviewsRemaining,
        canSubmit: reviewsRemaining > 0,
    };
}

// ─── Convenience wrappers (always hit the backend) ────────────────────────────

/**
 * Returns how many reviews the current user has given this month.
 * Hits the backend — call once per render, not in a tight loop.
 */
export async function getReviewsUsed(): Promise<number> {
    return (await fetchMonthlyReviewState()).reviewsUsed;
}

/** Returns how many review slots remain this month. */
export async function getReviewsRemaining(): Promise<number> {
    return (await fetchMonthlyReviewState()).reviewsRemaining;
}

/** Returns true if the user may still submit a review this month. */
export async function canSubmitReview(): Promise<boolean> {
    return (await fetchMonthlyReviewState()).canSubmit;
}

/**
 * Returns a Set of receiverIds that the current user has already reviewed
 * this month. Use this to disable already-reviewed options in the dropdown.
 *
 * @example
 *   const reviewed = await getReviewedThisMonth();
 *   <option disabled={reviewed.has(member.id)}>…</option>
 */
export async function getReviewedThisMonth(): Promise<Set<string>> {
    return (await fetchMonthlyReviewState()).reviewedReceiverIds;
}

/**
 * Returns true if the current user has already reviewed `receiverId` this month.
 */
export async function hasAlreadyReviewed(receiverId: string): Promise<boolean> {
    return (await getReviewedThisMonth()).has(receiverId);
}

// ─── Points mapping ───────────────────────────────────────────────────────────

export const RATING_POINTS_MAP: Record<number, number> = {
    1: 0,
    2: 0,
    3: 10,
    4: 20,
    5: 50,
};

export function getPointsForRating(rating: number): number {
    return RATING_POINTS_MAP[rating] ?? 0;
}

export const RATING_LABELS: Record<number, string> = {
    1: "Poor",
    2: "Below Average",
    3: "Good",
    4: "Great",
    5: "Exceptional",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubmitReviewParams {
    receiverId: string;
    rating: number;
    comment: string;
    files?: File[];
}

export interface SubmitReviewResult {
    review: ReviewResponse;
    pointsCredited: number;
    reviewsRemaining: number;
    walletCreditSuccess: boolean;
    walletCreditError?: string;
}

// ─── Core orchestrator ────────────────────────────────────────────────────────

export async function submitReview(
    params: SubmitReviewParams
): Promise<SubmitReviewResult> {
    const myId = requireMyId();

    // 1. Fetch real monthly state from the backend — single round-trip covers
    //    both the limit check and the per-pair check, so we don't call twice.
    const monthlyState = await fetchMonthlyReviewState();

    if (!monthlyState.canSubmit) {
        throw new Error(
            `You've reached the ${MAX_REVIEWS_PER_MONTH}-review monthly limit. Resets on the 1st.`
        );
    }

    const { receiverId, rating, comment, files = [] } = params;

    // 2. Per-pair guard — prevent reviewing same person twice this month
    if (monthlyState.reviewedReceiverIds.has(receiverId)) {
        throw new Error("You've already reviewed this person this month.");
    }

    // 3. Local validation
    validateReviewInput(rating, comment);
    if (receiverId === myId) throw new Error("You cannot review yourself.");

    // 4. Upload files to Cloudinary in parallel
    const uploads = await Promise.all(
        files.map(async (file) => ({
            kind: file.type.split("/")[0],
            url: (await uploadToStorage(file)).url,
        }))
    );
    const { imageUrl, videoUrl } = categorizeFileUrls(uploads);

    // 5. POST review → Recognition Service
    try {
        const reviewRes = await axiosClient.post<ReviewResponse>(ENDPOINTS.REVIEWS_CREATE, {
            receiver_id: receiverId,
            rating,
            comment: comment.trim(),
            ...(imageUrl && { image_url: imageUrl }),
            ...(videoUrl && { video_url: videoUrl }),
        });

        const review = reviewRes.data;

        // 6. POST credit-from-review → Wallet Service
        let walletCreditSuccess = false;
        let walletCreditError: string | undefined;

        try {
            const creditRes = await axiosClient.post(
                `${ENDPOINTS.CREDIT_FROM_REVIEW}?review_id=${review.review_id}`
            );

            if (creditRes.status === 200 || creditRes.status === 201) {
                walletCreditSuccess = true;
            }
        } catch (e: unknown) {
            const axiosErr = e as { response?: { status?: number; data?: { detail?: string } }; message?: string };
            if (axiosErr.response?.status === 409) {
                // Already credited (idempotent duplicate) → treat as success
                walletCreditSuccess = true;
            } else {
                walletCreditError = axiosErr.response?.data?.detail || axiosErr.message || "Wallet credit failed.";
            }
        }

        // 7. Re-fetch so the caller always receives the true server-side remaining count
        const updatedState = await fetchMonthlyReviewState();

        return {
            review,
            pointsCredited: getPointsForRating(rating),
            reviewsRemaining: updatedState.reviewsRemaining,
            walletCreditSuccess,
            walletCreditError,
        };
    } catch (error: unknown) {
        throw new Error(extractApiError(error, "Failed to create review."));
    }
}

// ─── Review list ──────────────────────────────────────────────────────────────

export async function listReviews(
    page = 1,
    pageSize = 20
): Promise<PaginatedReviewResponse> {
    try {
        const res = await axiosClient.get<PaginatedReviewResponse>(
            `${ENDPOINTS.REVIEWS_LIST}?page=${page}&page_size=${pageSize}`
        );
        return res.data;
    } catch (error: unknown) {
        throw new Error(extractApiError(error, "Failed to fetch reviews."));
    }
}