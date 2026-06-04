import { prisma } from '@/lib/prisma'

export async function getAdminDashboardStats(tenantId) {
  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    monthlyPayments,
    recentPayments,
    recentStudents,
    subscription,
    gradeDistribution,
  ] = await Promise.all([
    prisma.student.count({ where: { tenantId, isActive: true } }),
    prisma.teacher.count({ where: { tenantId, isActive: true } }),
    prisma.class.count({ where: { tenantId, isActive: true } }),
    prisma.subject.count({ where: { tenantId, isActive: true } }),

    // Monthly revenue
    prisma.payment.aggregate({
      where:  { tenantId, status: 'SUCCESS', paidAt: { gte: startOfMonth } },
      _sum:   { amount: true },
      _count: true,
    }),

    // Recent payments
    prisma.payment.findMany({
      where:   { tenantId },
      take:    5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    }),

    // Recent students
    prisma.student.findMany({
      where:   { tenantId, isActive: true },
      take:    5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    }),

    // Current subscription
    prisma.subscription.findFirst({
      where:   { tenantId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    }),

    // Grade distribution (count per grade letter)
    prisma.grade.groupBy({
      by:    ['grade'],
      where: { tenantId },
      _count: { grade: true },
    }),
  ])

  // Monthly payment trend (last 6 months)
  const paymentTrend = await getMonthlyPaymentTrend(tenantId, 6)

  return {
    kpis: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      monthlyRevenue:       monthlyPayments._sum.amount || 0,
      monthlyPaymentCount:  monthlyPayments._count || 0,
    },
    recentPayments,
    recentStudents,
    subscription,
    gradeDistribution,
    paymentTrend,
  }
}

async function getMonthlyPaymentTrend(tenantId, months) {
  const result = []
  const now    = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const agg = await prisma.payment.aggregate({
      where: { tenantId, status: 'SUCCESS', paidAt: { gte: start, lte: end } },
      _sum:  { amount: true },
    })

    result.push({
      month:   start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      revenue: agg._sum.amount || 0,
    })
  }

  return result
}

export async function getTeacherDashboardStats(tenantId, teacherId) {
  const [myClasses, totalStudents, pendingExams, recentGrades] = await Promise.all([
    prisma.class.findMany({
      where:   { tenantId, teacherId, isActive: true },
      include: { _count: { select: { enrollments: { where: { isActive: true } } } } },
    }),
    prisma.enrollment.count({
      where: {
        isActive: true,
        class: { tenantId, teacherId },
      },
    }),
    prisma.exam.count({
      where: {
        tenantId,
        class: { teacherId },
        examDate: { gte: new Date() },
        isActive: true,
      },
    }),
    prisma.grade.findMany({
      where:   { tenantId, exam: { class: { teacherId } } },
      take:    5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        exam:    { select: { title: true } },
        subject: { select: { name: true } },
      },
    }),
  ])

  return { myClasses, totalStudents, pendingExams, recentGrades }
}

export async function getStudentDashboardStats(tenantId, studentId) {
  const [grades, enrollments, upcomingExams, payments] = await Promise.all([
    prisma.grade.findMany({
      where:   { tenantId, studentId },
      take:    5,
      orderBy: { createdAt: 'desc' },
      include: {
        exam:    { select: { title: true, totalMarks: true, passingMarks: true } },
        subject: { select: { name: true } },
      },
    }),
    prisma.enrollment.findMany({
      where:   { studentId, isActive: true },
      include: { class: { select: { name: true, level: true } } },
    }),
    prisma.exam.findMany({
      where:   { tenantId, isActive: true, examDate: { gte: new Date() }, class: { enrollments: { some: { studentId, isActive: true } } } },
      take:    5,
      orderBy: { examDate: 'asc' },
      include: { subject: { select: { name: true } }, class: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      where:   { tenantId, studentId },
      take:    5,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const gradeAvg = grades.length
    ? (grades.reduce((s, g) => s + (g.marks / g.exam.totalMarks) * 100, 0) / grades.length).toFixed(1)
    : 0

  return { grades, enrollments, upcomingExams, payments, gradeAvg }
}
