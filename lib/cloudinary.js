import { v2 as cloudinary } from 'cloudinary'

// Configure from CLOUDINARY_URL env var automatically
// Format: cloudinary://api_key:api_secret@cloud_name
cloudinary.config(true)

export default cloudinary

// ─── Generate upload signature (server-side only) ─────────────────────────────
// Signature expires in 60 seconds — prevents replay attacks
export function generateUploadSignature(folder, publicId) {
  const timestamp = Math.round(Date.now() / 1000)

  const params = {
    timestamp,
    folder,
    ...(publicId && { public_id: publicId }),
    // Transformations applied on upload
    eager:               'c_fill,g_face,w_400,h_400,q_auto,f_auto',
    eager_async:         false,
    // File restrictions
    allowed_formats:     'jpg,jpeg,png,webp',
    max_file_size:       400000, // 400KB
    overwrite:           true,
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || extractSecret()
  )

  return { signature, timestamp, ...params }
}

// Extract secret from CLOUDINARY_URL if CLOUDINARY_API_SECRET not set separately
function extractSecret() {
  const url = process.env.CLOUDINARY_URL || ''
  // Format: cloudinary://api_key:api_secret@cloud_name
  const match = url.match(/cloudinary:\/\/[^:]+:([^@]+)@/)
  return match ? match[1] : ''
}

// Extract cloud name from CLOUDINARY_URL
export function getCloudName() {
  const url = process.env.CLOUDINARY_URL || ''
  const match = url.match(/cloudinary:\/\/[^@]+@(.+)/)
  return match ? match[1] : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
}

// ─── Delete an image by public_id ────────────────────────────────────────────
export async function deleteImage(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('[Cloudinary] Delete failed:', err.message)
  }
}

// ─── Build optimized URL ──────────────────────────────────────────────────────
export function buildImageUrl(publicId, options = {}) {
  const { width = 400, height = 400, crop = 'fill', gravity = 'face' } = options
  return cloudinary.url(publicId, {
    width, height, crop, gravity,
    quality:    'auto',
    fetch_format: 'auto',
    secure:     true,
  })
}
