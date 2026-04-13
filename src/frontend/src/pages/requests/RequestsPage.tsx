import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import type { PartRequest } from '@/types/request'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-5 py-2.5 text-sm hover:bg-[#39FF88] transition-colors'

function urgencyLabel(u: number) {
  return ['Standard', 'Express', 'Urgent'][u] ?? '—'
}

function conditionLabel(c: number) {
  return ['Any Condition', 'OEM', 'Aftermarket', 'Second Hand', 'Open to All'][c] ?? '—'
}

export default function RequestsPage() {
  const { auth } = useAuth()
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth) return
    requestApi
      .getByUserId(auth.userId, auth.token)
      .then(({ data }) => {
        setRequests(data)
      })
      .catch(() => setError('Failed to load requests.'))
      .finally(() => setLoading(false))
  }, [auth])

  return (
    <div className="min-h-screen bg-[#07110A] text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px]">
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
                <span className="block w-6 h-px bg-[#00C853]" />
                Part Requests
              </p>
              <h1 className="text-3xl font-extrabold text-white font-display">My Requests</h1>
            </div>
            <Link to="/requests/new" className={btnPrimary}>
              + New Request
            </Link>
          </div>

          {loading && (
            <p className="text-[#7A9A80] text-sm">Loading…</p>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {!loading && !error && requests.length === 0 && (
            <Card className="bg-[#111C14] border-[rgba(0,200,83,0.15)] text-white">
              <CardContent className="py-16 text-center">
                <p className="text-[#7A9A80] mb-4">You haven't submitted any requests yet.</p>
                <Link to="/requests/new" className={btnPrimary}>
                  Request your first part
                </Link>
              </CardContent>
            </Card>
          )}

          {!loading && requests.length > 0 && (
            <div className="grid gap-3">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  to={`/requests/${req.id}`}
                  className="bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between hover:border-[rgba(0,200,83,0.3)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{req.partName || '—'}</p>
                    <p className="text-[#7A9A80] text-xs mt-0.5">
                      {req.vehicleMake} {req.model} {req.year} · {conditionLabel(req.conditionPreference)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {req.orders && req.orders.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-blue-400/10 text-blue-400">
                        {req.orders.length} order{req.orders.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={cn(
                      'text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md',
                      req.urgency === 2
                        ? 'bg-red-400/10 text-red-400'
                        : req.urgency === 1
                        ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-[rgba(0,200,83,0.1)] text-[#00C853]',
                    )}>
                      {urgencyLabel(req.urgency)}
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px]',
                        req.isSorted
                          ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                      )}
                    >
                      {req.isSorted ? 'Sorted' : 'Pending'}
                    </Badge>
                    <span className="text-[#3D5942] text-xs font-mono">#{req.id}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
