# 🏫 SchoolFlow — Multi-Tenant School Management System

A production-ready SaaS school management platform for Guinea built with Next.js 14, Prisma, PostgreSQL, and GuinePay payment integration.

---

## ✨ Features

### 🏢 Multi-Tenancy
- Every school is an isolated **Tenant**
- All database queries are scoped by `tenantId`
- Middleware enforces tenant isolation on every API route
- No cross-tenant data leakage possible

### 🔐 Authentication & RBAC
| Role | Access |
|------|--------|
| `SUPER_ADMIN` | Full platform access |
| `SCHOOL_ADMIN` | Full school access |
| `TEACHER` | Classes, exams, grades |
| `STUDENT` | Own grades, schedule, payments |
| `PARENT` | Child's grades and payments |

### 📚 Core Modules
- **Students** — CRUD, enrollment, parent info
- **Teachers** — CRUD, subject assignments
- **Classes** — CRUD, capacity tracking, teacher assignment
- **Subjects** — CRUD, teacher-subject mapping
- **Exams** — Schedule, types (TEST/MIDTERM/FINAL/QUIZ/ASSIGNMENT)
- **Grades** — Bulk entry, auto grade letter (A+/A/B/C/D/F), pass/fail
- **Payments** — GuinePay integration with webhook handling
- **Billing** — Subscription plans (FREE/BASIC/PRO/ENTERPRISE)
- **Dashboards** — Role-specific KPIs, charts, recent activity

### 💳 GuinePay Integration
- Payment intent creation
- Redirect-based checkout flow
- Secure webhook handling with HMAC-SHA256 signature verification
- Idempotency keys to prevent duplicate processing
- Payment status tracking (PENDING → SUCCESS/FAILED/REFUNDED)

---

## 🗂 Project Structure

```
schoolflow/
├── app/
│   ├── api/
│   │   ├── auth/           # login, register, logout, me
│   │   ├── students/       # CRUD + [id]
│   │   ├── teachers/       # CRUD + [id]
│   │   ├── classes/        # CRUD + [id]
│   │   ├── subjects/       # CRUD + [id]
│   │   ├── exams/          # CRUD + [id]
│   │   ├── grades/         # list + bulk submit
│   │   ├── payments/       # create intent + list + subscription
│   │   ├── dashboard/      # stats per role
│   │   └── webhooks/
│   │       └── guinepay/   # webhook handler
│   ├── dashboard/
│   │   ├── admin/          # admin pages (overview, students, teachers...)
│   │   ├── teacher/        # teacher pages
│   │   └── student/        # student pages
│   ├── login/
│   ├── register/
│   ├── layout.js
│   ├── globals.css
│   └── not-found.js
├── components/
│   ├── ui/                 # Button, Card, Table, Modal, Badge, Input...
│   ├── layout/             # Sidebar, DashboardLayout
│   └── dashboard/          # AdminRevenueChart
├── hooks/                  # useAuth, useFetch, useApi, usePagination...
├── lib/
│   ├── prisma.js           # Prisma client singleton
│   ├── auth.js             # JWT sign/verify, bcrypt
│   ├── permissions.js      # RBAC permission map
│   └── api.js              # Response helpers, error classes, pagination
├── schemas/                # Yup validation schemas
├── services/               # Business logic (no logic in route handlers)
│   ├── authService.js
│   ├── studentService.js
│   ├── teacherService.js
│   ├── classService.js
│   ├── gradeService.js
│   ├── paymentService.js
│   └── dashboardService.js
├── prisma/
│   ├── schema.prisma       # Full database schema
│   └── seed.js             # Demo data seeder
├── middleware.js            # Auth + RBAC + tenant isolation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo>
cd schoolflow
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/schoolflow"
JWT_SECRET="your-long-random-secret-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Real GuinePay credentials
GUINEPAY_BASE_URL="https://api.guinepay.com/v1"
GUINEPAY_API_KEY="your-api-key"
GUINEPAY_SECRET="your-webhook-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@schoolflow.gn` | `SuperAdmin@123` |
| School Admin | `admin@excellence.gn` | `Admin@123` |
| Teacher | `isow@excellence.gn` | `Teacher@123` |
| Student | `alpha.diallo@student.gn` | `Student@123` |

---

