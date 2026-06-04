import { updateExam } from '@/services/gradeService'
import { successResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.EXAM_UPDATE)) return errorResponse('Forbidden', 403)
    const body = await request.json()
    const exam = await updateExam(tenantId, params.id, body)
    return successResponse(exam)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
