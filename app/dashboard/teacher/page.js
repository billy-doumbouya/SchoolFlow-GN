import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTeacherDashboardStats } from '@/services/dashboardService'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from '@/components/ui'

export default async function TeacherDashboard() {
  const token   = cookies().get('sf_token')?.value
  const payload = await verifyToken(token)
  const teacher = await prisma.teacher.findFirst({ where: { tenantId: payload.tenantId, userId: payload.sub } })

  if (!teacher) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Profil enseignant introuvable. Contactez votre administrateur.</div>

  const { myClasses, totalStudents, pendingExams, recentGrades } = await getTeacherDashboardStats(payload.tenantId, teacher.id)

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'white', fontFamily: 'Syne, sans-serif' }}>Tableau de bord</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '300' }}>Bienvenue, {payload.name} 👋</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Mes Classes" value={myClasses.length} color="blue" icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>} />
        <StatCard title="Mes Élèves" value={totalStudents} color="green" icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/></svg>} />
        <StatCard title="Examens à venir" value={pendingExams} color="amber" icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card>
          <CardHeader><CardTitle>Mes classes</CardTitle></CardHeader>
          <CardContent>
            {myClasses.length === 0 ? <p style={{ margin: 0, fontSize: '13px', color: '#475569', textAlign: 'center', padding: '20px 0' }}>Aucune classe assignée</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myClasses.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', background: 'rgba(43,80,245,0.15)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: '800', fontSize: '10px', fontFamily: 'Syne, sans-serif' }}>{c.name.slice(0,2).toUpperCase()}</div>
                      <div><p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>{c.name}</p><p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{c.level} · {c.academicYear}</p></div>
                    </div>
                    <Badge variant="info">{c._count?.enrollments || 0} élèves</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Dernières notes</CardTitle>
            <a href="/dashboard/teacher/grades" style={{ fontSize: '12px', color: '#93c5fd', textDecoration: 'none', fontWeight: '600' }}>Voir tout</a>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            {recentGrades.length === 0 ? <p style={{ margin: 0, fontSize: '13px', color: '#475569', textAlign: 'center', padding: '24px' }}>Aucune note</p> : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {recentGrades.map((g) => (
                  <li key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={`${g.student?.user?.firstName} ${g.student?.user?.lastName}`} size="xs" />
                      <div><p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>{g.student?.user?.firstName} {g.student?.user?.lastName}</p><p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{g.subject?.name} · {g.exam?.title}</p></div>
                    </div>
                    <Badge variant={{ 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }[g.grade] || 'default'}>{g.grade || g.marks}</Badge>
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
