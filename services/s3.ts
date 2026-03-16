// services/s3.ts
import axios from "axios"

const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"] // quicktime = .mov
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024  // 50 MB

export type UploadResult = {
    url: string
    publicId: string
    resourceType: "image" | "video"
    format: string
    bytes: number
}

export async function uploadToStorage(file: File): Promise<UploadResult> {
    if (!S3_REGION || !S3_BUCKET) {
        throw new Error(
            "Missing S3 config. Set NEXT_PUBLIC_S3_REGION and NEXT_PUBLIC_S3_BUCKET in .env.local"
        )
    }

    // ── Validate file type ────────────────────────────────────────────────────
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
        throw new Error(
            `Unsupported file type "${file.type}". Allowed: JPG, PNG, MP4, MOV.`
        )
    }

    // ── Validate file size ────────────────────────────────────────────────────
    if (isImage && file.size > MAX_IMAGE_BYTES) {
        throw new Error(
            `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 10 MB.`
        )
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
        throw new Error(
            `Video too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 50 MB.`
        )
    }

    // ── Build S3 key ──────────────────────────────────────────────────────────
    const resourceType = isVideo ? "video" : "image"
    const folder = isVideo ? "reviews/videos" : "reviews/images"

    // Normalize extension (mov files report as video/quicktime)
    const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "video/mp4": "mp4",
        "video/quicktime": "mov",
    }
    const ext = extMap[file.type]
    const key = `${folder}/${crypto.randomUUID()}.${ext}`

    // ── Step 1: Get pre-signed PUT URL ────────────────────────────────────────
    const { data: presignData } = await axios.post<{ uploadUrl: string }>("/api/upload/presign", {
        key,
        contentType: file.type,
    })

    // ── Step 2: PUT directly to S3 ────────────────────────────────────────────
    try {
        await axios.put(presignData.uploadUrl, file, {
            headers: { "Content-Type": file.type },
            // onUploadProgress: (e) => console.log(Math.round((e.loaded / (e.total ?? 1)) * 100) + "%"),
        })
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: string; status?: number } }
        throw new Error(
            `S3 upload failed (${axiosErr.response?.status ?? "unknown"}): ` +
            (axiosErr.response?.data ?? "no details")
        )
    }

    // ── Step 3: Return public URL + metadata ──────────────────────────────────
    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`

    return {
        url,
        publicId: key,
        resourceType,
        format: ext,
        bytes: file.size,
    }
}