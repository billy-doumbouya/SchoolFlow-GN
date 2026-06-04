import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'

// PUT /api/auth/profile
export async function PUT(request) {
  try {
    const userId   = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    if (!userId || !tenantId) return errorResponse('Unauthorized', 401)

    const { firstName, lastName, avatarUrl, phone } = await request.json()

    if (!firstName?.trim() || !lastName?.trim()) {
      return errorResponse('Prénom et nom requis', 422)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName  && { firstName:  firstName.trim() }),
        ...(lastName   && { lastName:   lastName.trim() }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, role: true, avatarUrl: true, tenantId: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500)
  }
}
