import { NextResponse } from 'next/server'
import { markAsRead, deleteNotification } from '@/services/notificationService'
import { errorResponse } from '@/lib/api'

// PUT /api/notifications/[id]  → mark single as read
export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId   = request.headers.get('x-user-id')
    if (!tenantId || !userId) return errorResponse('Unauthorized', 401)

    await markAsRead(tenantId, userId, params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}

// DELETE /api/notifications/[id]
export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId   = request.headers.get('x-user-id')
    if (!tenantId || !userId) return errorResponse('Unauthorized', 401)

    await deleteNotification(tenantId, userId, params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
