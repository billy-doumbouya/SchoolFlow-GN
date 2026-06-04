import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, getPagination, buildPaginationMeta } from '@/lib/api'

// ─── Grade helper ─────────────────────────────────────────────────────────────

function calculateGradeLetter(marks, totalMarks) {
  const pct = (marks / totalMarks) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

// ─── EXAMS ────────────────────────────────────────────────────────────────────

export async function listExams(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)
  const classId   = searchParams.get('classId')   || null
  const subjectId = searchParams.get('subjectId') || null

  const where = {
    tenantId,
    isActive: true,
    ...(classId   && { classId }),
    ...(subjectId && { subjectId }),
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { examDate: 'desc' },
      include: {
        class:   { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
        _count:  { select: { grades: true } },
      },
    }),
    prisma.exam.count({ where }),
  ])

  return { exams, pagination: buildPaginationMeta(total, page, limit) }
}

export async function createExam(tenantId, data) {
  const { classId, subjectId, title, examType, totalMarks, passingMarks, examDate, academicYear } = data

  const [cls, subject] = await Promise.all([
    prisma.class.findFirst({ where: { id: classId, tenantId } }),
    prisma.subject.findFirst({ where: { id: subjectId, tenantId } }),
  ])
  if (!cls)     throw new NotFoundError('Class not found')
  if (!subject) throw new NotFoundError('Subject not found')

  return prisma.exam.create({
    data: {
      tenantId,
      classId,
      subjectId,
      title,
      examType:    examType || 'TEST',
      totalMarks:  parseFloat(totalMarks),
      passingMarks: parseFloat(passingMarks),
      examDate:    new Date(examDate),
      academicYear,
    },
    include: {
      class:   { select: { name: true } },
      subject: { select: { name: true, code: true } },
    },
  })
}

export async function updateExam(tenantId, examId, data) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId } })
  if (!exam) throw new NotFoundError('Exam not found')
  return prisma.exam.update({ where: { id: examId }, data })
}

// ─── GRADES ───────────────────────────────────────────────────────────────────

export async function listGrades(tenantId, searchParams) {
  const { page, limit, skip } = getPagination(searchParams)
  const examId    = searchParams.get('examId')    || null
  const studentId = searchParams.get('studentId') || null
  const classId   = searchParams.get('classId')   || null

  const where = {
    tenantId,
    ...(examId    && { examId }),
    ...(studentId && { studentId }),
    ...(classId   && { exam: { classId } }),
  }

  const [grades, total] = await Promise.all([
    prisma.grade.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        exam:    { select: { title: true, totalMarks: true, passingMarks: true, examType: true } },
        subject: { select: { name: true, code: true } },
      },
    }),
    prisma.grade.count({ where }),
  ])

  return { grades, pagination: buildPaginationMeta(total, page, limit) }
}

export async function submitGrades(tenantId, examId, gradesData) {
  // gradesData: [{ studentId, marks, remarks }]
  const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId } })
  if (!exam) throw new NotFoundError('Exam not found')

  // Validate all marks
  for (const g of gradesData) {
    if (g.marks < 0 || g.marks > exam.totalMarks) {
      throw new AppError(`Marks must be between 0 and ${exam.totalMarks}`, 400)
    }
  }

  // Upsert all grades
  const results = await prisma.$transaction(
    gradesData.map((g) =>
      prisma.grade.upsert({
        where:  { studentId_examId: { studentId: g.studentId, examId } },
        update: {
          marks:   g.marks,
          grade:   calculateGradeLetter(g.marks, exam.totalMarks),
          remarks: g.remarks,
        },
        create: {
          tenantId,
          studentId:  g.studentId,
          examId,
          subjectId:  exam.subjectId,
          marks:      g.marks,
          grade:      calculateGradeLetter(g.marks, exam.totalMarks),
          remarks:    g.remarks,
        },
      })
    )
  )

  // Send WhatsApp — batch fetch all students in ONE query (no N+1)
  ;(async () => {
    try {
      const [tenant, students, subject] = await Promise.all([
        prisma.tenant.findFirst({ where: { id: tenantId }, select: { name: true } }),
        prisma.student.findMany({
          where:   { id: { in: gradesData.map((g) => g.studentId) } },
          include: { user: { select: { firstName: true, lastName: true, phone: true } } },
        }),
        prisma.subject.findFirst({ where: { id: exam.subjectId }, select: { name: true } }),
      ])

      const studentMap = Object.fromEntries(students.map((s) => [s.id, s]))

      for (const g of gradesData) {
        const student = studentMap[g.studentId]
        if (!student) continue
        sendGradeNotification({
          phoneStudent: student.user.phone,
          phoneParent:  student.parentPhone,
          studentName:  `${student.user.firstName} ${student.user.lastName}`,
          subjectName:  subject?.name || 'Matière',
          examTitle:    exam.title,
          marks:        g.marks,
          totalMarks:   exam.totalMarks,
          grade:        results.find((r) => r.studentId === g.studentId)?.grade,
          passed:       g.marks >= exam.passingMarks,
          schoolName:   tenant?.name || 'SchoolFlow',
        }).catch((e) => console.error('[WA Grade]', e.message))
      }
    } catch (e) { console.error('[WA Grades lookup]', e.message) }
  })()

  return { grades: results, count: results.length }
}

export async function getStudentReport(tenantId, studentId) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId },
    include: {
      user: { select: { firstName: true, lastName: true } },
      grades: {
        include: {
          exam:    { select: { title: true, examType: true, totalMarks: true, passingMarks: true, examDate: true } },
          subject: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!student) throw new NotFoundError('Student not found')

  // Compute stats
  const totalGrades = student.grades.length
  const passed      = student.grades.filter((g) => g.marks >= g.exam.passingMarks).length
  const avgMarks    = totalGrades > 0
    ? (student.grades.reduce((sum, g) => sum + (g.marks / g.exam.totalMarks) * 100, 0) / totalGrades).toFixed(1)
    : 0

  return {
    student,
    stats: { totalGrades, passed, failed: totalGrades - passed, averagePercent: avgMarks },
  }
}
