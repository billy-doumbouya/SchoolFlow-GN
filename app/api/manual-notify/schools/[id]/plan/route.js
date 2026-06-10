import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'
import { getPlanByKey } from '@/lib/pricing'

export async function PUT(request, { params }) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'SUPER_ADMIN') return errorResponse('Forbidden', 403)

    const { planKey, durationDays = 365 } = await request.json()
    if (!planKey) return errorResponse('planKey requis', 400)

    const plan   = getPlanByKey(planKey)
    const tenant = await prisma.tenant.findUnique({ where: { id: params.id } })
    if (!tenant) return errorResponse('École introuvable', 404)

    await prisma.subscription.updateMany({
      where: { tenantId: params.id, status: 'ACTIVE' },
      data:  { status: 'INACTIVE' },
    })

    const subscription = await prisma.subscription.create({
      data: {
        tenantId:    params.id,
        plan:        planKey,
        status:      'ACTIVE',
        maxStudents: plan.maxStudents >= 999999 ? 999999 : plan.maxStudents,
        maxTeachers: plan.maxTeachers >= 999999 ? 999999 : plan.maxTeachers,
        maxClasses:  plan.maxClasses  >= 999999 ? 999999 : plan.maxClasses,
        priceGNF:    plan.priceGNF,
        endDate:     new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.payment.updateMany({
      where: { tenantId: params.id, status: 'PENDING', paymentType: 'SUBSCRIPTION' },
      data:  { status: 'SUCCESS', paidAt: new Date() },
    })

    try {
      const admin = await prisma.user.findFirst({
        where:  { tenantId: params.id, role: 'SCHOOL_ADMIN' },
        select: { firstName: true, phone: true },
      })
      if (admin?.phone) {
        const { sendWhatsApp } = await import('@/services/whatsappService')
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://schoolflow.gn'
        await sendWhatsApp(admin.phone,
          `✅ *Votre abonnement SchoolFlow est activé !*\n\nBonjour ${admin.firstName},\n\nVotre plan *${plan.label}* est maintenant actif.\n\n📦 Capacité :\n• ${plan.maxStudents >= 999999 ? 'Illimité' : plan.maxStudents} élèves\n• ${plan.maxTeachers >= 999999 ? 'Illimité' : plan.maxTeachers} enseignants\n\n📅 Valable jusqu'au : ${subscription.endDate.toLocaleDateString('fr-GN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nConnectez-vous : ${appUrl}/login\n\nMerci pour votre confiance 🙏\n*SchoolFlow by G-Tech Academy*`
        )
      }
    } catch (e) { console.error('[WhatsApp notify]', e.message) }

    return NextResponse.json({ success: true, data: subscription })
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
