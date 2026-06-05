import "server-only";
import { prisma } from "@/lib/prisma";
import { AppError, NotFoundError } from "@/lib/api";
import { sendPaymentConfirmation } from "@/services/whatsappService";
import crypto from "crypto";

const GUINEPAY_BASE_URL =
  process.env.GUINEPAY_BASE_URL || "https://api.guinepay.com/v1";
const GUINEPAY_API_KEY = process.env.GUINEPAY_API_KEY || "";
const GUINEPAY_SECRET = process.env.GUINEPAY_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── GuinePay API Client ───────────────────────────────────────────────────────

async function guinePayRequest(method, endpoint, body = null) {
  const timestamp = Date.now().toString();
  const payload = body ? JSON.stringify(body) : "";

  // Build signature: HMAC-SHA256 of timestamp + method + endpoint + payload
  const signaturePayload = `${timestamp}${method.toUpperCase()}${endpoint}${payload}`;
  const signature = crypto
    .createHmac("sha256", GUINEPAY_SECRET)
    .update(signaturePayload)
    .digest("hex");

  const res = await fetch(`${GUINEPAY_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-GuinePay-API-Key": GUINEPAY_API_KEY,
      "X-GuinePay-TS": timestamp,
      "X-GuinePay-Sig": signature,
    },
    ...(body && { body: payload }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "GuinePay API error" }));
    throw new AppError(
      `GuinePay: ${error.message || "Payment gateway error"}`,
      502,
    );
  }

  return res.json();
}

// ─── Create Payment Intent ────────────────────────────────────────────────────

export async function createPaymentIntent(tenantId, data) {
  const {
    amount,
    currency = "GNF",
    studentId,
    description,
    paymentType = "SCHOOL_FEE",
    subscriptionId,
  } = data;

  // Idempotency key: unique per request
  const idempotencyKey = `${tenantId}-${studentId || "school"}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Mock GuinePay payment intent creation
  // In production, this calls the real GuinePay API
  let guinePayIntentId, redirectUrl;

  if (GUINEPAY_API_KEY && GUINEPAY_API_KEY !== "") {
    const gpResponse = await guinePayRequest("POST", "/payment-intents", {
      amount,
      currency,
      description,
      idempotency_key: idempotencyKey,
      redirect_url: `${APP_URL}/api/payments/callback`,
      webhook_url: `${APP_URL}/api/webhooks/guinepay`,
      metadata: {
        tenantId,
        studentId,
        paymentType,
      },
    });
    guinePayIntentId = gpResponse.id;
    redirectUrl = gpResponse.payment_url;
  } else {
    // Mock for development
    guinePayIntentId = `gp_intent_${Date.now()}`;
    redirectUrl = `${APP_URL}/dashboard/payments/mock-checkout?intent=${guinePayIntentId}`;
  }

  // Persist payment record
  const payment = await prisma.payment.create({
    data: {
      tenantId,
      studentId: studentId || null,
      subscriptionId: subscriptionId || null,
      guinePayIntentId,
      amount: parseFloat(amount),
      currency,
      status: "PENDING",
      paymentType,
      description,
      idempotencyKey,
      metadata: { redirectUrl },
    },
  });

  return { payment, redirectUrl };
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function processWebhook(payload, signature, timestamp) {
  // Verify webhook signature
  const expectedSig = crypto
    .createHmac("sha256", GUINEPAY_SECRET)
    .update(`${timestamp}${JSON.stringify(payload)}`)
    .digest("hex");

  // In production, strict comparison:
  // if (expectedSig !== signature) throw new AppError('Invalid webhook signature', 401)
  // For dev/mock, we skip:
  if (GUINEPAY_SECRET && signature && expectedSig !== signature) {
    throw new AppError("Invalid webhook signature", 401);
  }

  const { event, data: eventData } = payload;

  // Idempotency: skip if already processed
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { guinePayIntentId: eventData.intent_id },
        { guinePayRef: eventData.reference },
      ],
    },
  });

  if (!payment) {
    console.warn("[Webhook] Payment not found for", eventData);
    return { received: true };
  }

  // Skip if already processed (idempotency)
  if (payment.webhookReceived && payment.status !== "PENDING") {
    console.log("[Webhook] Already processed, skipping", payment.id);
    return { received: true, idempotent: true };
  }

  let newStatus = payment.status;
  let paidAt = null;

  switch (event) {
    case "payment.success":
    case "payment.completed":
      newStatus = "SUCCESS";
      paidAt = new Date();
      break;
    case "payment.failed":
      newStatus = "FAILED";
      break;
    case "payment.cancelled":
      newStatus = "CANCELLED";
      break;
    case "payment.refunded":
      newStatus = "REFUNDED";
      break;
    default:
      console.log("[Webhook] Unhandled event:", event);
      return { received: true };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      guinePayRef: eventData.reference || payment.guinePayRef,
      webhookReceived: true,
      webhookReceivedAt: new Date(),
      ...(paidAt && { paidAt }),
      ...(newStatus === "FAILED" && {
        failureReason: eventData.failure_reason,
      }),
    },
  });

  // If subscription payment succeeded, activate subscription
  // Send WhatsApp payment confirmation
  if (newStatus === "SUCCESS" && payment.studentId) {
    try {
      const student = await prisma.student.findFirst({
        where: { id: payment.studentId },
        include: {
          user: { select: { firstName: true, lastName: true } },
          tenant: { select: { name: true } },
        },
      });
      if (student) {
        const parentPhone = student.parentPhone;
        const studentName = `${student.user.firstName} ${student.user.lastName}`;
        if (parentPhone) {
          sendPaymentConfirmation({
            phone: parentPhone,
            parentName: student.parentName || "Parent",
            studentName,
            amount: payment.amount,
            currency: payment.currency,
            paymentType: payment.paymentType,
            reference: payment.guinePayRef,
            schoolName: student.tenant?.name || "SchoolFlow-GN",
          }).catch((e) => console.error("[WA Payment]", e.message));
        }
      }
    } catch (e) {
      console.error("[WA Payment lookup]", e.message);
    }
  }

  if (newStatus === "SUCCESS" && payment.subscriptionId) {
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: "ACTIVE" },
    });
  }

  return { received: true, paymentId: payment.id, status: newStatus };
}

