import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { orderApi } from '@/api/orderApi'
import type { Order } from '@/types/order'
import { OrderStatus, statusLabel } from '@/types/order'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function statusBadge(status: number) {
  if (status === OrderStatus.Delivered)
    return 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
  if (status === OrderStatus.Shipped)
    return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
  return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
}

export default function OrdersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth) return
    orderApi
      .getAll(auth.token)
      .then(({ data }) => setOrders(data))
      .catch(() => setError(t('error_load')))
      .finally(() => setLoading(false))
  }, [auth]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          <div className="mb-8">
            <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
              <span className="block w-6 h-px bg-[#00C853]" />
              {t('page_label')}
            </p>
            <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">{t('page_heading')}</h1>
          </div>

          {loading && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {!loading && !error && orders.length === 0 && (
            <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.15)] text-[#07110A] dark:text-white">
              <CardContent className="py-16 text-center">
                <p className="text-[#4A6B50] dark:text-[#7A9A80]">{t('empty_text')}</p>
                <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-1">
                  {t('empty_subtext')}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && orders.length > 0 && (
            <div className="grid gap-3">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[3rem_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-[#7A9A80] dark:text-[#3D5942]">
                <span>#</span>
                <span>{t('col_part')}</span>
                <span>{t('col_supplier')}</span>
                <span>{t('col_price')}</span>
                <span>{t('col_tracking')}</span>
                <span>{t('col_status')}</span>
              </div>

              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-2xl px-6 py-5 grid grid-cols-1 md:grid-cols-[3rem_1fr_1fr_1fr_1fr_1fr] gap-4 items-center"
                >
                  <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs font-mono">{order.orderId}</span>

                  <div>
                    <p className="text-[#07110A] dark:text-white text-sm font-medium">{order.part?.partName ?? '—'}</p>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">{order.part?.partNumber ?? ''}</p>
                    <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-0.5">
                      {order.partRequest?.vehicleMake} {order.partRequest?.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{order.supplier?.businessName ?? '—'}</p>
                    <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs">{order.supplier?.email ?? ''}</p>
                  </div>

                  <p className="text-[#00C853] font-semibold text-sm">
                    ${order.price?.toLocaleString()}
                  </p>

                  <p className={cn(
                    'text-xs font-mono',
                    order.trackingNumber ? 'text-[#07110A] dark:text-white' : 'text-[#7A9A80] dark:text-[#3D5942]',
                  )}>
                    {order.trackingNumber || t('not_assigned')}
                  </p>

                  <Badge className={cn('text-[10px] w-fit', statusBadge(order.status))}>
                    {statusLabel(order.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
