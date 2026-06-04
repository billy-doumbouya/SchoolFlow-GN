import { getTeacher, updateTeacher, deleteTeacher } from '@/services/teacherService'
import { updateTeacherSchema } from '@/schemas'
import { successResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.TEACHER_READ)) return errorResponse('Forbidden', 403)
    const teacher = await getTeacher(tenantId, params.id)
    return successResponse(teacher)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.TEACHER_UPDATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const data = await updateTeacherSchema.validate(body, { abortEarly: false })
    const teacher = await updateTeacher(tenantId, params.id, data)
    return successResponse(teacher)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.TEACHER_DELETE)) return errorResponse('Forbidden', 403)
    const result = await deleteTeacher(tenantId, params.id)
    return successResponse(result)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
