// app/api/classes/route.js
import { listClasses, createClass } from '@/services/classService'
import { createClassSchema } from '@/schemas'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.CLASS_READ)) return errorResponse('Forbidden', 403)

    const { classes, pagination } = await listClasses(tenantId, request.nextUrl.searchParams)
    return paginatedResponse(classes, pagination)
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!hasPermission(role, PERMISSIONS.CLASS_CREATE)) return errorResponse('Forbidden', 403)

    const body = await request.json()
    const data = await createClassSchema.validate(body, { abortEarly: false })
    const cls  = await createClass(tenantId, data)
    return successResponse(cls, 201)
  } catch (err) {
    if (err.name === 'ValidationError') return errorResponse('Validation failed', 422, err.errors)
    return errorResponse(err.message, err.statusCode || 500)
  }
}
