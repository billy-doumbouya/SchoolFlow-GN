/**
 * paymentService.js — migré de GenuinePay → Djomy
 *
 * Changements majeurs :
 *  - Auth : HMAC-SHA256(clientId, clientSecret) + Bearer token à chaque requête
 *  - createPaymentIntent → djomyRequest POST /v1/payments/gateway (redirect flow)
 *  - Champ guinePayIntentId → djomyTransactionId  (+ djomyRef pour la ref finale)
 *  - Webhook : signature v1:<hex> via HMAC-SHA256(rawBody, clientSecret)
 *  - Vérification obligatoire via verify_payment avant tout fulfill
 */

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api";
import { sendPaymentConfirmation } from "@/services/whatsappService";
import { djomyRequest, verifyWebhookSignature } from "@/lib/djomy";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Create Payment (gateway flow — recommandé) ───────────────────────────────

export async function createPaymentIntent(tenantId, data) {
  const {
    amount,
    currency = "GNF",
    studentId,
    description,
    paymentType = "SCHOOL_FEE",
    subscriptionId,
    payerPhone, // ⚠️ obligatoire pour Djomy même en pré-remplissage
  } = data;

  // En mode dev sans clés, utiliser le mock
  const isDev = !process.env.DJOMY_CLIENT_ID;

  let djomyTransactionId, redirectUrl;

  if (!isDev) {
    /**
     * create_payment_gateway : Djomy gère le portail de paiement et l'OTP.
     * Ne pas appeler confirm_otp après — attendre le webhook.
     */
    const resp = await djomyRequest("POST", "/v1/payments/gateway", {
      amount,
      currency,
      description,
      payerNumber: payerPhone, // ⚠️ champ obligatoire, API retourne 400 si absent
      returnUrl: `${APP_URL}/api/payments/callback`,
      // ⚠️ Le webhook doit être configuré dans le dashboard Djomy (pas dans le payload)
      metadata: {
        // ⚠️ objet plat uniquement — pas de nested ni d'arrays
        tenantId,
        studentId: studentId || "",
        paymentType,
        subscriptionId: subscriptionId || "",
      },
    });

    djomyTransactionId = resp.transactionId;
    redirectUrl = resp.redirectUrl; // ⚠️ Rediriger immédiatement — le lien expire
  } else {
    // Mock développement local
    djomyTransactionId = `djomy_mock_${Date.now()}`;
    redirectUrl = `${APP_URL}/dashboard/payments/mock-checkout?tx=${djomyTransactionId}`;
  }

  // Persister en base (champ renommé guinePayIntentId → djomyTransactionId)
  const payment = await prisma.payment.create({
    data: {
      tenantId,
      studentId: studentId || null,
      subscriptionId: subscriptionId || null,
      djomyTransactionId, // ← nouveau champ (voir migration Prisma ci-dessous)
      amount: parseFloat(amount),
      currency,
      status: "PENDING",
      paymentType,
      description,
      metadata: { redirectUrl },
    },
  });

  return { payment, redirectUrl };
}

// ─── Verify Payment (toujours appeler avant tout fulfill) ─────────────────────

