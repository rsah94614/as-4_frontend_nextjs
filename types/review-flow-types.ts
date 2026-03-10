import type { ReviewResponse } from "./review";

export interface MonthlyReviewState {
  reviewsUsed: number;
  reviewedReceiverIds: Set<string>;
  reviewsRemaining: number;
  canSubmit: boolean;
}

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
