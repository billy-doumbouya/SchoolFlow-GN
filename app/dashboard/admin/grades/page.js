'use client'
import { useState } from 'react'
import { useFetch, useApi, usePagination } from '@/hooks'
import { toast } from 'sonner'
import { Button, Card, Badge, Modal, Select, Table, TableHead, Th, TableBody, Tr, Td, EmptyState, Pagination, LoadingPage, PageHeader } from '@/components/ui'

const GRADE_COLORS = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }

export default function GradesPage() {
  const [selectedExam, setSelectedExam] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { page, setPage, queryString } = usePagination()
  const url = `/grades?${queryString}${selectedExam ? `&examId=${selectedExam}` : ''}`
  const { data, loading, refetch } = useFetch(url, [page, selectedExam])
  const { data: examD } = useFetch('/exams?limit=100')
  const { post, loading: saving } = useApi()
  const grades = data?.data ?? []; const exams = examD?.data ?? []; const pagination = data?.pagination ?? null

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Notes" subtitle="Saisir et consulter les résultats"
        action={<Button onClick={() => setShowModal(true)} disabled={!selectedExam}>Saisir les notes</Button>} />
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <Select value={selectedExam} onChange={(e) => { setSelectedExam(e.target.value); setPage(1) }}>
          <option value="">Tous les examens</option>
          {exams.map((e) => <option key={e.id} value={e.id}>{e.title} — {e.class?.name}</option>)}
        </Select>
      </div>
      <Card>
        {loading ? <LoadingPage /> : grades.length === 0 ? (
          <EmptyState icon="📊" title="Aucune note" description={selectedExam ? 'Cliquez sur "Saisir les notes" pour commencer' : 'Sélectionnez un examen'} action={selectedExam && <Button onClick={() => setShowModal(true)}>Saisir les notes</Button>} />
        ) : (
          <>
            <Table>
              <TableHead><Th>Élève</Th><Th>Matière</Th><Th>Examen</Th><Th>Note</Th><Th>%</Th><Th>Mention</Th><Th>Résultat</Th></TableHead>
              <TableBody>
                {grades.map((g) => {
                  const pct = ((g.marks / g.exam.totalMarks) * 100).toFixed(1)
                  const passed = g.marks >= g.exam.passingMarks
                  return (
                    <Tr key={g.id}>
                      <Td><p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '13px' }}>{g.student?.user?.firstName} {g.student?.user?.lastName}</p></Td>
                      <Td><span style={{ fontSize: '12px', color: '#94a3b8' }}>{g.subject?.name}</span></Td>
                      <Td><span style={{ fontSize: '12px', color: '#64748b' }}>{g.exam?.title}</span></Td>
                      <Td><span style={{ fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>{g.marks}<span style={{ fontSize: '11px', color: '#475569', fontWeight: '400', fontFamily: 'DM Sans, sans-serif' }}>/{g.exam?.totalMarks}</span></span></Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '40px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: passed ? '#22c55e' : '#ef4444', width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{pct}%</span>
                        </div>
                      </Td>
                      <Td><Badge variant={GRADE_COLORS[g.grade] || 'default'} style={{ fontWeight: '700', fontSize: '12px' }}>{g.grade || '—'}</Badge></Td>
                      <Td><Badge variant={passed ? 'success' : 'danger'}>{passed ? 'Admis' : 'Ajourné'}</Badge></Td>
                    </Tr>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
      {showModal && selectedExam && (
        <GradeEntryModal
          examId={selectedExam}
          exam={exams.find((e) => e.id === selectedExam)}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={async (gradesData) => {
            try {
              await post('/grades', { examId: selectedExam, grades: gradesData })
              toast.success(`${gradesData.length} notes enregistrées — élèves notifiés par WhatsApp`)
              setShowModal(false); refetch()
            } catch (e) { toast.error(e.message) }
          }}
        />
      )}
    </div>
  )
}

function GradeEntryModal({ examId, exam, saving, onClose, onSave }) {
  const { data: studentsData } = useFetch(`/students?classId=${exam?.classId || ''}&limit=100`)
  const students = studentsData?.data ?? []
  const [gradeMap, setGradeMap] = useState({})
  function setGrade(sid, field, val) { setGradeMap((p) => ({ ...p, [sid]: { ...p[sid], studentId: sid, [field]: val } })) }

  return (
    <Modal open title={`Saisie des notes : ${exam?.title}`} onClose={onClose} size="xl">
      <div style={{ marginBottom: '14px', background: 'rgba(43,80,245,0.08)', border: '1px solid rgba(43,80,245,0.15)', borderRadius: '10px', padding: '10px 14px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#93c5fd' }}>Total : <strong>{exam?.totalMarks}</strong> pts · Passage : <strong>{exam?.passingMarks}</strong> pts · Classe : <strong>{exam?.class?.name}</strong></p>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#131c2e' }}>
            <tr><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Élève</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '130px' }}>Note /{exam?.totalMarks}</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Remarque</th></tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>Aucun élève dans cette classe</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 12px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>{s.user.firstName} {s.user.lastName}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{s.studentCode}</p>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <input type="number" min="0" max={exam?.totalMarks} step="0.5" value={gradeMap[s.id]?.marks ?? ''} onChange={(e) => setGrade(s.id, 'marks', e.target.value)} placeholder="0"
                    style={{ width: '100px', height: '36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 10px', color: 'white', fontSize: '14px', fontWeight: '700', outline: 'none', fontFamily: 'Syne, sans-serif' }}
                    onFocus={(e) => e.target.style.borderColor = '#2b50f5'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <input type="text" value={gradeMap[s.id]?.remarks ?? ''} onChange={(e) => setGrade(s.id, 'remarks', e.target.value)} placeholder="Optionnel"
                    style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0 10px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    onFocus={(e) => e.target.style.borderColor = '#2b50f5'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '16px' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
        <Button onClick={() => onSave(students.map((s) => ({ studentId: s.id, marks: parseFloat(gradeMap[s.id]?.marks || 0), remarks: gradeMap[s.id]?.remarks || '' })))} loading={saving} disabled={students.length === 0} style={{ flex: 1 }}>
          Enregistrer {students.length} notes
        </Button>
      </div>
    </Modal>
  )
}
