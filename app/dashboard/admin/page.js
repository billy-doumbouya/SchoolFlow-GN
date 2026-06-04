import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getAdminDashboardStats } from '@/services/dashboardService'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from '@/components/ui'
import { AdminRevenueChart } from '@/components/dashboard/AdminRevenueChart'

function formatGNF(amount) {
  return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const paymentStatusBadge = {
  SUCCESS:  'success',
  PENDING:  'warning',
  FAILED:   'danger',
  REFUNDED: 'info',
}

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const token = cookieStore.get('sf_token')?.value
  const payload = await verifyToken(token)

  const stats = await getAdminDashboardStats(payload.tenantId)
  const { kpis, recentPayments, recentStudents, subscription, gradeDistribution, paymentTrend } = stats

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-0.5">Welcome back! Here's what's happening at your school.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={kpis.totalStudents.toLocaleString()}
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
        />
        <StatCard
          title="Total Teachers"
          value={kpis.totalTeachers.toLocaleString()}
          color="green"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>}
        />
        <StatCard
          title="Active Classes"
          value={kpis.totalClasses.toLocaleString()}
          color="purple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatGNF(kpis.monthlyRevenue)}
          trend={`${kpis.monthlyPaymentCount} payments this month`}
          color="amber"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
      </div>

      {/* Subscription Alert */}
      {subscription && (
        <div className={`mb-6 rounded-xl border px-5 py-4 flex items-center justify-between ${
          subscription.plan === 'FREE' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
        }`}>
          <div>
            <p className={`font-semibold text-sm ${subscription.plan === 'FREE' ? 'text-amber-800' : 'text-green-800'}`}>
              {subscription.plan === 'FREE' ? '🎁 Free Plan' : `✅ ${subscription.plan} Plan`}
            </p>
            <p className={`text-xs mt-0.5 ${subscription.plan === 'FREE' ? 'text-amber-700' : 'text-green-700'}`}>
              {subscription.plan === 'FREE'
                ? `Limited to ${subscription.maxStudents} students & ${subscription.maxTeachers} teachers`
                : `Up to ${subscription.maxStudents} students · Expires ${formatDate(subscription.endDate)}`}
            </p>
          </div>
          {subscription.plan === 'FREE' && (
            <a href="/dashboard/admin/billing" className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
              Upgrade →
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminRevenueChart data={paymentTrend} />
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No grades yet</p>
            ) : (
              <div className="space-y-3">
                {gradeDistribution.map((g) => {
                  const colors = { 'A+': 'bg-emerald-500', A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500' }
                  const total = gradeDistribution.reduce((s, x) => s + x._count.grade, 0)
                  const pct   = ((g._count.grade / total) * 100).toFixed(0)
                  return (
                    <div key={g.grade} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-700 w-6">{g.grade}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[g.grade] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">{g._count.grade}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <a href="/dashboard/admin/payments" className="text-xs text-brand-600 hover:underline font-medium">View all</a>
          </CardHeader>
          <CardContent className="pt-0 px-0 pb-0">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No payments yet</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {recentPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {p.student ? `${p.student.user.firstName} ${p.student.user.lastName}` : p.description || 'Subscription'}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatGNF(p.amount)}</p>
                      <Badge variant={paymentStatusBadge[p.status] || 'default'} className="mt-0.5">
                        {p.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Students</CardTitle>
            <a href="/dashboard/admin/students" className="text-xs text-brand-600 hover:underline font-medium">View all</a>
          </CardHeader>
          <CardContent className="pt-0 px-0 pb-0">
            {recentStudents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No students yet</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {recentStudents.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-6 py-3">
                    <Avatar name={`${s.user.firstName} ${s.user.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.user.firstName} {s.user.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{s.user.email}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(s.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
