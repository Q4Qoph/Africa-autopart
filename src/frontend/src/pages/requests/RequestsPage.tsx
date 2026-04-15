import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import type { PartRequest } from '@/types/request'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-5 py-2.5 text-sm hover:bg-[#39FF88] transition-colors'

export default function RequestsPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('requests')
  const { t: tCommon } = useTranslation('common')
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const urgencyLabel = (u: number) =>
    [t('urgency_standard_short'), t('urgency_express_short'), t('urgency_urgent_short')][u] ?? '—'

  const conditionLabel = (c: number) =>
    [t('condition_any'), t('condition_oem'), t('condition_aftermarket'), t('condition_secondHand'), t('condition_openToAll')][c] ?? '—'

  useEffect(() => {
    if (!auth) return
    requestApi
      .getByEmail(auth.email, auth.token)
      .then(({ data }) => setRequests([...data].reverse()))
      .catch(() => setError(t('error_load')))
      .finally(() => setLoading(false))
  }, [auth]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
                <span className="block w-6 h-px bg-[#00C853]" />
                {t('page_label')}
              </p>
              <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">{t('page_heading')}</h1>
            </div>
            <Link to="/requests/new" className={btnPrimary}>
              {t('new_request_btn')}
            </Link>
          </div>

          {loading && (
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('images_uploading').replace('…', '').trimEnd()}…</p>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {!loading && !error && requests.length === 0 && (
            <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.15)] text-[#07110A] dark:text-white">
              <CardContent className="py-16 text-center">
                <p className="text-[#4A6B50] dark:text-[#7A9A80] mb-4">{t('empty_text')}</p>
                <Link to="/requests/new" className={btnPrimary}>
                  {t('empty_cta')}
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
                  className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between hover:border-[rgba(0,200,83,0.3)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[#07110A] dark:text-white font-semibold truncate">{req.partName || '—'}</p>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs mt-0.5">
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
                      {req.isSorted ? tCommon('status_sorted') : tCommon('status_pending')}
                    </Badge>
                    <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs font-mono">#{req.id}</span>
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
