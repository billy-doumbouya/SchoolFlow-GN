'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createExamSchema } from '@/schemas'
import { useFetch, useApi, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, Badge, Modal, Input, Select, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader, FilterTabs } from '@/components/ui'

const TYPE_BADGE = { TEST: 'info', MIDTERM: 'warning', FINAL: 'danger', QUIZ: 'brand', ASSIGNMENT: 'success' }
const CY = new Date().getFullYear()

function fmt(d) { return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function ExamsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { page, setPage, queryString } = usePagination()
  const { data, loading, refetch } = useFetch(`/exams?${queryString}`, [page])
  const { data: cData } = useFetch('/classes?limit=100')
  const { data: sData } = useFetch('/subjects?limit=100')
  const { post, put, loading: saving } = useApi()
  const exams = data?.data ?? []; const classes = cData?.data ?? []; const subjects = sData?.data ?? []; const pagination = data?.pagination ?? null

  async function handleSave(d) {
    try {
      if (editing) { await put(`/exams/${editing.id}`, d); toast.success('Examen mis à jour') }
      else { await post('/exams', d); toast.success('Examen planifié') }
      setShowForm(false); setEditing(null); refetch()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Examens" subtitle={`${pagination?.total ?? 0} examens`}
        action={<Button onClick={() => { setEditing(null); setShowForm(true) }}><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Planifier un examen</Button>} />
      <Card>
        {loading ? <LoadingPage /> : exams.length === 0 ? (
          <EmptyState icon="📝" title="Aucun examen planifié" description="Planifiez votre premier examen" action={<Button onClick={() => setShowForm(true)}>Planifier</Button>} />
        ) : (
          <>
            <Table>
              <TableHead><Th>Titre</Th><Th>Classe</Th><Th>Matière</Th><Th>Type</Th><Th>Date</Th><Th>Total</Th><Th>Notes</Th><Th></Th></TableHead>
              <TableBody>
                {exams.map((e) => {
                  const isPast = new Date(e.examDate) < new Date()
                  const daysLeft = Math.ceil((new Date(e.examDate) - new Date()) / 86400000)
                  return (
                    <Tr key={e.id}>
                      <Td><p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{e.title}</p></Td>
                      <Td><Badge variant="info">{e.class?.name}</Badge></Td>
                      <Td><span style={{ fontSize: '12px', color: '#94a3b8' }}>{e.subject?.name}</span></Td>
                      <Td><Badge variant={TYPE_BADGE[e.examType] || 'default'}>{e.examType}</Badge></Td>
                      <Td>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: isPast ? '#475569' : 'white', fontWeight: isPast ? '400' : '600' }}>{fmt(e.examDate)}</p>
                          {!isPast && <p style={{ margin: 0, fontSize: '11px', color: daysLeft <= 3 ? '#ef4444' : '#64748b' }}>{daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft}j`}</p>}
                        </div>
                      </Td>
                      <Td><span style={{ fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>{e.totalMarks}</span></Td>
                      <Td><Badge variant={e._count?.grades > 0 ? 'success' : 'default'}>{e._count?.grades || 0}</Badge></Td>
                      <Td><button onClick={() => { setEditing(e); setShowForm(true) }} style={{ fontSize: '12px', color: '#93c5fd', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' }}>Modifier</button></Td>
                    </Tr>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
      {showForm && (
        <Modal open title={editing ? 'Modifier l\'examen' : 'Planifier un examen'} onClose={() => { setShowForm(false); setEditing(null) }} size="lg">
          <ExamForm exam={editing} classes={classes} subjects={subjects} saving={saving} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}

function ExamForm({ exam, classes, subjects, saving, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createExamSchema),
    defaultValues: exam ? { ...exam, examDate: exam.examDate?.slice(0,10) } : { examType: 'TEST', academicYear: `${CY}-${CY+1}` },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input label="Titre de l'examen" required error={errors.title?.message} {...register('title')} placeholder="Examen de Mathématiques — Semestre 1" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Select label="Classe" required error={errors.classId?.message} {...register('classId')}><option value="">Sélectionner</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select label="Matière" required error={errors.subjectId?.message} {...register('subjectId')}><option value="">Sélectionner</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Select label="Type" required error={errors.examType?.message} {...register('examType')}>{['TEST','MIDTERM','FINAL','QUIZ','ASSIGNMENT'].map((t) => <option key={t} value={t}>{t}</option>)}</Select>
        <Input label="Année scolaire" required error={errors.academicYear?.message} {...register('academicYear')} placeholder="2024-2025" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <Input label="Total points" required type="number" error={errors.totalMarks?.message} {...register('totalMarks')} placeholder="100" />
        <Input label="Points passage" required type="number" error={errors.passingMarks?.message} {...register('passingMarks')} placeholder="50" />
        <Input label="Date" required type="date" error={errors.examDate?.message} {...register('examDate')} />
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
        <Button type="submit" loading={saving} style={{ flex: 1 }}>{exam ? 'Enregistrer' : 'Planifier'}</Button>
      </div>
    </form>
  )
}
