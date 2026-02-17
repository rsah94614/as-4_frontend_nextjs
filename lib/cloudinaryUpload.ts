// lib/cloudinaryUpload.ts
//
// Uploads a file directly from the browser to Cloudinary using an
// unsigned upload preset — no backend proxy needed, no auth token required.
//
// Required .env.local variables:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
//
// How to create an unsigned upload preset in Cloudinary:
//   Dashboard → Settings → Upload → Upload presets → Add upload preset
//   Set "Signing mode" to "Unsigned", note the preset name.
//
// TO SWITCH TO S3 LATER:
//   Replace this file with an s3Upload.ts that exports the same
//   `uploadToStorage` function signature. Nothing else needs to change.

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export type UploadResult = {
  url:        string   // HTTPS secure_url — this is what gets stored in the DB
  publicId:   string   // Cloudinary public_id  (useful for deletes later)
  resourceType: 'image' | 'video'
  format:     string   // e.g. "jpg", "mp4"
  bytes:      number
}

/**
 * Upload a single file to Cloudinary and return its secure URL + metadata.
 *
 * - Images go into the "reviews/images" folder
 * - Videos go into the "reviews/videos" folder
 *
 * Throws if env vars are missing or the upload fails.
 */
export async function uploadToStorage(file: File): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Missing Cloudinary config. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ' +
      'and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local'
    )
  }

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
  const folder       = resourceType === 'video' ? 'reviews/videos' : 'reviews/images'

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  const formData = new FormData()
  formData.append('file',           file)
  formData.append('upload_preset',  UPLOAD_PRESET)
  formData.append('folder',         folder)

  const res = await fetch(endpoint, {
    method: 'POST',
    body:   formData,
    // No Authorization header — unsigned preset handles auth
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      err?.error?.message || `Cloudinary upload failed (${res.status})`
    )
  }

  const data = await res.json()

  return {
    url:          data.secure_url   as string,
    publicId:     data.public_id    as string,
    resourceType: data.resource_type as 'image' | 'video',
    format:       data.format       as string,
    bytes:        data.bytes        as number,
  }
}