'use client'
import { useState } from 'react'
import { useFetch, useDebounce, usePagination } from '@/hooks'
import { Card, Badge, Avatar, Table, TableHead, Th, TableBody, Tr, Td, Pagination, LoadingPage, EmptyState } from '@/components/ui'

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { page, setPage, queryString } = usePagination()

  const url = `/api/students?${queryString}${debouncedSearch ? `&search=${debouncedSearch}` : ''}`
  const { data, loading } = useFetch(url, [page, debouncedSearch])
  const students   = data?.data       ?? []
  const pagination = data?.pagination ?? null

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-0.5">View students in your classes</p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search students..."
            className="h-9 pl-9 pr-3 w-full rounded-lg border border-surface-border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>

      <Card>
        {loading ? <LoadingPage /> : students.length === 0 ? (
          <EmptyState title="No students found" description={search ? 'Try a different search' : 'No students enrolled yet'} />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Student</Th><Th>Code</Th><Th>Class</Th><Th>Gender</Th><Th>Parent</Th><Th>Status</Th>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${s.user.firstName} ${s.user.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{s.user.firstName} {s.user.lastName}</p>
                          <p className="text-xs text-slate-400">{s.user.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs text-slate-500">{s.studentCode}</span></Td>
                    <Td>
                      {s.enrollments?.[0]?.class
                        ? <Badge variant="info">{s.enrollments[0].class.name}</Badge>
                        : <span className="text-xs text-slate-400">—</span>}
                    </Td>
                    <Td><span className="text-sm text-slate-600">{s.gender || '—'}</span></Td>
                    <Td>
                      {s.parentName
                        ? <div><p className="text-sm text-slate-700">{s.parentName}</p><p className="text-xs text-slate-400">{s.parentPhone}</p></div>
                        : <span className="text-xs text-slate-400">—</span>}
                    </Td>
                    <Td><Badge variant={s.isActive ? 'success' : 'danger'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
