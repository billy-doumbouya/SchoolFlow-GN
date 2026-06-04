import { NextResponse } from 'next/server'
import { processWebhook } from '@/services/paymentService'

// GuinePay Webhook Handler
// POST /api/webhooks/guinepay
export async function POST(request) {
  try {
    const body      = await request.text()
    const signature = request.headers.get('x-guinepay-signature') || ''
    const timestamp = request.headers.get('x-guinepay-ts') || ''

    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const result = await processWebhook(payload, signature, timestamp)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err.statusCode === 401) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    console.error('[Webhook Error]', err)
    // Return 200 to prevent retries for unrecoverable errors
    return NextResponse.json({ received: true, error: err.message }, { status: 200 })
  }
}
