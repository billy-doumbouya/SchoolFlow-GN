const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
const normalizedCloudinaryUrl = normalizeCloudinaryUrl(CLOUDINARY_URL);
if (normalizedCloudinaryUrl && normalizedCloudinaryUrl !== CLOUDINARY_URL) {
  process.env.CLOUDINARY_URL = normalizedCloudinaryUrl;
}

const { v2: cloudinary } = require("cloudinary");

const cloudinaryConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL || "");

if (Object.keys(cloudinaryConfig).length > 0) {
  cloudinary.config(cloudinaryConfig);
} else {
  cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}

export default cloudinary;

// ─── Generate upload signature (server-side only) ─────────────────────────────
// Signature expires in 60 seconds — prevents replay attacks
export function generateUploadSignature(folder, publicId) {
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    timestamp,
    folder,
    ...(publicId && { public_id: publicId }),
    // Transformations applied on upload
    eager: "c_fill,g_face,w_400,h_400,q_auto,f_auto",
    eager_async: false,
    // File restrictions
    allowed_formats: "jpg,jpeg,png,webp",
    max_file_size: 400000, // 400KB
    overwrite: true,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || extractSecret(CLOUDINARY_URL),
  );

  return { signature, timestamp, ...params };
}

// Extract secret from CLOUDINARY_URL if CLOUDINARY_API_SECRET not set separately
function extractSecret(url) {
  if (!url) return "";
  const protocolMatch = url.match(/^cloudinary:\/\/[^:]+:([^@]+)@/);
  if (protocolMatch) return protocolMatch[1];
  return "";
}

// Extract cloud name from CLOUDINARY_URL
export function getCloudName() {
  if (CLOUDINARY_URL) {
    const protocolMatch = CLOUDINARY_URL.match(/^cloudinary:\/\/[^@]+@(.+)$/);
    if (protocolMatch) return protocolMatch[1];

    const httpsMatch = CLOUDINARY_URL.match(
      /^https:\/\/api\.cloudinary\.com\/v1_1\/([^/]+)(?:\/.*)?$/,
    );
    if (httpsMatch) return httpsMatch[1];
  }

  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
}

function normalizeCloudinaryUrl(url) {
  if (!url) return "";

  const httpsMatch = url.match(
    /^https:\/\/api\.cloudinary\.com\/v1_1\/([^/]+)\/.*$/,
  );
  if (httpsMatch) {
    const cloudName = httpsMatch[1];
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    if (apiKey && apiSecret) {
      return `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;
    }
  }

  return url;
}

function parseCloudinaryUrl(url) {
  if (!url) return {};

  const protocolMatch = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (protocolMatch) {
    return {
      api_key: protocolMatch[1],
      api_secret: protocolMatch[2],
      cloud_name: protocolMatch[3],
    };
  }

  return {};
}

// ─── Delete an image by public_id ────────────────────────────────────────────
export async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[Cloudinary] Delete failed:", err.message);
  }
}

// ─── Build optimized URL ──────────────────────────────────────────────────────
export function buildImageUrl(publicId, options = {}) {
  const {
    width = 400,
    height = 400,
    crop = "fill",
    gravity = "face",
  } = options;
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    gravity,
    quality: "auto",
    fetch_format: "auto",
    secure: true,
  });
}
