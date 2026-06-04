'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createTeacherSchema } from '@/schemas'
import { useFetch, useApi, useDebounce, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, Badge, Avatar, Modal, Input, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader, SearchInput, ConfirmModal } from '@/components/ui'

export default function TeachersPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const debouncedSearch = useDebounce(search, 300)
  const { page, setPage, queryString } = usePagination()
  const url = `/teachers?${queryString}${debouncedSearch ? `&search=${debouncedSearch}` : ''}`
  const { data, loading, refetch } = useFetch(url, [page, debouncedSearch])
  const { post, put, del, loading: saving } = useApi()
  const teachers = data?.data ?? []; const pagination = data?.pagination ?? null

  async function handleSave(data) {
    try {
      if (editing) { await put(`/teachers/${editing.id}`, data); toast.success('Enseignant mis à jour') }
      else { await post('/teachers', data); toast.success('Enseignant créé — identifiants envoyés par WhatsApp') }
      setShowForm(false); setEditing(null); refetch()
    } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(id) {
    try { await del(`/teachers/${id}`); toast.success('Enseignant désactivé'); setDeleting(null); refetch() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Enseignants" subtitle={`${pagination?.total ?? 0} enseignants`}
        action={<Button onClick={() => { setEditing(null); setShowForm(true) }}><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nouvel enseignant</Button>} />
      <div style={{ marginBottom: '16px' }}><SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Rechercher..." /></div>
      <Card>
        {loading ? <LoadingPage /> : teachers.length === 0 ? (
          <EmptyState icon="👨‍🏫" title="Aucun enseignant" description={search ? 'Essayez un autre terme' : 'Ajoutez votre premier enseignant'} action={!search && <Button onClick={() => setShowForm(true)}>Ajouter</Button>} />
        ) : (
          <>
            <Table>
              <TableHead><Th>Enseignant</Th><Th>Code</Th><Th>Spécialité</Th><Th>Classes</Th><Th>Matières</Th><Th>Statut</Th><Th></Th></TableHead>
              <TableBody>
                {teachers.map((t) => (
                  <Tr key={t.id}>
                    <Td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Avatar name={`${t.user.firstName} ${t.user.lastName}`} size="sm" /><div><p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{t.user.firstName} {t.user.lastName}</p><p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{t.user.email}</p></div></div></Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '6px' }}>{t.teacherCode}</span></Td>
                    <Td><span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.specialization || '—'}</span></Td>
                    <Td><Badge variant="info">{t.classes?.length || 0}</Badge></Td>
                    <Td><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{t.subjectTeachers?.slice(0,2).map((st) => <Badge key={st.subject.id} variant="brand">{st.subject.code}</Badge>)}{t.subjectTeachers?.length > 2 && <Badge>+{t.subjectTeachers.length-2}</Badge>}</div></Td>
                    <Td><Badge variant={t.isActive ? 'success' : 'danger'}>{t.isActive ? 'Actif' : 'Inactif'}</Badge></Td>
                    <Td><div style={{ display: 'flex', gap: '6px' }}><button onClick={() => { setEditing(t); setShowForm(true) }} style={{ fontSize: '12px', color: '#93c5fd', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' }}>Modifier</button><button onClick={() => setDeleting(t)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Retirer</button></div></Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
      {showForm && <TeacherModal teacher={editing} saving={saving} onClose={() => { setShowForm(false); setEditing(null) }} onSave={handleSave} />}
      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => handleDelete(deleting?.id)} loading={saving} title="Retirer cet enseignant ?" message={`${deleting?.user?.firstName} ${deleting?.user?.lastName} sera désactivé.`} confirmLabel="Oui, retirer" />
    </div>
  )
}

function TeacherModal({ teacher, saving, onClose, onSave }) {
  const isEdit = !!teacher
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createTeacherSchema),
    defaultValues: teacher ? { firstName: teacher.user.firstName, lastName: teacher.user.lastName, email: teacher.user.email, qualification: teacher.qualification, specialization: teacher.specialization } : {},
  })
  return (
    <Modal open title={isEdit ? 'Modifier l\'enseignant' : 'Nouvel enseignant'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Input label="Prénom" required error={errors.firstName?.message} {...register('firstName')} placeholder="Ibrahima" />
          <Input label="Nom" required error={errors.lastName?.message} {...register('lastName')} placeholder="Sow" />
        </div>
        <Input label="Email" required type="email" error={errors.email?.message} {...register('email')} placeholder="i.sow@ecole.gn" />
        <Input label="Téléphone WhatsApp" error={errors.phone?.message} {...register('phone')} placeholder="+224 6XX XXX XXX" />
        {!isEdit && <Input label="Mot de passe (optionnel)" type="password" error={errors.password?.message} {...register('password')} placeholder="Généré automatiquement si vide" />}
        <Input label="Qualification" error={errors.qualification?.message} {...register('qualification')} placeholder="Masters en Mathématiques" />
        <Input label="Spécialisation" error={errors.specialization?.message} {...register('specialization')} placeholder="Mathématiques, Physique" />
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
          <Button type="submit" loading={saving} style={{ flex: 1 }}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  )
}
