import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'

// GET /api/super/schools
export async function GET(request) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'SUPER_ADMIN') return errorResponse('Forbidden', 403)

    const page  = parseInt(request.nextUrl.searchParams.get('page')  || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const skip  = (page - 1) * limit
    const search = request.nextUrl.searchParams.get('search') || ''

    const where = search ? {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug:  { contains: search, mode: 'insensitive' } },
      ],
    } : {}

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            where:   { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take:    1,
          },
          _count: {
            select: { users: true, students: true, teachers: true },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ])

    // Platform revenue total
    const revenueAgg = await prisma.payment.aggregate({
      where:  { status: 'SUCCESS', paymentType: 'SUBSCRIPTION' },
      _sum:   { amount: true },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        tenants,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        platform: {
          totalRevenue:   revenueAgg._sum.amount || 0,
          totalPayments:  revenueAgg._count || 0,
          totalSchools:   total,
        },
      },
    })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
