// services/review-service.ts
// Talks to the Recognition Service via Next.js proxy.
// All requests routed through /api/proxy/recognition/* — no direct port in browser.

import { createAuthenticatedClient } from '@/lib/api-utils'
import { uploadToStorage } from './cloudinary'
import { extractApiError, validateReviewInput } from '@/lib/api-utils'

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
                `/v1/reviews?page=${page}&page_size=${pageSize}`
            );
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to fetch reviews'));
        }
    },

    async getReview(reviewId: string): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.get<ReviewResponse>(`/v1/reviews/${reviewId}`);
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to fetch review'));
        }
    },

    async createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.post<ReviewResponse>('/v1/reviews', data);
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to create review'));
        }
    },

    async updateReview(reviewId: string, data: ReviewUpdateRequest): Promise<ReviewResponse> {
        try {
            const res = await recognitionClient.put<ReviewResponse>(`/v1/reviews/${reviewId}`, data);
            return res.data;
        } catch (error: unknown) {
            throw new Error(extractApiError(error, 'Failed to update review'));
        }
    },
}

export async function uploadFile(file: File): Promise<string> {
    const result = await uploadToStorage(file)
    return result.url
}

export async function createReviewWithFiles(
    receiverId: string,
    rating:     number,
    comment:    string,
    files:      File[]
): Promise<ReviewResponse> {
    validateReviewInput(rating, comment)

    let imageUrl: string | undefined
    let videoUrl: string | undefined

    for (const file of files) {
        const kind = file.type.split('/')[0]
        if (kind === 'image' && !imageUrl) imageUrl = await uploadFile(file)
        if (kind === 'video' && !videoUrl) videoUrl = await uploadFile(file)
    }

    return reviewService.createReview({
        receiver_id: receiverId,
        rating,
        comment: comment.trim(),
        ...(imageUrl && { image_url: imageUrl }),
        ...(videoUrl && { video_url: videoUrl }),
    })
}

export async function createReview(formData: FormData): Promise<ReviewResponse> {
    const receiverId = formData.get('receiver_id') as string
    const rating     = parseInt(formData.get('rating') as string, 10)
    const comment    = formData.get('comment') as string

    const files: File[] = []
    formData.getAll('attachments').forEach((item) => {
        if (item instanceof File) files.push(item)
    })

    return createReviewWithFiles(receiverId, rating, comment, files)
}