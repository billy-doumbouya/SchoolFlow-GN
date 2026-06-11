/** @type {import('next').NextConfig} */
function normalizeCloudinaryUrl(url) {
  if (!url) return url;
  const match = url.match(
    /^https:\/\/api\.cloudinary\.com\/v1_1\/([^/]+)\/.*$/,
  );
  if (!match) return url;
  const cloudName = match[1];
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  if (!apiKey || !apiSecret) return url;
  return `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;
}

if (process.env.CLOUDINARY_URL) {
  process.env.CLOUDINARY_URL = normalizeCloudinaryUrl(
    process.env.CLOUDINARY_URL,
  );
}

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
};

module.exports = nextConfig;
