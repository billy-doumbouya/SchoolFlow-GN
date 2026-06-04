import { NextResponse } from 'next/server'
import { listNotifications, markAllAsRead } from '@/services/notificationService'
import { errorResponse } from '@/lib/api'

// GET /api/notifications
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId   = request.headers.get('x-user-id')
    if (!tenantId || !userId) return errorResponse('Unauthorized', 401)

    const page  = parseInt(request.nextUrl.searchParams.get('page')  || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const result = await listNotifications(tenantId, userId, { page, limit })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}

// PUT /api/notifications  → mark all read
export async function PUT(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId   = request.headers.get('x-user-id')
    if (!tenantId || !userId) return errorResponse('Unauthorized', 401)

    await markAllAsRead(tenantId, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
