import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { sendStudentWelcome, sendParentWelcome } from '@/services/whatsappService'
import { generateTempPassword } from '@/lib/passwordGen'
import { AppError, NotFoundError, getPagination, buildPaginationMeta } from '@/lib/api'

// ─── List Students ─────────────────────────────────────────────────────────────

export async function listStudents(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)
  const search = searchParams.get('search') || ''
  const classId = searchParams.get('classId') || null

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
    ...(classId && {
      enrollments: { some: { classId, isActive: true } },
    }),
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, isActive: true },
        },
        enrollments: {
          where:   { isActive: true },
          include: { class: { select: { id: true, name: true, level: true } } },
        },
      },
    }),
    prisma.student.count({ where }),
  ])

  return {
    students,
    pagination: buildPaginationMeta(total, page, limit),
  }
}

// ─── Get Student ──────────────────────────────────────────────────────────────

export async function getStudent(tenantId, studentId) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true },
      },
      enrollments: {
        where:   { isActive: true },
        include: {
          class: {
            include: {
              teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
              subjects: { include: { subject: true } },
            },
          },
        },
      },
      grades: {
        include: {
          exam:    { select: { title: true, examType: true, totalMarks: true } },
          subject: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        take:    10,
      },
    },
  })

  if (!student) throw new NotFoundError('Student not found')
  return student
}

// ─── Create Student ────────────────────────────────────────────────────────────

export async function createStudent(tenantId, data) {
  const { email, password, firstName, lastName, dateOfBirth, gender, address, parentName, parentPhone, parentEmail } = data

  // Check email uniqueness within tenant
  const existingUser = await prisma.user.findFirst({ where: { tenantId, email } })
  if (existingUser) throw new AppError('Email already exists in this school', 409)

  // Generate student code
  const count = await prisma.student.count({ where: { tenantId } })
  const studentCode = `STU${String(count + 1).padStart(5, '0')}`

  // Generate secure temp password if not provided
  const tempPassword = password || generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'STUDENT',
        ...(data.phone && { phone: data.phone }),
      },
    })

    const student = await tx.student.create({
      data: {
        tenantId,
        userId:      user.id,
        studentCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        parentName,
        parentPhone,
        parentEmail,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    return student
  })

  // Send WhatsApp notifications (non-blocking)
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
  const cls = result.enrollments?.[0]?.class?.name || null

  // To student
  if (data.phone) {
    sendStudentWelcome({
      phone:      data.phone,
      firstName:  result.user.firstName,
      lastName:   result.user.lastName,
      schoolName: tenant?.name || 'SchoolFlow',
      email:      result.user.email,
      password:   tempPassword,
      className:  cls,
    }).catch((e) => console.error('[WA Student]', e.message))
  }

  // To parent
  if (data.parentPhone) {
    sendParentWelcome({
      phone:       data.parentPhone,
      parentName:  data.parentName || 'Parent',
      studentName: `${result.user.firstName} ${result.user.lastName}`,
      schoolName:  tenant?.name || 'SchoolFlow',
      className:   cls,
    }).catch((e) => console.error('[WA Parent]', e.message))
  }

  return result
}

// ─── Update Student ────────────────────────────────────────────────────────────

export async function updateStudent(tenantId, studentId, data) {
  const student = await prisma.student.findFirst({ where: { id: studentId, tenantId } })
  if (!student) throw new NotFoundError('Student not found')

  const { firstName, lastName, email, dateOfBirth, gender, address, parentName, parentPhone, parentEmail, isActive } = data

  const updated = await prisma.$transaction(async (tx) => {
    if (firstName || lastName || email !== undefined || isActive !== undefined) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          ...(firstName  && { firstName }),
          ...(lastName   && { lastName }),
          ...(email      && { email }),
          ...(isActive !== undefined && { isActive }),
        },
      })
    }

    return tx.student.update({
      where: { id: studentId },
      data: {
        ...(dateOfBirth  && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender       && { gender }),
        ...(address      && { address }),
        ...(parentName   && { parentName }),
        ...(parentPhone  && { parentPhone }),
        ...(parentEmail  && { parentEmail }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })
  })

  return updated
}

// ─── Delete Student ────────────────────────────────────────────────────────────

export async function deleteStudent(tenantId, studentId) {
  const student = await prisma.student.findFirst({ where: { id: studentId, tenantId } })
  if (!student) throw new NotFoundError('Student not found')

  // Soft delete
  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { isActive: false } }),
    prisma.user.update({ where: { id: student.userId }, data: { isActive: false } }),
  ])

  return { message: 'Student deactivated successfully' }
}

// ─── Enroll Student in Class ───────────────────────────────────────────────────

export async function enrollStudentInClass(tenantId, studentId, classId) {
  const [student, cls] = await Promise.all([
    prisma.student.findFirst({ where: { id: studentId, tenantId } }),
    prisma.class.findFirst({ where: { id: classId, tenantId } }),
  ])

  if (!student) throw new NotFoundError('Student not found')
  if (!cls) throw new NotFoundError('Class not found')

  // Check capacity
  const enrollmentCount = await prisma.enrollment.count({ where: { classId, isActive: true } })
  if (enrollmentCount >= cls.capacity) {
    throw new AppError('Class is at full capacity', 400)
  }

  const enrollment = await prisma.enrollment.upsert({
    where:  { studentId_classId: { studentId, classId } },
    update: { isActive: true },
    create: { tenantId, studentId, classId },
  })

  return enrollment
}
