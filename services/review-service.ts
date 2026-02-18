// services/review-service.ts
// Talks to the Recognition Service (port 8005).
//   POST /v1/reviews       → create review  (JSON body — NOT FormData)
//   GET  /v1/reviews       → list reviews
//   GET  /v1/reviews/{id}  → get review
//   PUT  /v1/reviews/{id}  → update review
//
// Files are uploaded to Cloudinary first to get HTTPS URLs.
// The backend stores only the URL — it never touches the file.
// To switch to S3 later: replace cloudinary.ts only.

import axiosClient from './api-client'
import { uploadToStorage } from './cloudinary'
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

const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || 'http://localhost:8005'

const ENDPOINTS = {
    LIST: `${RECOGNITION_API}/v1/reviews`,
    CREATE: `${RECOGNITION_API}/v1/reviews`,
    GET: (id: string) => `${RECOGNITION_API}/v1/reviews/${id}`,
    UPDATE: (id: string) => `${RECOGNITION_API}/v1/reviews/${id}`,
} as const

// ─── Core service ─────────────────────────────────────────────────────────────

export const reviewService = {
    async listReviews(page = 1, pageSize = 20): Promise<PaginatedReviewResponse> {
        try {
            const res = await axiosClient.get<PaginatedReviewResponse>(
                `${ENDPOINTS.LIST}?page=${page}&page_size=${pageSize}`
            );
            return res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch reviews');
        }
    },

    async getReview(reviewId: string): Promise<ReviewResponse> {
        try {
            const res = await axiosClient.get<ReviewResponse>(ENDPOINTS.GET(reviewId));
            return res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch review');
        }
    },

    /** POST JSON matching backend ReviewCreateRequest — not FormData */
    async createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
        try {
            const res = await axiosClient.post<ReviewResponse>(ENDPOINTS.CREATE, data);
            return res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to create review');
        }
    },

    async updateReview(reviewId: string, data: ReviewUpdateRequest): Promise<ReviewResponse> {
        try {
            const res = await axiosClient.put<ReviewResponse>(ENDPOINTS.UPDATE(reviewId), data);
            return res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to update review');
        }
    },
}

// ─── File upload helper ───────────────────────────────────────────────────────

/**
 * Upload a file to Cloudinary and return its secure HTTPS URL.
 * That URL is what gets stored in the DB as image_url / video_url.
 *
 * To switch to S3: replace cloudinary.ts with s3Upload.ts
 * exporting the same uploadToStorage(file) signature. Nothing else changes.
 */
export async function uploadFile(file: File): Promise<string> {
    const result = await uploadToStorage(file)
    return result.url
}

// ─── High-level helpers ───────────────────────────────────────────────────────

/**
 * Upload any attached files to Cloudinary to get URLs,
 * then POST the review as JSON to the backend.
 * Only the first image and first video are used (backend stores one of each).
 */
export async function createReviewWithFiles(
    receiverId: string,
    rating: number,
    comment: string,
    files: File[]
): Promise<ReviewResponse> {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5')
    if (comment.trim().length < 10) throw new Error('Comment must be at least 10 characters')
    if (comment.trim().length > 2000) throw new Error('Comment must not exceed 2000 characters')

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

/**
 * Adapter called by page.tsx — accepts FormData, extracts fields,
 * uploads files to Cloudinary, then sends JSON to the backend.
 */
export async function createReview(formData: FormData): Promise<ReviewResponse> {
    const receiverId = formData.get('receiver_id') as string
    const rating = parseInt(formData.get('rating') as string, 10)
    const comment = formData.get('comment') as string

    const files: File[] = []
    formData.getAll('attachments').forEach((item) => {
        if (item instanceof File) files.push(item)
    })

    return createReviewWithFiles(receiverId, rating, comment, files)
}
