import { NextResponse } from 'next/server'
import { registerSchool } from '@/services/authService'
import { registerSchoolSchema } from '@/schemas'
import { errorResponse } from '@/lib/api'
import { registerRateLimit, getClientIP } from '@/lib/rateLimiter'

export async function POST(request) {
  try {
    const ip = getClientIP(request)
    const { success, retryAfter } = registerRateLimit(ip)
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Trop de tentatives. Réessayez dans ${retryAfter} secondes.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await request.json()
    const data = await registerSchoolSchema.validate(body, { abortEarly: false })
    const result = await registerSchool(data)

    const response = NextResponse.json({ success: true, data: result }, { status: 201 })
    response.cookies.set('sf_token', result.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    })
    return response
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation échouée', 422, err.errors)
    if (err.statusCode) return errorResponse(err.message, err.statusCode)
    console.error('[Register]', err)
    return errorResponse('Erreur lors de la création du compte', 500)
  }
}
