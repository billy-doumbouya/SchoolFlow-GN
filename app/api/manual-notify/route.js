import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api'
import { getPlanByKey, formatGNF } from '@/lib/pricing'

// POST /api/payments/manual-notify
// Called when school says "I've paid manually"
export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return errorResponse('Unauthorized', 401)

    const { planKey, priceGNF } = await request.json()
    if (!planKey) return errorResponse('planKey requis', 400)

    const plan   = getPlanByKey(planKey)
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    const admin  = await prisma.user.findFirst({
      where: { tenantId, role: 'SCHOOL_ADMIN' },
      select: { firstName: true, lastName: true, email: true, phone: true },
    })

    // Create a pending payment record
    const idempotencyKey = `manual-${tenantId}-${planKey}-${Date.now()}`
    await prisma.payment.create({
      data: {
        tenantId,
        amount:         priceGNF || plan.priceGNF,
        currency:       'GNF',
        status:         'PENDING',
        paymentType:    'SUBSCRIPTION',
        description:    `Abonnement SchoolFlow ${plan.label} — 1 an (paiement manuel)`,
        idempotencyKey,
        metadata: { planKey, manual: true },
      },
    })

    // Notify SuperAdmin via WhatsApp
    try {
      const { sendWhatsApp } = await import('@/services/whatsappService')
      const superAdminPhone = process.env.SUPER_ADMIN_WHATSAPP || '+224623952011'

      await sendWhatsApp(
        superAdminPhone,
        `🔔 *Nouvelle demande d'activation manuelle*

🏫 École : ${tenant?.name || tenantId}
👤 Admin : ${admin?.firstName} ${admin?.lastName}
📧 Email : ${admin?.email}
📱 Tél   : ${admin?.phone || 'non renseigné'}

📦 Plan demandé : *${plan.label}*
💰 Montant      : *${formatGNF(priceGNF || plan.priceGNF)}*

→ Vérifiez le paiement et activez depuis :
${process.env.NEXT_PUBLIC_APP_URL}/dashboard/super`
      )
    } catch (e) {
      console.error('[Manual Notify] WhatsApp failed:', e.message)
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Équipe notifiée. Activation sous 24h.' },
    })
  } catch (err) {
    console.error('[Manual Notify]', err)
    return errorResponse(err.message, 500)
  }
}
