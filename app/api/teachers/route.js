import { listTeachers, createTeacher } from '@/services/teacherService'
import { createTeacherSchema } from '@/schemas'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.TEACHER_READ)) return errorResponse('Forbidden', 403)

    const { teachers, pagination } = await listTeachers(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(teachers, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.TEACHER_CREATE)) return errorResponse('Forbidden', 403)

    const body = await request.json()
    const data = await createTeacherSchema.validate(body, { abortEarly: false })
    const teacher = await createTeacher(tenantId, data)
    return successResponse(teacher, 201)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
