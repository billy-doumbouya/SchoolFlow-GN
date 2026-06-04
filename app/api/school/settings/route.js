import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return errorResponse('Unauthorized', 401)
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    return NextResponse.json({ success: true, data: tenant })
  } catch (err) { return errorResponse(err.message, 500) }
}

export async function PUT(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const role     = request.headers.get('x-user-role')
    if (!tenantId) return errorResponse('Unauthorized', 401)
    if (!['SCHOOL_ADMIN','SUPER_ADMIN'].includes(role)) return errorResponse('Forbidden', 403)
    const { name, email, phone, address, logoUrl } = await request.json()
    if (!name?.trim()) return errorResponse("Le nom de l'école est requis", 422)
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name    && { name: name.trim() }),
        ...(email   && { email }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    })
    return NextResponse.json({ success: true, data: tenant })
  } catch (err) { return errorResponse(err.message, 500) }
}
