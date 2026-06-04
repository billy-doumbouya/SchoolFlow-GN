import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStudentDashboardStats } from '@/services/dashboardService'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

function fmtDate(d) { return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short' }) }
function fmtGNF(v) { return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(v) }
const GRADE_COLOR = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }

export default async function StudentDashboard() {
  const token   = cookies().get('sf_token')?.value
  const payload = await verifyToken(token)
  const student = await prisma.student.findFirst({ where: { tenantId: payload.tenantId, userId: payload.sub } })

  if (!student) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Profil élève introuvable.</div>

  const { grades, enrollments, upcomingExams, payments, gradeAvg } = await getStudentDashboardStats(payload.tenantId, student.id)

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'white', fontFamily: 'Syne, sans-serif' }}>Mon espace</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '300' }}>Bienvenue, {payload.name} 🎓</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard title="Classes" value={enrollments.length} color="blue" icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13"/></svg>} />
        <StatCard title="Moyenne" value={`${gradeAvg}%`} color="green" icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5"/></svg>} />
        <StatCard title="Examens" value={upcomingExams.length} color="amber" icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12"/></svg>} />
        <StatCard title="Notes" value={grades.length} color="purple" icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674"/></svg>} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Upcoming exams */}
        <Card>
          <CardHeader><CardTitle>📅 Examens à venir</CardTitle></CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? <p style={{ margin: 0, fontSize: '13px', color: '#475569', textAlign: 'center', padding: '16px 0' }}>Aucun examen prévu 🎉</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingExams.map((e) => {
                  const days = Math.ceil((new Date(e.examDate) - new Date()) / 86400000)
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div><p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>{e.title}</p><p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{e.subject?.name} · {fmtDate(e.examDate)}</p></div>
                      <Badge variant={days <= 3 ? 'danger' : days <= 7 ? 'warning' : 'info'}>{days === 0 ? "Auj." : `${days}j`}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Recent grades */}
        <Card>
          <CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>📊 Mes dernières notes</CardTitle>
            <a href="/dashboard/student/grades" style={{ fontSize: '12px', color: '#93c5fd', textDecoration: 'none', fontWeight: '600' }}>Tout voir</a>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            {grades.length === 0 ? <p style={{ margin: 0, fontSize: '13px', color: '#475569', textAlign: 'center', padding: '24px' }}>Aucune note</p> : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {grades.map((g) => {
                  const pct = ((g.marks / g.exam.totalMarks) * 100).toFixed(0)
                  return (
                    <li key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div><p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>{g.subject?.name}</p><p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{g.exam?.title}</p></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>{pct}%</span>
                        <Badge variant={GRADE_COLOR[g.grade] || 'default'}>{g.grade || '—'}</Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
