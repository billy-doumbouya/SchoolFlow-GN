import { NextResponse } from 'next/server'
import { resetPassword } from '@/services/otpService'
import { errorResponse } from '@/lib/api'

// POST /api/auth/reset-password
// Body: { phone, code, newPassword }
export async function POST(request) {
  try {
    const { phone, code, newPassword } = await request.json()
    if (!phone || !code || !newPassword) {
      return errorResponse('Téléphone, code et nouveau mot de passe requis', 400)
    }
    const result = await resetPassword(phone, code, newPassword)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
