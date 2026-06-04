'use client'
import { useState } from 'react'
import { useFetch, useApi, usePagination } from '@/hooks'
import {
  Button, Card, Badge, Modal,
  Table, TableHead, Th, TableBody, Tr, Td,
  EmptyState, Pagination, LoadingPage, Select,
} from '@/components/ui'

const GRADE_COLOR = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }

export default function TeacherGradesPage() {
  const [selectedExam, setSelectedExam] = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [toast,        setToast]        = useState(null)

  const { page, setPage, queryString }  = usePagination()
  const gradeUrl = `/api/grades?${queryString}${selectedExam ? `&examId=${selectedExam}` : ''}`

  const { data, loading, refetch }  = useFetch(gradeUrl, [page, selectedExam])
  const { data: examD }             = useFetch('/api/exams?limit=100')
  const { post, loading: saving }   = useApi()

  const grades   = data?.data   ?? []
  const exams    = examD?.data  ?? []
  const pagination = data?.pagination ?? null

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  return (
    <div className="p-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-panel ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Grades</h1>
          <p className="text-sm text-slate-500 mt-0.5">Enter and manage student grades</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={!selectedExam}>Enter Grades</Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Select value={selectedExam} onChange={(e) => { setSelectedExam(e.target.value); setPage(1) }}>
          <option value="">All exams</option>
          {exams.map((e) => <option key={e.id} value={e.id}>{e.title} – {e.class?.name}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? <LoadingPage /> : grades.length === 0 ? (
          <EmptyState
            title="No grades recorded"
            description={selectedExam ? 'Click "Enter Grades" to add grades for this exam' : 'Select an exam to view grades'}
            action={selectedExam && <Button onClick={() => setShowModal(true)}>Enter Grades</Button>}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Student</Th><Th>Subject</Th><Th>Exam</Th><Th>Marks</Th><Th>%</Th><Th>Grade</Th><Th>Result</Th>
              </TableHead>
              <TableBody>
                {grades.map((g) => {
                  const pct    = ((g.marks / g.exam.totalMarks) * 100).toFixed(1)
                  const passed = g.marks >= g.exam.passingMarks
                  return (
                    <Tr key={g.id}>
                      <Td><p className="font-medium text-sm">{g.student?.user?.firstName} {g.student?.user?.lastName}</p></Td>
                      <Td><span className="text-sm">{g.subject?.name}</span></Td>
                      <Td><span className="text-sm text-slate-500">{g.exam?.title}</span></Td>
                      <Td><span className="font-bold">{g.marks}<span className="text-xs text-slate-400 font-normal">/{g.exam?.totalMarks}</span></span></Td>
                      <Td><span className="text-sm">{pct}%</span></Td>
                      <Td><Badge variant={GRADE_COLOR[g.grade] || 'default'} className="font-bold">{g.grade || '—'}</Badge></Td>
                      <Td><Badge variant={passed ? 'success' : 'danger'}>{passed ? 'Pass' : 'Fail'}</Badge></Td>
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
              await post('/api/grades', { examId: selectedExam, grades: gradesData })
              notify(`${gradesData.length} grades saved`)
              setShowModal(false)
              refetch()
            } catch (e) { notify(e.message, 'error') }
          }}
        />
      )}
    </div>
  )
}

function GradeEntryModal({ examId, exam, saving, onClose, onSave }) {
  const { data: studentsData } = useFetch(`/api/students?classId=${exam?.classId || ''}&limit=100`)
  const students = studentsData?.data ?? []
  const [gradeMap, setGradeMap] = useState({})

  function setGrade(studentId, field, value) {
    setGradeMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], studentId, [field]: value } }))
  }

  return (
    <Modal open title={`Enter Grades: ${exam?.title}`} onClose={onClose} size="xl">
      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <p className="text-xs text-blue-700">Total: <strong>{exam?.totalMarks}</strong> · Pass: <strong>{exam?.passingMarks}</strong></p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white border-b border-surface-border">
            <tr>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Student</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 w-28">Marks /{exam?.totalMarks}</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {students.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-sm text-slate-400">No students enrolled</td></tr>
            ) : students.map((s) => (
              <tr key={s.id}>
                <td className="py-2 px-3">
                  <p className="font-medium text-slate-800">{s.user.firstName} {s.user.lastName}</p>
                  <p className="text-xs text-slate-400">{s.studentCode}</p>
                </td>
                <td className="py-2 px-3">
                  <input type="number" min="0" max={exam?.totalMarks} step="0.5"
                    value={gradeMap[s.id]?.marks ?? ''}
                    onChange={(e) => setGrade(s.id, 'marks', e.target.value)}
                    placeholder="0"
                    className="w-24 h-8 px-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </td>
                <td className="py-2 px-3">
                  <input type="text"
                    value={gradeMap[s.id]?.remarks ?? ''}
                    onChange={(e) => setGrade(s.id, 'remarks', e.target.value)}
                    placeholder="Optional"
                    className="w-full h-8 px-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-4 border-t border-surface-border mt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          onClick={() => onSave(students.map((s) => ({ studentId: s.id, marks: parseFloat(gradeMap[s.id]?.marks || 0), remarks: gradeMap[s.id]?.remarks || '' })))}
          loading={saving} className="flex-1" disabled={students.length === 0}>
          Save {students.length} Grades
        </Button>
      </div>
    </Modal>
  )
}
