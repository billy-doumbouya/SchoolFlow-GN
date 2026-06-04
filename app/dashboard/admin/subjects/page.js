'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createSubjectSchema } from '@/schemas'
import { useFetch, useApi, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, Badge, Modal, Input, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader, ConfirmModal } from '@/components/ui'

export default function SubjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { page, setPage, queryString } = usePagination()
  const { data, loading, refetch } = useFetch(`/subjects?${queryString}`, [page])
  const { post, put, del, loading: saving } = useApi()
  const subjects = data?.data ?? []; const pagination = data?.pagination ?? null

  async function handleSave(d) {
    try {
      if (editing) { await put(`/subjects/${editing.id}`, d); toast.success('Matière mise à jour') }
      else { await post('/subjects', d); toast.success('Matière créée') }
      setShowForm(false); setEditing(null); refetch()
    } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(id) {
    try { await del(`/subjects/${id}`); toast.success('Matière désactivée'); setDeleting(null); refetch() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Matières" subtitle={`${pagination?.total ?? 0} matières`}
        action={<Button onClick={() => { setEditing(null); setShowForm(true) }}><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nouvelle matière</Button>} />
      <Card>
        {loading ? <LoadingPage /> : subjects.length === 0 ? (
          <EmptyState icon="📖" title="Aucune matière" description="Ajoutez vos matières enseignées" action={<Button onClick={() => setShowForm(true)}>Ajouter</Button>} />
        ) : (
          <>
            <Table>
              <TableHead><Th>Matière</Th><Th>Code</Th><Th>Crédits</Th><Th>Enseignants</Th><Th></Th></TableHead>
              <TableBody>
                {subjects.map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'rgba(124,58,237,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontWeight: '800', fontSize: '10px', fontFamily: 'Syne, sans-serif' }}>{s.code.slice(0,2)}</div>
                        <div><p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{s.name}</p>{s.description && <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{s.description.slice(0,40)}...</p>}</div>
                      </div>
                    </Td>
                    <Td><Badge variant="brand">{s.code}</Badge></Td>
                    <Td><span style={{ fontSize: '13px', color: '#94a3b8' }}>{s.credits} crédit{s.credits > 1 ? 's' : ''}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {s.subjectTeachers?.slice(0,2).map((st) => (
                          <span key={st.teacher.id} style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                            {st.teacher.user.firstName} {st.teacher.user.lastName}
                          </span>
                        ))}
                        {(!s.subjectTeachers?.length) && <span style={{ fontSize: '12px', color: '#334155' }}>—</span>}
                      </div>
                    </Td>
                    <Td><div style={{ display: 'flex', gap: '6px' }}><button onClick={() => { setEditing(s); setShowForm(true) }} style={{ fontSize: '12px', color: '#93c5fd', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' }}>Modifier</button><button onClick={() => setDeleting(s)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Retirer</button></div></Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
      {showForm && (
        <Modal open title={editing ? 'Modifier la matière' : 'Nouvelle matière'} onClose={() => { setShowForm(false); setEditing(null) }}>
          <SubjectForm subject={editing} saving={saving} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
        </Modal>
      )}
      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => handleDelete(deleting?.id)} loading={saving} title="Désactiver cette matière ?" message={`"${deleting?.name}" sera désactivée.`} confirmLabel="Désactiver" />
    </div>
  )
}

function SubjectForm({ subject, saving, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createSubjectSchema),
    defaultValues: subject || { credits: 1 },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Input label="Nom" required error={errors.name?.message} {...register('name')} placeholder="Mathématiques" />
        <Input label="Code" required error={errors.code?.message} {...register('code')} placeholder="MATH" />
      </div>
      <Input label="Description" error={errors.description?.message} {...register('description')} placeholder="Programme de mathématiques" />
      <Input label="Crédits" type="number" min="1" max="10" error={errors.credits?.message} {...register('credits')} />
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
        <Button type="submit" loading={saving} style={{ flex: 1 }}>{subject ? 'Enregistrer' : 'Créer'}</Button>
      </div>
    </form>
  )
}
