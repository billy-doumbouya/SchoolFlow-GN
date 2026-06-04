'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createExamSchema } from '@/schemas'
import { useFetch, useApi, usePagination } from '@/hooks'
import {
  Button, Card, Badge, Modal, Input, Select,
  Table, TableHead, Th, TableBody, Tr, Td,
  EmptyState, Pagination, LoadingPage,
} from '@/components/ui'

const EXAM_TYPE_BADGE = { TEST: 'info', MIDTERM: 'warning', FINAL: 'danger', QUIZ: 'brand', ASSIGNMENT: 'success' }
function formatDate(d) { return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' }) }
const CURRENT_YEAR = new Date().getFullYear()

export default function TeacherExamsPage() {
  const [showForm, setShowForm] = useState(false)
  const [toast,    setToast]    = useState(null)

  const { page, setPage, queryString } = usePagination()
  const { data, loading, refetch }     = useFetch(`/api/exams?${queryString}`, [page])
  const { data: classData }            = useFetch('/api/classes?limit=100')
  const { data: subjectData }          = useFetch('/api/subjects?limit=100')
  const { post, loading: saving }      = useApi()

  const exams    = data?.data       ?? []
  const classes  = classData?.data  ?? []
  const subjects = subjectData?.data ?? []
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
          <h1 className="text-xl font-bold text-slate-900">Exams</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule and manage your exams</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Schedule Exam</Button>
      </div>

      <Card>
        {loading ? <LoadingPage /> : exams.length === 0 ? (
          <EmptyState title="No exams yet" action={<Button onClick={() => setShowForm(true)}>Schedule Exam</Button>} />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Title</Th><Th>Class</Th><Th>Subject</Th><Th>Type</Th><Th>Date</Th><Th>Marks</Th><Th>Graded</Th>
              </TableHead>
              <TableBody>
                {exams.map((e) => (
                  <Tr key={e.id}>
                    <Td><p className="font-medium text-slate-800 text-sm">{e.title}</p></Td>
                    <Td><Badge variant="info">{e.class?.name}</Badge></Td>
                    <Td><span className="text-sm">{e.subject?.name}</span></Td>
                    <Td><Badge variant={EXAM_TYPE_BADGE[e.examType] || 'default'}>{e.examType}</Badge></Td>
                    <Td><span className="text-sm text-slate-600">{formatDate(e.examDate)}</span></Td>
                    <Td><span className="text-sm font-semibold">{e.totalMarks}</span></Td>
                    <Td><Badge variant={e._count?.grades > 0 ? 'success' : 'default'}>{e._count?.grades || 0}</Badge></Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showForm && (
        <ExamModal
          classes={classes} subjects={subjects} saving={saving}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            try {
              await post('/api/exams', data)
              notify('Exam scheduled')
              setShowForm(false)
              refetch()
            } catch (e) { notify(e.message, 'error') }
          }}
        />
      )}
    </div>
  )
}

function ExamModal({ classes, subjects, saving, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createExamSchema),
    defaultValues: { examType: 'TEST', academicYear: `${CURRENT_YEAR}-${CURRENT_YEAR + 1}` },
  })
  return (
    <Modal open title="Schedule Exam" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input label="Exam Title" required error={errors.title?.message} {...register('title')} placeholder="Mathematics Chapter 3 Test" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Class" required error={errors.classId?.message} {...register('classId')}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Subject" required error={errors.subjectId?.message} {...register('subjectId')}>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" required error={errors.examType?.message} {...register('examType')}>
            {['TEST','MIDTERM','FINAL','QUIZ','ASSIGNMENT'].map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Academic Year" required error={errors.academicYear?.message} {...register('academicYear')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Total Marks" required type="number" error={errors.totalMarks?.message} {...register('totalMarks')} placeholder="100" />
          <Input label="Passing Marks" required type="number" error={errors.passingMarks?.message} {...register('passingMarks')} placeholder="50" />
          <Input label="Exam Date" required type="date" error={errors.examDate?.message} {...register('examDate')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={saving} className="flex-1">Schedule</Button>
        </div>
      </form>
    </Modal>
  )
}
