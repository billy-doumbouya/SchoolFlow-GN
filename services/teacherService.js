import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { getPlanByKey } from '@/lib/pricing'
import { sendTeacherWelcome } from '@/services/whatsappService'
import { generateTempPassword } from '@/lib/passwordGen'
import { AppError, NotFoundError, getPagination, buildPaginationMeta } from '@/lib/api'

export async function listTeachers(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)
  const search = searchParams.get('search') || ''

  const where = {
    tenantId,
    isActive: true,
    ...(search && {
      user: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
        ],
      },
    }),
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        classes: {
          where:  { isActive: true },
          select: { id: true, name: true, level: true },
        },
        subjectTeachers: {
          include: { subject: { select: { id: true, name: true, code: true } } },
        },
      },
    }),
    prisma.teacher.count({ where }),
  ])

  return { teachers, pagination: buildPaginationMeta(total, page, limit) }
}

export async function getTeacher(tenantId, teacherId) {
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, tenantId },
    include: {
      user: true,
      classes: { where: { isActive: true }, include: { enrollments: { where: { isActive: true } } } },
      subjectTeachers: { include: { subject: true } },
    },
  })
  if (!teacher) throw new NotFoundError('Teacher not found')
  return teacher
}

export async function createTeacher(tenantId, data) {
  // ── Quota enforcement ──────────────────────────────────────────────────────
  const [teacherCount, subscription] = await Promise.all([
    prisma.teacher.count({ where: { tenantId, isActive: true } }),
    prisma.subscription.findFirst({ where: { tenantId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
  ])
  const plan  = getPlanByKey(subscription?.plan || 'FREE')
  const limit = subscription?.maxTeachers || plan.maxTeachers
  if (teacherCount >= limit) {
    throw new AppError(
      `Quota atteint — votre plan ${plan.label} est limité à ${limit} enseignants actifs. Upgradez votre abonnement.`,
      403
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  const { email, password, firstName, lastName, qualification, specialization } = data

  const existingUser = await prisma.user.findFirst({ where: { tenantId, email } })
  if (existingUser) throw new AppError('Email already exists in this school', 409)

  const count = await prisma.teacher.count({ where: { tenantId } })
  const teacherCode = `TCH${String(count + 1).padStart(4, '0')}`
  const tempPassword = data.password || generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { tenantId, email, passwordHash, firstName, lastName, role: 'TEACHER' },
    })
    return tx.teacher.create({
      data: { tenantId, userId: user.id, teacherCode, qualification, specialization },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    })
  }).then(async (teacher) => {
    // Send WhatsApp (non-blocking)
    if (data.phone) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
      sendTeacherWelcome({
        phone:       data.phone,
        firstName:   teacher.user.firstName,
        lastName:    teacher.user.lastName,
        schoolName:  tenant?.name || 'SchoolFlow',
        email:       teacher.user.email,
        password:    tempPassword,
        teacherCode: teacher.teacherCode,
      }).catch((e) => console.error('[WA Teacher]', e.message))
    }
    return teacher
  })
}

export async function updateTeacher(tenantId, teacherId, data) {
  const teacher = await prisma.teacher.findFirst({ where: { id: teacherId, tenantId } })
  if (!teacher) throw new NotFoundError('Teacher not found')

  const { firstName, lastName, email, qualification, specialization, isActive } = data

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: teacher.userId },
      data: {
        ...(firstName  && { firstName }),
        ...(lastName   && { lastName }),
        ...(email      && { email }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return tx.teacher.update({
      where: { id: teacherId },
      data: {
        ...(qualification    && { qualification }),
        ...(specialization   && { specialization }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    })
  })
}

export async function deleteTeacher(tenantId, teacherId) {
  const teacher = await prisma.teacher.findFirst({ where: { id: teacherId, tenantId } })
  if (!teacher) throw new NotFoundError('Teacher not found')

  await prisma.$transaction([
    prisma.teacher.update({ where: { id: teacherId }, data: { isActive: false } }),
    prisma.user.update({ where: { id: teacher.userId }, data: { isActive: false } }),
  ])

  return { message: 'Teacher deactivated successfully' }
}

export async function assignSubjectToTeacher(tenantId, teacherId, subjectId) {
  const [teacher, subject] = await Promise.all([
    prisma.teacher.findFirst({ where: { id: teacherId, tenantId } }),
    prisma.subject.findFirst({ where: { id: subjectId, tenantId } }),
  ])
  if (!teacher) throw new NotFoundError('Teacher not found')
  if (!subject) throw new NotFoundError('Subject not found')

  return prisma.subjectTeacher.upsert({
    where:  { subjectId_teacherId: { subjectId, teacherId } },
    update: {},
    create: { tenantId, subjectId, teacherId },
  })
}
