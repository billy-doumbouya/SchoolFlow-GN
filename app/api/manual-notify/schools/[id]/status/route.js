import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'

export async function PUT(request, { params }) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'SUPER_ADMIN') return errorResponse('Forbidden', 403)
    const { isActive } = await request.json()
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data:  { isActive },
    })
    return NextResponse.json({ success: true, data: tenant })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
