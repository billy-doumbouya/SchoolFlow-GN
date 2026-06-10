'use client'
import { useState } from 'react'
import { useFetch, useApi, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, CardContent, Badge, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader, StatCard, SearchInput, Modal, Select } from '@/components/ui'
import { PLANS, getPlanByKey, formatGNFShort, formatGNF } from '@/lib/pricing'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PLAN_BADGE = {
  FREE:       'default',
  STARTER:    'info',
  GROWTH:     'brand',
  SCHOOL:     'brand',
  ADVANCED:   'info',
  PREMIUM:    'warning',
  LARGE:      'success',
  ENTERPRISE: 'success',
}

export default function SuperAdminDashboard() {
  const [search,        setSearch]       = useState('')
  const [activating,    setActivating]   = useState(null) // tenant being activated
  const { page, setPage, queryString }   = usePagination()
  const url = `/super/schools?${queryString}${search ? `&search=${search}` : ''}`
  const { data, loading, refetch }       = useFetch(url, [page, search])
  const { put, loading: saving }         = useApi()

  const tenants    = data?.data?.tenants    ?? []
  const pagination = data?.data?.pagination ?? null
  const platform   = data?.data?.platform   ?? {}

  async function handleActivatePlan(tenantId, planKey) {
    try {
      await put(`/super/schools/${tenantId}/plan`, { planKey })
      toast.success(`Plan ${planKey} activé — école notifiée par WhatsApp`)
      setActivating(null)
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  async function handleToggleStatus(tenant) {
    try {
      const res  = await fetch(`/api/super/schools/${tenant.id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !tenant.isActive }),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success(tenant.isActive ? 'École suspendue' : 'École réactivée')
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader
        title="Super Admin"
        subtitle="Gestion globale de la plateforme SchoolFlow"
      />

      {/* Platform KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard title="Écoles actives"   value={platform.totalSchools  || 0}   color="blue"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>} />
        <StatCard title="Revenus totaux"   value={formatGNFShort(platform.totalRevenue || 0)} color="green"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1"/></svg>} />
        <StatCard title="Paiements reçus"  value={platform.totalPayments || 0}   color="purple"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>} />
        <StatCard title="En attente"
          value={tenants.filter((t) => t.subscriptions?.[0]?.plan === 'FREE').length}
          color="amber"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Rechercher une école..." />
      </div>

      {/* Schools table */}
      <Card>
        {loading ? <LoadingPage /> : tenants.length === 0 ? (
          <EmptyState icon="🏫" title="Aucune école" description={search ? 'Essayez un autre terme' : 'Aucune école inscrite'} />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>École</Th>
                <Th>Plan</Th>
                <Th>Expire</Th>
                <Th>Élèves</Th>
                <Th>Enseignants</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </TableHead>
              <TableBody>
                {tenants.map((t) => {
                  const sub     = t.subscriptions?.[0]
                  const planKey = sub?.plan || 'FREE'
                  const plan    = getPlanByKey(planKey)
                  const isExpired = sub?.endDate && new Date(sub.endDate) < new Date()
                  return (
                    <Tr key={t.id}>
                      <Td>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{t.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{t.email}</p>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant={PLAN_BADGE[planKey] || 'default'} style={{ fontWeight: '700' }}>
                          {plan.label}
                        </Badge>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '12px', color: isExpired ? '#ef4444' : '#94a3b8', fontWeight: isExpired ? '600' : '400' }}>
                          {isExpired ? '⚠️ Expiré' : fmtDate(sub?.endDate)}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>
                          {t._count?.students || 0}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          {t._count?.teachers || 0}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={t.isActive ? 'success' : 'danger'}>
                          {t.isActive ? 'Active' : 'Suspendue'}
                        </Badge>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setActivating(t)}
                            style={{ fontSize: '11px', color: '#93c5fd', background: 'rgba(43,80,245,0.1)', border: '1px solid rgba(43,80,245,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}
                          >
                            Activer plan
                          </button>
                          <button
                            onClick={() => handleToggleStatus(t)}
                            style={{ fontSize: '11px', color: t.isActive ? '#ef4444' : '#22c55e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            {t.isActive ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Activate plan modal */}
      {activating && (
        <ActivatePlanModal
          tenant={activating}
          saving={saving}
          onClose={() => setActivating(null)}
          onConfirm={(planKey) => handleActivatePlan(activating.id, planKey)}
        />
      )}
    </div>
  )
}

function ActivatePlanModal({ tenant, saving, onClose, onConfirm }) {
  const [planKey,   setPlanKey]   = useState('STARTER')
  const [duration,  setDuration]  = useState('365')

  const selectedPlan = getPlanByKey(planKey)

  return (
    <Modal open title={`Activer un plan — ${tenant.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#94a3b8' }}>École</p>
          <p style={{ margin: '0 0 1px', fontSize: '14px', fontWeight: '600', color: 'white' }}>{tenant.name}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{tenant.email}</p>
        </div>

        <Select
          label="Plan à activer"
          required
          value={planKey}
          onChange={(e) => setPlanKey(e.target.value)}
        >
          {PLANS.filter(p => p.key !== 'ENTERPRISE').map((p) => (
            <option key={p.key} value={p.key}>
              {p.label} — {formatGNFShort(p.priceGNF)} — {p.maxStudents} élèves
            </option>
          ))}
          <option value="ENTERPRISE">Enterprise — Sur devis</option>
        </Select>

        <Select
          label="Durée"
          required
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="30">30 jours (essai)</option>
          <option value="90">90 jours (3 mois)</option>
          <option value="180">180 jours (6 mois)</option>
          <option value="365">365 jours (1 an)</option>
          <option value="730">730 jours (2 ans)</option>
        </Select>

        {/* Summary */}
        <div style={{ padding: '12px 14px', background: 'rgba(43,80,245,0.08)', border: '1px solid rgba(43,80,245,0.15)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: '#93c5fd' }}>Résumé de l'activation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[
              ['Plan',          selectedPlan.label],
              ['Élèves max',    selectedPlan.maxStudents >= 999999 ? 'Illimité' : selectedPlan.maxStudents],
              ['Enseignants max', selectedPlan.maxTeachers >= 999999 ? 'Illimité' : selectedPlan.maxTeachers],
              ['Durée',         `${duration} jours`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#4ade80' }}>
            ✅ L'école recevra une notification WhatsApp de confirmation automatiquement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
          <Button
            onClick={() => onConfirm(planKey, parseInt(duration))}
            loading={saving}
            style={{ flex: 1 }}
          >
            ✅ Activer le plan
          </Button>
        </div>
      </div>
    </Modal>
  )
}
