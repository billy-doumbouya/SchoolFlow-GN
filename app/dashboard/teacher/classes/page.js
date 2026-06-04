'use client'
import { useFetch, usePagination } from '@/hooks'
import { Card, Badge, Table, TableHead, Th, TableBody, Tr, Td, Pagination, LoadingPage, EmptyState } from '@/components/ui'
import Link from 'next/link'

export default function TeacherClassesPage() {
  const { page, setPage, queryString } = usePagination()
  const { data, loading } = useFetch(`/api/classes?${queryString}`, [page])
  const classes    = data?.data       ?? []
  const pagination = data?.pagination ?? null

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Classes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Classes you are assigned to teach</p>
      </div>

      <Card>
        {loading ? <LoadingPage /> : classes.length === 0 ? (
          <EmptyState title="No classes assigned" description="Contact your administrator to be assigned to a class" />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Class</Th>
                <Th>Level</Th>
                <Th>Academic Year</Th>
                <Th>Students</Th>
                <Th>Capacity</Th>
              </TableHead>
              <TableBody>
                {classes.map((c) => {
                  const enrolled = c._count?.enrollments ?? 0
                  return (
                    <Tr key={c.id}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-xs">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                            {c.section && <p className="text-xs text-slate-400">Section {c.section}</p>}
                          </div>
                        </div>
                      </Td>
                      <Td><Badge variant="brand">{c.level}</Badge></Td>
                      <Td><span className="text-sm text-slate-600">{c.academicYear}</span></Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{enrolled}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${enrolled / c.capacity > 0.9 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min((enrolled / c.capacity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Td>
                      <Td><span className="text-sm text-slate-500">{c.capacity}</span></Td>
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
