'use client'
import { Sidebar } from '@/components/layout/Sidebar'

const BG = '#0f1623'

export function DashboardLayout({ user, tenant, children }) {
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex' }}>
      <Sidebar user={user} tenant={tenant} />
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', background: BG }}>
        {children}
      </main>
    </div>
  )
}
