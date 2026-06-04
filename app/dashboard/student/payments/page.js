'use client'
import { useFetch, usePagination } from '@/hooks'
import { Card, Badge, Table, TableHead, Th, TableBody, Tr, Td, Pagination, LoadingPage, EmptyState } from '@/components/ui'

function formatGNF(v) {
  return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(v)
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-GN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_BADGE = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'info' }

export default function StudentPaymentsPage() {
  const { page, setPage, queryString } = usePagination()
  const { data, loading } = useFetch(`/api/payments?${queryString}`, [page])
  const payments   = data?.data       ?? []
  const pagination = data?.pagination ?? null

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Payments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track your school fee payment history</p>
      </div>

      <Card>
        {loading ? <LoadingPage /> : payments.length === 0 ? (
          <EmptyState title="No payments yet" description="Your payment history will appear here" />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Reference</Th>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <Tr key={p.id}>
                    <Td><span className="text-sm text-slate-800">{p.description || p.paymentType}</span></Td>
                    <Td><span className="font-semibold text-slate-900">{formatGNF(p.amount)}</span></Td>
                    <Td><Badge variant="brand">{p.paymentType.replace('_', ' ')}</Badge></Td>
                    <Td><Badge variant={STATUS_BADGE[p.status] || 'default'}>{p.status}</Badge></Td>
                    <Td><span className="text-sm text-slate-500">{formatDate(p.createdAt)}</span></Td>
                    <Td>
                      {p.guinePayRef
                        ? <span className="font-mono text-xs text-slate-400">{p.guinePayRef.slice(0, 16)}…</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </Td>
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
