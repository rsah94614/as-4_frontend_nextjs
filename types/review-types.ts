// ─── Review Feature Types ─────────────────────────────────────────────────────

export interface ReviewCategory {
    category_id: string
    category_code: string
    category_name: string
    multiplier: number
    description?: string | null
    is_active: boolean
}

export interface Review {
    review_id: string
    reviewer_id: string
    receiver_id: string
    rating: number
    comment: string
    image_url?: string | null
    video_url?: string | null
    review_at: string
    category_id?: string | null
    category_ids?: string[] | null
    category_code?: string | null
    category_codes?: string[] | null
    raw_points?: number | null
    category_tags?: {
        category_id: string
        category_code: string
        multiplier_snapshot: number
    }[] | null
}

export type ViewMode = "list" | "compose" | "edit"

export type ToastKind = "success" | "error" | "warning"

export interface ToastState {
    msg: string
    kind: ToastKind
}
