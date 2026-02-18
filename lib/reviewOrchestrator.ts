/**
 * reviewOrchestrator.ts
 *
 * Orchestrates the full review submission flow:
 *   1. Per-user monthly limit  — key: "rl:{employeeId}:{YYYY-MM}"  → count as string
 *   2. Per-pair reviewed check — key: "rp:{employeeId}:{YYYY-MM}"  → JSON string[] of receiverIds
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

import { auth } from "@/lib/auth";
import axiosClient from "@/lib/axiosClient";
import { uploadToStorage } from "@/lib/cloudinaryUpload";
import type { ReviewResponse, PaginatedReviewResponse } from "@/lib/reviewTypes";

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* noop in SSR */
  }
}

/** Returns the logged-in employee_id or throws */
function requireMyId(): string {
  const id = auth.getUser()?.employee_id;
  if (!id) throw new Error("Authentication required.");
  return id as string;
}

// ─── Per-user monthly limit ───────────────────────────────────────────────────
//
// Key scheme: "rl:{employeeId}:{YYYY-MM}"
//
// Every employee gets their own counter that is completely separate from
// every other employee's counter. Because the month is baked into the key,
// the counter automatically resets on the 1st of each month — there is
// nothing to clean up, old keys are simply ignored forever.

const MAX_REVIEWS_PER_MONTH = 5;

function limitKey(employeeId: string): string {
  return `rl:${employeeId}:${getCurrentMonth()}`;
}

function readCount(employeeId: string): number {
  return parseInt(lsGet(limitKey(employeeId)) ?? "0", 10) || 0;
}

function bumpCount(employeeId: string): void {
  lsSet(limitKey(employeeId), String(readCount(employeeId) + 1));
}

export function getReviewsUsed(): number {
  try {
    return readCount(requireMyId());
  } catch {
    return 0;
  }
}

export function getReviewsRemaining(): number {
  return Math.max(0, MAX_REVIEWS_PER_MONTH - getReviewsUsed());
}

export function canSubmitReview(): boolean {
  return getReviewsRemaining() > 0;
}

// ─── Per-pair reviewed tracking ───────────────────────────────────────────────
//
// Key scheme: "rp:{employeeId}:{YYYY-MM}"
// Value: JSON array of receiverIds this reviewer has already reviewed this month.
//
// Used by the UI to disable dropdown options for already-reviewed team members.
// Like the limit key, the month in the key means it auto-resets each month.

function pairKey(employeeId: string): string {
  return `rp:${employeeId}:${getCurrentMonth()}`;
}

function readReviewedPairs(employeeId: string): string[] {
  try {
    const raw = lsGet(pairKey(employeeId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function recordPair(employeeId: string, receiverId: string): void {
  const existing = readReviewedPairs(employeeId);
  if (!existing.includes(receiverId)) {
    lsSet(pairKey(employeeId), JSON.stringify([...existing, receiverId]));
  }
}

/**
 * Returns a Set of receiverIds that the current logged-in user has already
 * reviewed this month. Use this in the dropdown to disable already-reviewed options.
 *
 * @example
 *   const reviewed = getReviewedThisMonth();
 *   <option disabled={reviewed.has(member.id)}>…</option>
 */
export function getReviewedThisMonth(): Set<string> {
  try {
    return new Set(readReviewedPairs(requireMyId()));
  } catch {
    return new Set();
  }
}

/**
 * Returns true if the logged-in user has already reviewed `receiverId` this month.
 */
export function hasAlreadyReviewed(receiverId: string): boolean {
  return getReviewedThisMonth().has(receiverId);
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

  // 1. Monthly limit guard (per-user)
  if (!canSubmitReview()) {
    throw new Error(
      `You've reached the ${MAX_REVIEWS_PER_MONTH}-review monthly limit. Resets on the 1st.`
    );
  }

  const { receiverId, rating, comment, files = [] } = params;

  // 2. Per-pair guard — prevent reviewing same person twice this month
  if (hasAlreadyReviewed(receiverId)) {
    throw new Error("You've already reviewed this person this month.");
  }

  // 3. Local validation
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
  if (comment.trim().length < 10) throw new Error("Comment must be at least 10 characters.");
  if (comment.trim().length > 2000) throw new Error("Comment must not exceed 2000 characters.");
  if (receiverId === myId) throw new Error("You cannot review yourself.");

  // 4. Upload files to Cloudinary in parallel
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;

  const uploads = await Promise.all(
    files.map(async (file) => ({
      kind: file.type.split("/")[0],
      url: (await uploadToStorage(file)).url,
    }))
  );
  for (const { kind, url } of uploads) {
    if (kind === "image" && !imageUrl) imageUrl = url;
    if (kind === "video" && !videoUrl) videoUrl = url;
  }

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

    // 6. Persist counters only after review is confirmed saved by backend
    bumpCount(myId);
    recordPair(myId, receiverId);

    // 7. POST credit-from-review → Wallet Service
    let walletCreditSuccess = false;
    let walletCreditError: string | undefined;

    try {
      const creditRes = await axiosClient.post(
        `${ENDPOINTS.CREDIT_FROM_REVIEW}?review_id=${review.review_id}`
      );

      if (creditRes.status === 200 || creditRes.status === 201) {
        walletCreditSuccess = true;
      }
    } catch (e: any) {
      if (e.response?.status === 409) {
        // Already credited (idempotent duplicate) → treat as success
        walletCreditSuccess = true;
      } else {
        walletCreditError = e.response?.data?.detail || e.message || "Wallet credit failed.";
      }
    }

    return {
      review,
      pointsCredited: getPointsForRating(rating),
      reviewsRemaining: getReviewsRemaining(),
      walletCreditSuccess,
      walletCreditError,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message || "Failed to create review.");
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
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to fetch reviews.");
  }
}