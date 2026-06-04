import { successResponse, errorResponse } from '@/lib/api'
import { getAdminDashboardStats, getTeacherDashboardStats, getStudentDashboardStats } from '@/services/dashboardService'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId   = request.headers.get('x-user-id')
    const role     = request.headers.get('x-user-role')

    let stats

    if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
      stats = await getAdminDashboardStats(tenantId)
    } else if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({ where: { tenantId, userId } })
      stats = teacher ? await getTeacherDashboardStats(tenantId, teacher.id) : {}
    } else if (role === 'STUDENT') {
      const student = await prisma.student.findFirst({ where: { tenantId, userId } })
      stats = student ? await getStudentDashboardStats(tenantId, student.id) : {}
    } else {
      stats = {}
    }

    return successResponse(stats)
  } catch (err) {
    console.error('[Dashboard Stats]', err)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
