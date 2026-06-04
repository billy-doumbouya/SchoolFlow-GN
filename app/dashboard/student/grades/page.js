'use client'
import { useFetch, usePagination } from '@/hooks'
import { Card, Badge, Table, TableHead, Th, TableBody, Tr, Td, Pagination, LoadingPage, EmptyState } from '@/components/ui'

const GRADE_COLOR = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }

export default function StudentGradesPage() {
  const { page, setPage, queryString } = usePagination()
  const { data, loading } = useFetch(`/api/grades?${queryString}`, [page])
  const grades     = data?.data       ?? []
  const pagination = data?.pagination ?? null

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Grades</h1>
        <p className="text-sm text-slate-500 mt-0.5">View all your exam results and scores</p>
      </div>

      <Card>
        {loading ? <LoadingPage /> : grades.length === 0 ? (
          <EmptyState title="No grades yet" description="Your grades will appear here after exams are marked" />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Subject</Th>
                <Th>Exam</Th>
                <Th>Type</Th>
                <Th>Score</Th>
                <Th>Percentage</Th>
                <Th>Grade</Th>
                <Th>Result</Th>
                <Th>Remarks</Th>
              </TableHead>
              <TableBody>
                {grades.map((g) => {
                  const pct    = ((g.marks / g.exam.totalMarks) * 100).toFixed(1)
                  const passed = g.marks >= g.exam.passingMarks
                  return (
                    <Tr key={g.id}>
                      <Td><span className="font-medium text-slate-800">{g.subject?.name}</span></Td>
                      <Td><span className="text-sm text-slate-700">{g.exam?.title}</span></Td>
                      <Td><Badge variant="info">{g.exam?.examType}</Badge></Td>
                      <Td>
                        <span className="font-bold text-slate-900">{g.marks}</span>
                        <span className="text-xs text-slate-400 ml-1">/ {g.exam?.totalMarks}</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm text-slate-700">{pct}%</span>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant={GRADE_COLOR[g.grade] || 'default'} className="font-bold">
                          {g.grade || '—'}
                        </Badge>
                      </Td>
                      <Td><Badge variant={passed ? 'success' : 'danger'}>{passed ? 'Passed' : 'Failed'}</Badge></Td>
                      <Td><span className="text-xs text-slate-500">{g.remarks || '—'}</span></Td>
                    </Tr>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
