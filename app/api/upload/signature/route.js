import { NextResponse } from "next/server";
import { generateUploadSignature, getCloudName } from "@/lib/cloudinary";
import { errorResponse } from "@/lib/api";

// POST /api/upload/signature
// Body: { type: 'avatar' | 'logo' }
// Returns: signature params needed for direct browser upload
export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");

    if (!userId || !tenantId) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const type = body?.type || "avatar"; // 'avatar' | 'logo'

    // Only admins can upload school logo
    if (type === "logo" && !["SCHOOL_ADMIN", "SUPER_ADMIN"].includes(role)) {
      return errorResponse("Seul un administrateur peut modifier le logo", 403);
    }

    // Define folder + public_id per type
    let folder, publicId;
    if (type === "avatar") {
      folder = `schoolflow/${tenantId}/avatars`;
      publicId = `${folder}/user_${userId}`;
    } else {
      folder = `schoolflow/${tenantId}`;
      publicId = `${folder}/logo`;
    }

    const signatureData = generateUploadSignature(folder, publicId);
    const cloudName = getCloudName();

    return NextResponse.json({
      success: true,
      data: {
        ...signatureData,
        cloudName,
        apiKey: extractApiKey(),
      },
    });
  } catch (err) {
    console.error("[Upload Signature]", err);
    return errorResponse("Impossible de générer la signature d'upload", 500);
  }
}

function extractApiKey() {
  const url = process.env.CLOUDINARY_URL || "";
  let match = url.match(/cloudinary:\/\/([^:]+):/);
  if (match) return match[1];

  match = url.match(/^https:\/\/api\.cloudinary\.com\/v1_1\/([^/]+)\//);
  return match
    ? process.env.CLOUDINARY_API_KEY || ""
    : process.env.CLOUDINARY_API_KEY || "";
}
