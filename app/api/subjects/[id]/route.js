import { updateSubject, deleteSubject } from '@/services/classService'
import { successResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.SUBJECT_UPDATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const subject = await updateSubject(tenantId, params.id, body)
    return successResponse(subject)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.SUBJECT_DELETE)) return errorResponse('Forbidden', 403)
    const result = await deleteSubject(tenantId, params.id)
    return successResponse(result)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
