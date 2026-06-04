import { listGrades, submitGrades } from '@/services/gradeService'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.GRADE_READ) && !hasPermission(role, PERMISSIONS.GRADE_READ_OWN)) {
      return errorResponse('Forbidden', 403)
    }
    const { grades, pagination } = await listGrades(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(grades, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.GRADE_CREATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const { examId, grades } = body
    if (!examId || !grades?.length) return errorResponse('examId and grades are required', 422)
    const result = await submitGrades(tenantId, examId, grades)
    return successResponse(result, 201)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
