import { prisma } from '@/lib/prisma'

// ─── Create a notification ────────────────────────────────────────────────────
export async function createNotification(tenantId, userId, { title, message, type = 'INFO', link = null }) {
  return prisma.notification.create({
    data: { tenantId, userId, title, message, type, link },
  })
}

// ─── Create notification for all users of a role in a tenant ─────────────────
export async function notifyRole(tenantId, role, { title, message, type = 'INFO', link = null }) {
  const users = await prisma.user.findMany({
    where: { tenantId, role, isActive: true },
    select: { id: true },
  })

  if (!users.length) return

  await prisma.notification.createMany({
    data: users.map((u) => ({ tenantId, userId: u.id, title, message, type, link })),
  })
}

// ─── List notifications for a user ───────────────────────────────────────────
export async function listNotifications(tenantId, userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where:   { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { tenantId, userId } }),
    prisma.notification.count({ where: { tenantId, userId, isRead: false } }),
  ])

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ─── Mark one as read ─────────────────────────────────────────────────────────
export async function markAsRead(tenantId, userId, notificationId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, tenantId, userId },
    data:  { isRead: true },
  })
}

// ─── Mark all as read ─────────────────────────────────────────────────────────
export async function markAllAsRead(tenantId, userId) {
  return prisma.notification.updateMany({
    where: { tenantId, userId, isRead: false },
    data:  { isRead: true },
  })
}

// ─── Delete a notification ────────────────────────────────────────────────────
export async function deleteNotification(tenantId, userId, notificationId) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, tenantId, userId },
  })
}

// ─── Helpers called from other services ──────────────────────────────────────

// Called when a payment succeeds
export async function notifyPaymentSuccess(tenantId, { studentName, amount, currency = 'GNF' }) {
  await notifyRole(tenantId, 'SCHOOL_ADMIN', {
    title:   '💳 Paiement reçu',
    message: `${studentName} a payé ${new Intl.NumberFormat('fr-GN').format(amount)} ${currency}`,
    type:    'SUCCESS',
    link:    '/dashboard/admin/payments',
  })
}

// Called when a new student is registered
export async function notifyNewStudent(tenantId, { studentName }) {
  await notifyRole(tenantId, 'SCHOOL_ADMIN', {
    title:   '🎓 Nouvel élève inscrit',
    message: `${studentName} vient d'être inscrit sur la plateforme`,
    type:    'INFO',
    link:    '/dashboard/admin/students',
  })
}

// Called when an exam is scheduled
export async function notifyExamScheduled(tenantId, { examTitle, className, examDate }) {
  const dateStr = new Date(examDate).toLocaleDateString('fr-GN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  await notifyRole(tenantId, 'TEACHER', {
    title:   '📋 Examen planifié',
    message: `${examTitle} pour la classe ${className} le ${dateStr}`,
    type:    'INFO',
    link:    '/dashboard/teacher/exams',
  })
}

// Called when grades are submitted
export async function notifyGradesSubmitted(tenantId, { examTitle, count }) {
  await notifyRole(tenantId, 'SCHOOL_ADMIN', {
    title:   '✅ Notes soumises',
    message: `${count} notes ont été enregistrées pour l'examen "${examTitle}"`,
    type:    'SUCCESS',
    link:    '/dashboard/admin/grades',
  })
}
