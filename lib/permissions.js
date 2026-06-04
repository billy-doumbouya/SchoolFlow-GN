// ─────────────────────────────────────────────────────────────────────────────
// RBAC PERMISSIONS MAP
// Each role defines what it can do.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN:  'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER:      'TEACHER',
  STUDENT:      'STUDENT',
  PARENT:       'PARENT',
}

// Permissions catalogue
export const PERMISSIONS = {
  // Tenant/School
  TENANT_MANAGE:       'tenant:manage',
  TENANT_VIEW:         'tenant:view',

  // Users
  USER_CREATE:         'user:create',
  USER_READ:           'user:read',
  USER_UPDATE:         'user:update',
  USER_DELETE:         'user:delete',

  // Students
  STUDENT_CREATE:      'student:create',
  STUDENT_READ:        'student:read',
  STUDENT_UPDATE:      'student:update',
  STUDENT_DELETE:      'student:delete',

  // Teachers
  TEACHER_CREATE:      'teacher:create',
  TEACHER_READ:        'teacher:read',
  TEACHER_UPDATE:      'teacher:update',
  TEACHER_DELETE:      'teacher:delete',

  // Classes
  CLASS_CREATE:        'class:create',
  CLASS_READ:          'class:read',
  CLASS_UPDATE:        'class:update',
  CLASS_DELETE:        'class:delete',

  // Subjects
  SUBJECT_CREATE:      'subject:create',
  SUBJECT_READ:        'subject:read',
  SUBJECT_UPDATE:      'subject:update',
  SUBJECT_DELETE:      'subject:delete',

  // Exams
  EXAM_CREATE:         'exam:create',
  EXAM_READ:           'exam:read',
  EXAM_UPDATE:         'exam:update',
  EXAM_DELETE:         'exam:delete',

  // Grades
  GRADE_CREATE:        'grade:create',
  GRADE_READ:          'grade:read',
  GRADE_UPDATE:        'grade:update',
  GRADE_READ_OWN:      'grade:read_own',

  // Payments
  PAYMENT_CREATE:      'payment:create',
  PAYMENT_READ:        'payment:read',
  PAYMENT_MANAGE:      'payment:manage',
  PAYMENT_READ_OWN:    'payment:read_own',

  // Subscription
  SUBSCRIPTION_MANAGE: 'subscription:manage',
  SUBSCRIPTION_READ:   'subscription:read',

  // Reports
  REPORT_VIEW:         'report:view',
  DASHBOARD_VIEW:      'dashboard:view',
}

// Role → Permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.SCHOOL_ADMIN]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.STUDENT_CREATE,
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_UPDATE,
    PERMISSIONS.STUDENT_DELETE,
    PERMISSIONS.TEACHER_CREATE,
    PERMISSIONS.TEACHER_READ,
    PERMISSIONS.TEACHER_UPDATE,
    PERMISSIONS.TEACHER_DELETE,
    PERMISSIONS.CLASS_CREATE,
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.CLASS_UPDATE,
    PERMISSIONS.CLASS_DELETE,
    PERMISSIONS.SUBJECT_CREATE,
    PERMISSIONS.SUBJECT_READ,
    PERMISSIONS.SUBJECT_UPDATE,
    PERMISSIONS.SUBJECT_DELETE,
    PERMISSIONS.EXAM_CREATE,
    PERMISSIONS.EXAM_READ,
    PERMISSIONS.EXAM_UPDATE,
    PERMISSIONS.EXAM_DELETE,
    PERMISSIONS.GRADE_CREATE,
    PERMISSIONS.GRADE_READ,
    PERMISSIONS.GRADE_UPDATE,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_MANAGE,
    PERMISSIONS.SUBSCRIPTION_READ,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.SUBJECT_READ,
    PERMISSIONS.EXAM_CREATE,
    PERMISSIONS.EXAM_READ,
    PERMISSIONS.EXAM_UPDATE,
    PERMISSIONS.GRADE_CREATE,
    PERMISSIONS.GRADE_READ,
    PERMISSIONS.GRADE_UPDATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.GRADE_READ_OWN,
    PERMISSIONS.PAYMENT_READ_OWN,
    PERMISSIONS.DASHBOARD_VIEW,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.GRADE_READ_OWN,
    PERMISSIONS.PAYMENT_READ_OWN,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
}

// ─── Helper functions ─────────────────────────────────────────────────────────

export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || []
  return perms.includes(permission)
}

export function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role, permissions) {
  return permissions.every((p) => hasPermission(role, p))
}

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || []
}

// Route → required permission mapping for middleware
export const ROUTE_PERMISSIONS = {
  '/dashboard/admin':      PERMISSIONS.DASHBOARD_VIEW,
  '/dashboard/students':   PERMISSIONS.STUDENT_READ,
  '/dashboard/teachers':   PERMISSIONS.TEACHER_READ,
  '/dashboard/classes':    PERMISSIONS.CLASS_READ,
  '/dashboard/subjects':   PERMISSIONS.SUBJECT_READ,
  '/dashboard/exams':      PERMISSIONS.EXAM_READ,
  '/dashboard/grades':     PERMISSIONS.GRADE_READ,
  '/dashboard/payments':   PERMISSIONS.PAYMENT_READ,
  '/dashboard/billing':    PERMISSIONS.SUBSCRIPTION_READ,
}
