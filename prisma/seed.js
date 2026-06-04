const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SEED REFUSED in production environment!')
    console.error('Never run db:seed on production database.')
    process.exit(1)
  }
  console.log('🌱 Seeding database...')

  // ─── Create Demo School Tenant ─────────────────────────────────────────────
  let tenant = await prisma.tenant.findUnique({ where: { slug: 'ecole-excellence' } })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name:  'École Excellence Conakry',
        slug:  'ecole-excellence',
        email: 'contact@excellence.gn',
        phone: '+224 620 000 001',
        address: 'Kaloum, Conakry, Guinea',
      },
    })
    console.log('✅ Tenant created:', tenant.name)
  }

  // ─── Super Admin ───────────────────────────────────────────────────────────
  const superAdminEmail = 'superadmin@schoolflow.gn'
  let superAdminTenant  = await prisma.tenant.findUnique({ where: { slug: 'schoolflow-platform' } })
  if (!superAdminTenant) {
    superAdminTenant = await prisma.tenant.create({
      data: { name: 'SchoolFlow Platform', slug: 'schoolflow-platform', email: 'platform@schoolflow.gn' },
    })
  }

  const existingSuperAdmin = await prisma.user.findFirst({ where: { email: superAdminEmail } })
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        tenantId:     superAdminTenant.id,
        email:        superAdminEmail,
        passwordHash: await bcrypt.hash('SuperAdmin@123', 12),
        firstName:    'Platform',
        lastName:     'Admin',
        role:         'SUPER_ADMIN',
      },
    })
    console.log('✅ Super admin created:', superAdminEmail)
  }

  // ─── School Admin ──────────────────────────────────────────────────────────
  const adminEmail = 'admin@excellence.gn'
  let adminUser = await prisma.user.findFirst({ where: { tenantId: tenant.id, email: adminEmail } })
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        tenantId:     tenant.id,
        email:        adminEmail,
        passwordHash: await bcrypt.hash('Admin@123', 12),
        firstName:    'Directeur',
        lastName:     'Diallo',
        role:         'SCHOOL_ADMIN',
      },
    })
    console.log('✅ School admin created:', adminEmail)
  }

  // ─── Free Subscription ─────────────────────────────────────────────────────
  const existingSub = await prisma.subscription.findFirst({ where: { tenantId: tenant.id } })
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        tenantId:    tenant.id,
        plan:        'PRO',
        status:      'ACTIVE',
        maxStudents: 1000,
        maxTeachers: 100,
        priceGNF:    1500000,
        endDate:     new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
    console.log('✅ Subscription created: PRO plan')
  }

  // ─── Subjects ──────────────────────────────────────────────────────────────
  const subjectData = [
    { name: 'Mathematics',     code: 'MATH',  credits: 4 },
    { name: 'French',          code: 'FREN',  credits: 4 },
    { name: 'Physics',         code: 'PHYS',  credits: 3 },
    { name: 'Chemistry',       code: 'CHEM',  credits: 3 },
    { name: 'Biology',         code: 'BIO',   credits: 3 },
    { name: 'History',         code: 'HIST',  credits: 2 },
    { name: 'Geography',       code: 'GEO',   credits: 2 },
    { name: 'English',         code: 'ENG',   credits: 3 },
    { name: 'Computer Science',code: 'CS',    credits: 2 },
    { name: 'Physical Education', code: 'PE', credits: 1 },
  ]

  const subjects = []
  for (const s of subjectData) {
    const existing = await prisma.subject.findFirst({ where: { tenantId: tenant.id, code: s.code } })
    if (!existing) {
      const created = await prisma.subject.create({ data: { tenantId: tenant.id, ...s } })
      subjects.push(created)
    } else {
      subjects.push(existing)
    }
  }
  console.log(`✅ ${subjectData.length} subjects seeded`)

  // ─── Teachers ──────────────────────────────────────────────────────────────
  const teacherData = [
    { firstName: 'Ibrahima', lastName: 'Sow',    email: 'isow@excellence.gn',   specialization: 'Mathematics, Physics' },
    { firstName: 'Fatoumata',lastName: 'Barry',  email: 'fbarry@excellence.gn', specialization: 'French, History' },
    { firstName: 'Mamadou',  lastName: 'Camara', email: 'mcamara@excellence.gn',specialization: 'Chemistry, Biology' },
  ]

  const teachers = []
  for (let i = 0; i < teacherData.length; i++) {
    const td = teacherData[i]
    const existing = await prisma.user.findFirst({ where: { tenantId: tenant.id, email: td.email } })
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          tenantId:     tenant.id,
          email:        td.email,
          passwordHash: await bcrypt.hash('Teacher@123', 12),
          firstName:    td.firstName,
          lastName:     td.lastName,
          role:         'TEACHER',
        },
      })
      const teacher = await prisma.teacher.create({
        data: {
          tenantId:       tenant.id,
          userId:         user.id,
          teacherCode:    `TCH${String(i + 1).padStart(4, '0')}`,
          specialization: td.specialization,
          qualification:  'Masters Degree',
        },
      })
      teachers.push(teacher)
    } else {
      const t = await prisma.teacher.findFirst({ where: { userId: existing.id } })
      if (t) teachers.push(t)
    }
  }
  console.log(`✅ ${teacherData.length} teachers seeded`)

  // ─── Classes ───────────────────────────────────────────────────────────────
  const classData = [
    { name: '6ème A', level: '6ème', section: 'A', academicYear: '2024-2025', capacity: 35 },
    { name: '6ème B', level: '6ème', section: 'B', academicYear: '2024-2025', capacity: 35 },
    { name: '5ème A', level: '5ème', section: 'A', academicYear: '2024-2025', capacity: 35 },
    { name: 'Terminale S', level: 'Terminale', section: 'S', academicYear: '2024-2025', capacity: 30 },
  ]

  const classes = []
  for (let i = 0; i < classData.length; i++) {
    const cd = classData[i]
    const existing = await prisma.class.findFirst({ where: { tenantId: tenant.id, name: cd.name, academicYear: cd.academicYear } })
    if (!existing) {
      const cls = await prisma.class.create({
        data: {
          tenantId:    tenant.id,
          teacherId:   teachers[i % teachers.length]?.id || null,
          ...cd,
        },
      })
      classes.push(cls)
    } else {
      classes.push(existing)
    }
  }
  console.log(`✅ ${classData.length} classes seeded`)

  // ─── Students ──────────────────────────────────────────────────────────────
  const studentNames = [
    ['Alpha', 'Diallo'],  ['Mariama', 'Bah'],     ['Oumar', 'Sylla'],
    ['Aminata', 'Camara'],['Boubacar', 'Barry'],   ['Kadiatou', 'Sow'],
    ['Mamadou', 'Keita'], ['Fatoumata', 'Touré'],  ['Ibrahima', 'Konaté'],
    ['Aissatou', 'Baldé'],
  ]

  for (let i = 0; i < studentNames.length; i++) {
    const [firstName, lastName] = studentNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.gn`
    const existing = await prisma.user.findFirst({ where: { tenantId: tenant.id, email } })
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          tenantId:     tenant.id,
          email,
          passwordHash: await bcrypt.hash('Student@123', 12),
          firstName,
          lastName,
          role:         'STUDENT',
        },
      })
      const student = await prisma.student.create({
        data: {
          tenantId:    tenant.id,
          userId:      user.id,
          studentCode: `STU${String(i + 1).padStart(5, '0')}`,
          gender:      i % 2 === 0 ? 'MALE' : 'FEMALE',
          parentName:  `Parent de ${firstName}`,
          parentPhone: `+224 6${String(20 + i).padStart(2, '0')} 000 ${String(i + 1).padStart(3, '0')}`,
        },
      })

      // Enroll in a class
      const cls = classes[i % classes.length]
      await prisma.enrollment.create({
        data: { tenantId: tenant.id, studentId: student.id, classId: cls.id },
      })
    }
  }
  console.log(`✅ ${studentNames.length} students seeded`)

  console.log('\n🎉 Seed complete!\n')
  console.log('─'.repeat(50))
  console.log('LOGIN CREDENTIALS')
  console.log('─'.repeat(50))
  console.log(`Super Admin:   superadmin@schoolflow.gn  / SuperAdmin@123`)
  console.log(`School Admin:  admin@excellence.gn       / Admin@123`)
  console.log(`Teacher:       isow@excellence.gn        / Teacher@123`)
  console.log(`Student:       alpha.diallo@student.gn   / Student@123`)
  console.log('─'.repeat(50))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
