import { NextResponse } from 'next/server'
import { changePassword } from '@/services/authService'
import { changePasswordSchema } from '@/schemas'
import { errorResponse } from '@/lib/api'

// PUT /api/auth/password
export async function PUT(request) {
  try {
    const userId   = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    if (!userId || !tenantId) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const data = await changePasswordSchema.validate(body, { abortEarly: false })
    const result = await changePassword(userId, tenantId, data)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation échouée', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