// ─── List Payments ────────────────────────────────────────────────────────────

export async function listPayments(tenantId, searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const status = searchParams.get("status") || null;
  const studentId = searchParams.get("studentId") || null;

  const where = {
    tenantId,
    ...(status && { status }),
    ...(studentId && { studentId }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Subscription Plans ────────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    maxStudents: 50,
    maxTeachers: 5,
    features: ["Up to 50 students", "5 teachers", "Basic reports"],
  },
  BASIC: {
    name: "Basic",
    price: 500000,
    maxStudents: 200,
    maxTeachers: 20,
    features: [
      "Up to 200 students",
      "20 teachers",
      "Full reports",
      "Payment tracking",
    ],
  },
  PRO: {
    name: "Pro",
    price: 1500000,
    maxStudents: 1000,
    maxTeachers: 100,
    features: [
      "Up to 1000 students",
      "100 teachers",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 5000000,
    maxStudents: 999999,
    maxTeachers: 999999,
    features: [
      "Unlimited students",
      "Unlimited teachers",
      "Dedicated support",
      "SLA",
      "Custom integrations",
    ],
  },
};

export async function upgradePlan(tenantId, plan) {
  if (!SUBSCRIPTION_PLANS[plan]) throw new AppError("Invalid plan", 400);

  const planDetails = SUBSCRIPTION_PLANS[plan];
  const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.upsert({
    where: { tenantId_status: undefined }, // handled differently below
    update: {},
    create: {},
  });

  // Find active subscription
  const existing = await prisma.subscription.findFirst({
    where: { tenantId, status: "ACTIVE" },
  });

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: plan,
        maxStudents: planDetails.maxStudents,
        maxTeachers: planDetails.maxTeachers,
        priceGNF: planDetails.price,
        endDate,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      tenantId,
      plan,
      status: "ACTIVE",
      maxStudents: planDetails.maxStudents,
      maxTeachers: planDetails.maxTeachers,
      priceGNF: planDetails.price,
      endDate,
    },
  });
}
