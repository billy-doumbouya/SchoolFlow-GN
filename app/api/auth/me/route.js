import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/authService";
import { errorResponse } from "@/lib/api";

// GET /api/auth/me
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    const tenantId = request.headers.get("x-tenant-id");

    if (!userId || !tenantId) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await getCurrentUser(userId, tenantId);
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    return errorResponse(
      err.message || "Failed to get user",
      err.statusCode || 500,
    );
  }
}
