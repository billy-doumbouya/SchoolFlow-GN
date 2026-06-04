import { getClass, updateClass, deleteClass } from '@/services/classService'
import { successResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.CLASS_READ)) return errorResponse('Forbidden', 403)
    const cls = await getClass(tenantId, params.id)
    return successResponse(cls)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.CLASS_UPDATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const cls = await updateClass(tenantId, params.id, body)
    return successResponse(cls)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.CLASS_DELETE)) return errorResponse('Forbidden', 403)
    const result = await deleteClass(tenantId, params.id)
    return successResponse(result)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
