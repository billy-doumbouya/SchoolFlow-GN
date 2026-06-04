import { listStudents, createStudent } from '@/services/studentService'
import { createStudentSchema } from '@/schemas'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')

    if (!hasPermission(role, PERMISSIONS.STUDENT_READ)) {
      return errorResponse('Forbidden', 403)
    }

    const { students, pagination } = await listStudents(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(students, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')

    if (!hasPermission(role, PERMISSIONS.STUDENT_CREATE)) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const data = await createStudentSchema.validate(body, { abortEarly: false })
    const student = await createStudent(tenantId, data)
    return successResponse(student, 201)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
