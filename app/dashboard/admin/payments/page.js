'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createPaymentSchema } from '@/schemas'
import { useFetch, useApi, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, Badge, Modal, Input, Select, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader, StatCard, FilterTabs } from '@/components/ui'

const STATUS_BADGE = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'info', CANCELLED: 'default' }
function fmtGNF(v) { return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(v) }
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const { page, setPage, queryString } = usePagination()
  const url = `/payments?${queryString}${filter ? `&status=${filter}` : ''}`
  const { data, loading, refetch } = useFetch(url, [page, filter])
  const { data: studentsData } = useFetch('/students?limit=200')
  const { post, loading: saving } = useApi()
  const payments = data?.data ?? []; const pagination = data?.pagination ?? null; const students = studentsData?.data ?? []
  const total   = payments.reduce((s, p) => s + (p.status === 'SUCCESS' ? p.amount : 0), 0)
  const pending = payments.filter((p) => p.status === 'PENDING').length
  const failed  = payments.filter((p) => p.status === 'FAILED').length

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Paiements" subtitle="Frais de scolarité via GuinePay"
        action={<Button onClick={() => setShowForm(true)}><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nouveau paiement</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Collecté" value={fmtGNF(total)} color="green"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <StatCard title="En attente" value={pending} color="amber"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <StatCard title="Échoués" value={failed} color="purple"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FilterTabs
          value={filter}
          onChange={(v) => { setFilter(v); setPage(1) }}
          options={[{ value: '', label: 'Tous' }, { value: 'PENDING', label: 'En attente' }, { value: 'SUCCESS', label: 'Réussis' }, { value: 'FAILED', label: 'Échoués' }]}
        />
      </div>

      <Card>
        {loading ? <LoadingPage /> : payments.length === 0 ? (
          <EmptyState icon="💳" title="Aucun paiement" description="Les paiements apparaîtront ici" />
        ) : (
          <>
            <Table>
              <TableHead><Th>Élève</Th><Th>Description</Th><Th>Montant</Th><Th>Type</Th><Th>Statut</Th><Th>Date</Th><Th>Réf. GuinePay</Th></TableHead>
              <TableBody>
                {payments.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.student ? <div><p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{p.student.user.firstName} {p.student.user.lastName}</p></div> : <span style={{ fontSize: '12px', color: '#475569' }}>École</span>}</Td>
                    <Td><span style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '180px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</span></Td>
                    <Td><span style={{ fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif', fontSize: '13px' }}>{fmtGNF(p.amount)}</span></Td>
                    <Td><Badge variant="brand">{p.paymentType.replace('_', ' ')}</Badge></Td>
                    <Td><Badge variant={STATUS_BADGE[p.status] || 'default'}>{p.status}</Badge></Td>
                    <Td><span style={{ fontSize: '12px', color: '#64748b' }}>{fmtDate(p.createdAt)}</span></Td>
                    <Td>{p.guinePayRef ? <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '5px' }}>{p.guinePayRef.slice(0,14)}…</span> : <span style={{ color: '#334155', fontSize: '12px' }}>—</span>}</Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showForm && (
        <Modal open title="Créer une demande de paiement" onClose={() => setShowForm(false)}>
          <PaymentForm students={students} saving={saving} onClose={() => setShowForm(false)}
            onSave={async (d) => {
              try {
                const result = await post('/payments', d)
                toast.success('Lien de paiement créé')
                if (result?.redirectUrl) setTimeout(() => window.open(result.redirectUrl, '_blank'), 500)
                setShowForm(false); refetch()
              } catch (e) { toast.error(e.message) }
            }} />
        </Modal>
      )}
    </div>
  )
}

function PaymentForm({ students, saving, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(createPaymentSchema), defaultValues: { currency: 'GNF', paymentType: 'SCHOOL_FEE' } })
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Select label="Élève (optionnel)" {...register('studentId')}><option value="">Paiement école général</option>{students.map((s) => <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName} — {s.studentCode}</option>)}</Select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Input label="Montant (GNF)" required type="number" error={errors.amount?.message} {...register('amount')} placeholder="500000" />
        <Select label="Type" required error={errors.paymentType?.message} {...register('paymentType')}><option value="SCHOOL_FEE">Frais de scolarité</option><option value="EXAM_FEE">Frais d'examen</option><option value="SUBSCRIPTION">Abonnement</option><option value="OTHER">Autre</option></Select>
      </div>
      <Input label="Description" required error={errors.description?.message} {...register('description')} placeholder="Frais de scolarité — Trimestre 1 2024" />
      <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', padding: '12px 14px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#60a5fa' }}>💳 Un lien de paiement <strong>GuinePay</strong> sera généré. Le parent paie via Orange Money ou MTN MoMo.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
        <Button type="submit" loading={saving} style={{ flex: 1 }}>Créer le lien de paiement</Button>
      </div>
    </form>
  )
}