export async function verifyDjomyPayment(transactionId) {
  const resp = await djomyRequest("GET", `/v1/payments/${transactionId}`);
  return resp.data;
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function processWebhook(rawBody, signatureHeader) {
  // 1. Vérifier la signature Djomy : "v1:<hex>"
  if (process.env.DJOMY_CLIENT_SECRET) {
    verifyWebhookSignature(rawBody, signatureHeader);
  }

  const payload = JSON.parse(rawBody);
  const { type, data: eventData } = payload;

  // 2. Retrouver le paiement en base
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { djomyTransactionId: eventData.transactionId },
        { djomyRef: eventData.reference },
      ],
    },
  });

  if (!payment) {
    console.warn("[Webhook] Paiement introuvable pour", eventData);
    return { received: true };
  }

  // 3. Idempotence : ignorer si déjà traité
  if (payment.webhookReceived && payment.status !== "PENDING") {
    console.log("[Webhook] Déjà traité, ignoré", payment.id);
    return { received: true, idempotent: true };
  }

  // 4. Mapper les événements Djomy
  //    ⚠️ N'agir sur payment.success QUE après vérification server-side
  let newStatus = payment.status;
  let paidAt = null;

  switch (type) {
    case "payment.success":
      // Vérification server-side obligatoire avant fulfill
      try {
        const verified = await verifyDjomyPayment(eventData.transactionId);
        if (verified.status !== "SUCCESS") {
          console.warn(
            "[Webhook] verify_payment ne confirme pas SUCCESS",
            verified.status,
          );
          return { received: true };
        }
      } catch (e) {
        console.error("[Webhook] Erreur verify_payment", e.message);
        return { received: true };
      }
      newStatus = "SUCCESS";
      paidAt = new Date();
      break;

    case "payment.failed":
      newStatus = "FAILED";
      break;

    case "payment.cancelled":
      newStatus = "CANCELLED";
      break;

    // Événements intermédiaires — on log mais on n'agit pas
    case "payment.created":
    case "payment.redirected":
    case "payment.pending":
      console.log("[Webhook] Événement intermédiaire ignoré:", type);
      return { received: true };

    default:
      console.log("[Webhook] Événement non géré:", type);
      return { received: true };
  }

  // 5. Mettre à jour le paiement
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      djomyRef: eventData.reference || payment.djomyRef,
      webhookReceived: true,
      webhookReceivedAt: new Date(),
      ...(paidAt && { paidAt }),
      ...(newStatus === "FAILED" && {
        failureReason: eventData.failureReason || eventData.failure_reason,
      }),
    },
  });

  // 6. Activer l'abonnement si paiement de souscription
  if (newStatus === "SUCCESS" && payment.subscriptionId) {
    try {
      const sub = await prisma.subscription.findUnique({
        where: { id: payment.subscriptionId },
      });
      if (sub) {
        const { getPlanByKey } = await import("@/lib/pricing");
        const planDetails = getPlanByKey(sub.plan);
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            maxStudents: planDetails.maxStudents,
            maxTeachers: planDetails.maxTeachers,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
        // Notifier l'admin école via WhatsApp
        try {
          const admin = await prisma.user.findFirst({
            where: { tenantId: payment.tenantId, role: "SCHOOL_ADMIN" },
          });
          if (admin?.phone) {
            const { sendWhatsApp } = await import("@/services/whatsappService");
            // sendWhatsApp(admin.phone, ...)
          }
        } catch {}
      }
    } catch (e) {
      console.error("[Webhook] Erreur activation plan:", e.message);
    }
  }

  // 7. Envoyer confirmation WhatsApp au parent si paiement étudiant
  if (newStatus === "SUCCESS" && payment.studentId) {
    try {
      const student = await prisma.student.findFirst({
        where: { id: payment.studentId },
        include: {
          user: { select: { firstName: true, lastName: true } },
          tenant: { select: { name: true } },
        },
      });
      if (student?.parentPhone) {
        sendPaymentConfirmation({
          phone: student.parentPhone,
          parentName: student.parentName || "Parent",
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          amount: payment.amount,
          currency: payment.currency,
          paymentType: payment.paymentType,
          reference: payment.djomyRef, // ← anciennement guinePayRef
          schoolName: student.tenant?.name || "SchoolFlow",
        }).catch((e) => console.error("[WA Payment]", e.message));
      }
    } catch (e) {
      console.error("[WA Payment lookup]", e.message);
    }
  }

  return { received: true, paymentId: payment.id, status: newStatus };
}

// ─── List Payments ────────────────────────────────────────────────────────────
// Inchangé — aucune dépendance à GenuinePay

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
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Subscription Plans — inchangé ────────────────────────────────────────────

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

  const existing = await prisma.subscription.findFirst({
    where: { tenantId, status: "ACTIVE" },
  });

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan,
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
