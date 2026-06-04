import * as yup from 'yup'

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = yup.object({
  email:      yup.string().email('Invalid email').required('Email is required'),
  password:   yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  tenantSlug: yup.string().optional(),
})

export const registerSchoolSchema = yup.object({
  schoolName:      yup.string().min(3, 'School name must be at least 3 characters').required('School name is required'),
  schoolEmail:     yup.string().email('Invalid school email').required('School email is required'),
  adminFirstName:  yup.string().required('First name is required'),
  adminLastName:   yup.string().required('Last name is required'),
  adminEmail:      yup.string().email('Invalid email').required('Admin email is required'),
  adminPassword:   yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('adminPassword')], 'Passwords must match')
    .required('Please confirm your password'),
})

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword:     yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
})

// ─── Student Schemas ──────────────────────────────────────────────────────────

export const createStudentSchema = yup.object({
  firstName:   yup.string().required('First name is required'),
  lastName:    yup.string().required('Last name is required'),
  email:       yup.string().email('Invalid email').required('Email is required'),
  password:    yup.string().min(6, 'Password must be at least 6 characters').optional(),
  dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').nullable().optional(),
  gender:      yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  address:     yup.string().optional(),
  parentName:  yup.string().optional(),
  parentPhone: yup.string().optional(),
  parentEmail: yup.string().email('Invalid parent email').nullable().optional(),
  phone: yup.string().optional(),
})

export const updateStudentSchema = yup.object({
  firstName:   yup.string().optional(),
  lastName:    yup.string().optional(),
  email:       yup.string().email('Invalid email').optional(),
  dateOfBirth: yup.date().nullable().optional(),
  gender:      yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  address:     yup.string().optional(),
  parentName:  yup.string().optional(),
  parentPhone: yup.string().optional(),
  parentEmail: yup.string().email().nullable().optional(),
  isActive:    yup.boolean().optional(),
})

// ─── Teacher Schemas ──────────────────────────────────────────────────────────

export const createTeacherSchema = yup.object({
  firstName:      yup.string().required('First name is required'),
  lastName:       yup.string().required('Last name is required'),
  email:          yup.string().email('Invalid email').required('Email is required'),
  password:       yup.string().min(6).optional(),
  qualification:  yup.string().optional(),
  specialization: yup.string().optional(),
  phone: yup.string().optional(),
})

export const updateTeacherSchema = yup.object({
  firstName:      yup.string().optional(),
  lastName:       yup.string().optional(),
  email:          yup.string().email().optional(),
  qualification:  yup.string().optional(),
  specialization: yup.string().optional(),
  isActive:       yup.boolean().optional(),
})

// ─── Class Schemas ────────────────────────────────────────────────────────────

export const createClassSchema = yup.object({
  name:         yup.string().required('Class name is required'),
  level:        yup.string().required('Level is required'),
  section:      yup.string().nullable().optional(),
  academicYear: yup.string().required('Academic year is required'),
  teacherId:    yup.string().nullable().optional(),
  capacity:     yup.number().min(1).max(500).default(30),
})

// ─── Subject Schemas ──────────────────────────────────────────────────────────

export const createSubjectSchema = yup.object({
  name:        yup.string().required('Subject name is required'),
  code:        yup.string().required('Subject code is required').uppercase(),
  description: yup.string().optional(),
  credits:     yup.number().min(1).max(10).default(1),
})

// ─── Exam Schemas ─────────────────────────────────────────────────────────────

export const createExamSchema = yup.object({
  title:        yup.string().required('Exam title is required'),
  classId:      yup.string().required('Class is required'),
  subjectId:    yup.string().required('Subject is required'),
  examType:     yup.string().oneOf(['TEST', 'MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT']).required(),
  totalMarks:   yup.number().min(1).required('Total marks required'),
  passingMarks: yup.number().min(0).required('Passing marks required')
    .test('less-than-total', 'Passing marks must be less than total marks', function(val) {
      return val < this.parent.totalMarks
    }),
  examDate:     yup.date().required('Exam date is required'),
  academicYear: yup.string().required('Academic year is required'),
})

// ─── Payment Schemas ──────────────────────────────────────────────────────────

export const createPaymentSchema = yup.object({
  amount:      yup.number().min(1000, 'Minimum amount is 1,000 GNF').required('Amount is required'),
  currency:    yup.string().default('GNF'),
  studentId:   yup.string().nullable().optional(),
  description: yup.string().required('Description is required'),
  paymentType: yup.string().oneOf(['SCHOOL_FEE', 'SUBSCRIPTION', 'EXAM_FEE', 'OTHER']).default('SCHOOL_FEE'),
})

// ─── Grade Submission Schema ──────────────────────────────────────────────────

export const gradeEntrySchema = yup.object({
  studentId: yup.string().required(),
  marks:     yup.number().min(0).required('Marks are required'),
  remarks:   yup.string().optional(),
})

export const submitGradesSchema = yup.object({
  examId: yup.string().required(),
  grades: yup.array().of(gradeEntrySchema).min(1, 'At least one grade is required'),
})
