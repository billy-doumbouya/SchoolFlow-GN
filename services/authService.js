import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, signToken, buildTokenPayload } from '@/lib/auth'
import { AppError, AuthError } from '@/lib/api'

// ─── Register School (Tenant creation) ────────────────────────────────────────

export async function registerSchool({ schoolName, schoolEmail, adminEmail, adminPassword, adminFirstName, adminLastName }) {
  // Check if email already exists globally
  const existingUser = await prisma.user.findFirst({
    where: { email: adminEmail },
  })
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409)
  }

  // Generate unique slug from school name
  let slug = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-')
  const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
  if (existingTenant) {
    slug = `${slug}-${Date.now()}`
  }

  // Transaction: create tenant + admin user + free subscription
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name:  schoolName,
        slug,
        email: schoolEmail || adminEmail,
      },
    })

    const passwordHash = await hashPassword(adminPassword)
    const user = await tx.user.create({
      data: {
        tenantId:     tenant.id,
        email:        adminEmail,
        passwordHash,
        firstName:    adminFirstName,
        lastName:     adminLastName,
        role:         'SCHOOL_ADMIN',
      },
    })

    // Create free subscription
    await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        plan:     'FREE',
        status:   'ACTIVE',
        endDate:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return { tenant, user }
  })

  const token = await signToken(buildTokenPayload(result.user))
  return {
    token,
    user:   sanitizeUser(result.user),
    tenant: result.tenant,
  }
}

// ─── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser({ email, password, tenantSlug }) {
  // Find user - scope by tenant if slug provided
  let whereClause = { email }
  if (tenantSlug) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) throw new AuthError('School not found')
    whereClause = { tenantId: tenant.id, email }
  }

  const user = await prisma.user.findFirst({
    where: whereClause,
    include: { tenant: true },
  })

  if (!user) throw new AuthError('Invalid email or password')
  if (!user.isActive) throw new AuthError('Account is deactivated')
  if (!user.tenant.isActive) throw new AuthError('School account is suspended')

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw new AuthError('Invalid email or password')

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data:  { lastLoginAt: new Date() },
  })

  const token = await signToken(buildTokenPayload(user))
  return {
    token,
    user:   sanitizeUser(user),
    tenant: user.tenant,
  }
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(userId, tenantId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    include: {
      tenant: { select: { id: true, name: true, slug: true, logoUrl: true } },
      student: { select: { id: true, studentCode: true } },
      teacher: { select: { id: true, teacherCode: true } },
    },
  })
  if (!user) throw new AuthError('User not found')
  return sanitizeUser(user)
}

// ─── Change password ──────────────────────────────────────────────────────────

export async function changePassword(userId, tenantId, { currentPassword, newPassword }) {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } })
  if (!user) throw new AuthError('User not found')

  const valid = await comparePassword(currentPassword, user.passwordHash)
  if (!valid) throw new AppError('Current password is incorrect', 400)

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  return { message: 'Password changed successfully' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}