## 🗄 Database Schema

### Key Models

```prisma
Tenant          # School (the tenant)
User            # All users (all roles)
Student         # Student profile + parent info
Teacher         # Teacher profile + qualifications
Class           # Class room
Enrollment      # Student ↔ Class
Subject         # Course / subject
SubjectTeacher  # Teacher ↔ Subject
Exam            # Scheduled exam
Grade           # Student exam result
Subscription    # School plan (FREE/BASIC/PRO/ENTERPRISE)
Payment         # GuinePay transaction
```

Every table has a `tenantId` column with an index. All queries in services are scoped: `where: { tenantId, ... }`.

---

## 🔒 Security

### JWT Auth
- Tokens signed with HMAC-SHA256 via `jose`
- Stored in `HttpOnly` secure cookies (not localStorage)
- 7-day expiry

### Middleware Pipeline
Every request through `/dashboard/**` and `/api/**` goes through:
1. **Auth check** — Verify JWT cookie
2. **Tenant injection** — Set `x-tenant-id` header from token
3. **RBAC check** — Match role against allowed roles per route prefix

### API Layer
Every API route handler:
1. Reads `x-tenant-id` from headers (set by middleware)
2. Passes `tenantId` to service functions
3. Service functions always scope queries: `{ where: { tenantId } }`

### Webhook Security
GuinePay webhooks verified via HMAC-SHA256:
```
signature = HMAC-SHA256(secret, timestamp + body)
```
Idempotency keys prevent double-processing of the same payment event.

---

## 💳 GuinePay Integration

### Flow
```
1. Admin creates payment → POST /api/payments
2. Server creates payment record (PENDING) + calls GuinePay API
3. GuinePay returns payment_url
4. User redirected to GuinePay checkout
5. User pays on GuinePay (Mobile Money or card)
6. GuinePay sends webhook → POST /api/webhooks/guinepay
7. Server verifies signature + updates payment status
8. If subscription payment → activates subscription
```

### Mock Mode
If `GUINEPAY_API_KEY` is empty, the system runs in **mock mode**:
- Payment intents are created locally
- Redirect URL points to a mock checkout page
- Webhooks can be manually triggered for testing

### Trigger a test webhook (curl)
```bash
curl -X POST http://localhost:3000/api/webhooks/guinepay \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "data": {
      "intent_id": "gp_intent_YOUR_ID",
      "reference": "GP-REF-001",
      "amount": 500000
    }
  }'
```

---

## 📊 Subscription Plans

| Plan | Price/year | Students | Teachers |
|------|-----------|----------|----------|
| Free | 0 GNF | 50 | 5 |
| Basic | 500,000 GNF | 200 | 20 |
| Pro | 1,500,000 GNF | 1,000 | 100 |
| Enterprise | 5,000,000 GNF | Unlimited | Unlimited |

---

## 🛠 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema without migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio GUI
```

---

## 🚢 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Checklist for Production
- [ ] `DATABASE_URL` pointing to production PostgreSQL
- [ ] `JWT_SECRET` — random 64-char string
- [ ] `NEXT_PUBLIC_APP_URL` — your domain (e.g. `https://app.schoolflow.gn`)
- [ ] `GUINEPAY_API_KEY` — real key from GuinePay dashboard
- [ ] `GUINEPAY_SECRET` — webhook signing secret
- [ ] Run `npm run db:migrate` against production DB
- [ ] `NODE_ENV=production`

---

## 🧩 Extending the System

### Add a new role
1. Add to `Role` enum in `prisma/schema.prisma`
2. Add permissions in `lib/permissions.js`
3. Add nav items in `components/layout/Sidebar.js`
4. Add RBAC check in `middleware.js`

### Add a new module
1. Create service in `/services/yourService.js`
2. Add Yup schema in `/schemas/index.js`
3. Create API routes in `/app/api/your-module/`
4. Create page in `/app/dashboard/admin/your-module/page.js`
5. Add link to sidebar nav

### Add a new payment type
1. Add to `PaymentType` enum in `prisma/schema.prisma`
2. Update `createPaymentSchema` in `/schemas/index.js`
3. Handle in `paymentService.js` if needed

---

## 📝 License

MIT © SchoolFlow 2024
#   S c h o o l F l o w - G N  
 