'use client'
import { useFetch } from '@/hooks'
import { Card, Badge, LoadingPage, EmptyState } from '@/components/ui'

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-GN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function StudentSchedulePage() {
  const { data, loading } = useFetch('/api/exams?limit=20')
  const exams = data?.data ?? []

  const upcoming = exams
    .filter((e) => new Date(e.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))

  const past = exams
    .filter((e) => new Date(e.examDate) < new Date())
    .sort((a, b) => new Date(b.examDate) - new Date(a.examDate))

  const EXAM_COLORS = { TEST: 'info', MIDTERM: 'warning', FINAL: 'danger', QUIZ: 'brand', ASSIGNMENT: 'success' }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Schedule</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upcoming exams and assessments</p>
      </div>

      {loading ? <LoadingPage /> : (
        <div className="space-y-8">
          {/* Upcoming */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Upcoming Exams ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <Card><div className="p-8 text-center text-sm text-slate-400">No upcoming exams 🎉</div></Card>
            ) : (
              <div className="space-y-3">
                {upcoming.map((e) => {
                  const daysLeft = Math.ceil((new Date(e.examDate) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <Card key={e.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold text-xs
                            ${daysLeft === 0 ? 'bg-red-500' : daysLeft <= 3 ? 'bg-amber-500' : 'bg-brand-600'}`}>
                            <span className="text-lg leading-none">{new Date(e.examDate).getDate()}</span>
                            <span className="text-[9px] uppercase">{new Date(e.examDate).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{e.title}</p>
                            <p className="text-sm text-slate-500">{e.subject?.name} · {e.class?.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <Badge variant={EXAM_COLORS[e.examType] || 'default'}>{e.examType}</Badge>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{formatDate(e.examDate)}</p>
                            <p className={`text-xs font-medium ${daysLeft === 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {daysLeft === 0 ? 'Today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                Past Exams ({past.length})
              </h2>
              <div className="space-y-2">
                {past.slice(0, 5).map((e) => (
                  <Card key={e.id} className="p-3 opacity-70">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{e.title}</p>
                        <p className="text-xs text-slate-400">{e.subject?.name} · {formatDate(e.examDate)}</p>
                      </div>
                      <Badge variant={EXAM_COLORS[e.examType] || 'default'}>{e.examType}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
