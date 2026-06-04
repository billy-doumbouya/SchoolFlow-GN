import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return errorResponse('Unauthorized', 401)

    const subscription = await prisma.subscription.findFirst({
      where:   { tenantId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { subscription } })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
