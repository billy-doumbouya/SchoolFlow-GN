import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, getPagination, buildPaginationMeta } from '@/lib/api'

// ─── CLASSES ──────────────────────────────────────────────────────────────────

export async function listClasses(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)
  const academicYear = searchParams.get('academicYear') || null

  const where = {
    tenantId,
    isActive: true,
    ...(academicYear && { academicYear }),
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take:    limit,
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        _count: {
          select: {
            enrollments: { where: { isActive: true } },
          },
        },
      },
    }),
    prisma.class.count({ where }),
  ])

  return { classes, pagination: buildPaginationMeta(total, page, limit) }
}

export async function getClass(tenantId, classId) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, tenantId },
    include: {
      teacher: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
      enrollments: {
        where: { isActive: true },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
          },
        },
      },
      exams: {
        where:   { isActive: true },
        include: { subject: { select: { name: true, code: true } } },
        orderBy: { examDate: 'desc' },
      },
    },
  })
  if (!cls) throw new NotFoundError('Class not found')
  return cls
}

export async function createClass(tenantId, data) {
  const { name, level, section, academicYear, teacherId, capacity } = data

  // Check uniqueness
  const existing = await prisma.class.findFirst({ where: { tenantId, name, academicYear } })
  if (existing) throw new AppError('A class with this name already exists for this academic year', 409)

  return prisma.class.create({
    data: { tenantId, name, level, section, academicYear, teacherId, capacity: capacity || 30 },
    include: {
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  })
}

export async function updateClass(tenantId, classId, data) {
  const cls = await prisma.class.findFirst({ where: { id: classId, tenantId } })
  if (!cls) throw new NotFoundError('Class not found')

  return prisma.class.update({
    where: { id: classId },
    data:  { ...data },
    include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
  })
}

export async function deleteClass(tenantId, classId) {
  const cls = await prisma.class.findFirst({ where: { id: classId, tenantId } })
  if (!cls) throw new NotFoundError('Class not found')
  await prisma.class.update({ where: { id: classId }, data: { isActive: false } })
  return { message: 'Class deactivated successfully' }
}

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────

export async function listSubjects(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)

  const where = { tenantId, isActive: true }
  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { name: 'asc' },
      include: {
        _count:          { select: { subjectTeachers: true } },
        subjectTeachers: {
          include: {
            teacher: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    }),
    prisma.subject.count({ where }),
  ])

  return { subjects, pagination: buildPaginationMeta(total, page, limit) }
}

export async function createSubject(tenantId, data) {
  const { name, code, description, credits } = data

  const existing = await prisma.subject.findFirst({ where: { tenantId, code } })
  if (existing) throw new AppError('Subject code already exists', 409)

  return prisma.subject.create({
    data: { tenantId, name, code: code.toUpperCase(), description, credits: credits || 1 },
  })
}

export async function updateSubject(tenantId, subjectId, data) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, tenantId } })
  if (!subject) throw new NotFoundError('Subject not found')
  return prisma.subject.update({ where: { id: subjectId }, data })
}

export async function deleteSubject(tenantId, subjectId) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, tenantId } })
  if (!subject) throw new NotFoundError('Subject not found')
  await prisma.subject.update({ where: { id: subjectId }, data: { isActive: false } })
  return { message: 'Subject deactivated successfully' }
}
