import { listSubjects, createSubject } from '@/services/classService'
import { createSubjectSchema } from '@/schemas'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.SUBJECT_READ)) return errorResponse('Forbidden', 403)
    const { subjects, pagination } = await listSubjects(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(subjects, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.SUBJECT_CREATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const data = await createSubjectSchema.validate(body, { abortEarly: false })
    const subject = await createSubject(tenantId, data)
    return successResponse(subject, 201)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
