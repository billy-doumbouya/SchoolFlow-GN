export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/services/otpService";
import { errorResponse } from "@/lib/api";
import { otpRateLimit, getClientIP } from "@/lib/rateLimiter";
export async function POST(request) {
  try {
    const body = await request.json();
    const phone = body?.phone;

    if (!phone) return errorResponse("Numéro de téléphone requis", 400);

    // Rate limit by phone number (not IP — prevents abuse per user)
    const { success, retryAfter } = otpRateLimit(phone);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de demandes. Réessayez dans ${retryAfter} secondes.`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    // Also rate limit by IP
    const ip = getClientIP(request);
    const ipCheck = otpRateLimit(`ip:${ip}`);
    if (!ipCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de demandes. Réessayez dans ${ipCheck.retryAfter} secondes.`,
        },
        { status: 429 },
      );
    }

    const result = await requestPasswordReset(phone);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500);
  }
}
