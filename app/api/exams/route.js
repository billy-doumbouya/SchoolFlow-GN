import { listExams, createExam } from '@/services/gradeService'
import { createExamSchema } from '@/schemas'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.EXAM_READ)) return errorResponse('Forbidden', 403)
    const { exams, pagination } = await listExams(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(exams, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.EXAM_CREATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const data = await createExamSchema.validate(body, { abortEarly: false })
    const exam = await createExam(tenantId, data)
    return successResponse(exam, 201)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
