// services/review-service.ts
// Talks to the Recognition Service via Next.js proxy.
// NO rating field — points are derived entirely from category multipliers × reviewer weight.

import { createAuthenticatedClient } from '@/lib/api-utils'
import { uploadToStorage } from './cloudinary'
import { extractErrorMessage } from '@/lib/error-utils'

const recognitionClient = createAuthenticatedClient('/api/proxy/recognition')

import type {
    ReviewCreateRequest,
    ReviewUpdateRequest,
    ReviewResponse,
    PaginatedReviewResponse,
} from '@/types/review'

export type {
    ReviewCreateRequest,
    ReviewUpdateRequest,
    ReviewResponse,
    PaginatedReviewResponse,
}

export const reviewService = {
    async listReviews(page = 1, pageSize = 20): Promise<PaginatedReviewResponse> {
        try {
            const res = await recognitionClient.get<PaginatedReviewResponse>(
                `/reviews?page=${page}&page_size=${pageSize}`
            );
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch reviews'));
        }
    },

    async getReview(reviewId: string): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.get<ReviewResponse>(`/reviews/${reviewId}`);
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch review'));
        }
    },

    async createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.post<ReviewResponse>('/reviews', data);
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to create review'));
        }
    },

    async updateReview(reviewId: string, data: ReviewUpdateRequest): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.put<ReviewResponse>(`/reviews/${reviewId}`, data);
            return res.data;
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to update review'));
        }
    },
}

export async function uploadFile(file: File): Promise<string> {
    const result = await uploadToStorage(file)
    return result.url
}

/**
 * Create a review using category_ids (no rating).
 * Points = sum(category_multipliers) × reviewer_weight — computed server-side.
 */
export async function createReviewWithFiles(
    receiverId:  string,
    categoryIds: string[],
    comment:     string,
    files:       File[]
): Promise<ReviewResponse> {
    if (!comment || comment.trim().length < 10) {
        throw new Error('Comment must be at least 10 characters.')
    }
    if (!categoryIds || categoryIds.length === 0) {
        throw new Error('Please select at least one recognition category.')
    }

    let imageUrl: string | undefined
    let videoUrl: string | undefined

    for (const file of files) {
        const kind = file.type.split('/')[0]
        if (kind === 'image' && !imageUrl) imageUrl = await uploadFile(file)
        if (kind === 'video' && !videoUrl) videoUrl = await uploadFile(file)
    }

    return reviewService.createReview({
        receiver_id:  receiverId,
        category_ids: categoryIds,
        comment:      comment.trim(),
        ...(imageUrl && { image_url: imageUrl }),
        ...(videoUrl && { video_url: videoUrl }),
    })
}