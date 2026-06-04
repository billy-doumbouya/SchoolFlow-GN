import { NextResponse } from 'next/server'
import { loginUser } from '@/services/authService'
import { loginSchema } from '@/schemas'
import { errorResponse } from '@/lib/api'
import { loginRateLimit, getClientIP } from '@/lib/rateLimiter'

export async function POST(request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────────
    const ip = getClientIP(request)
    const { success, retryAfter } = loginRateLimit(ip)
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Trop de tentatives de connexion. Réessayez dans ${retryAfter} secondes.` },
        {
          status: 429,
          headers: {
            'Retry-After':       String(retryAfter),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // ── Validate ───────────────────────────────────────────────────────────────
    const body = await request.json()
    const data = await loginSchema.validate(body, { abortEarly: false })

    // ── Business logic ─────────────────────────────────────────────────────────
    const result = await loginUser(data)

    const response = NextResponse.json({ success: true, data: result }, { status: 200 })
    response.cookies.set('sf_token', result.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    })

    return response
  } catch (err) {
    if (err.name === 'ValidationError') {
      return errorResponse('Validation échouée', 422, err.errors)
    }
    if (err.name === 'AuthError') {
      return errorResponse(err.message, 401)
    }
    console.error('[Login]', err)
    return errorResponse('Erreur de connexion', 500)
  }
}
