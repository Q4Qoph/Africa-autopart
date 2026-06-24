// src/frontend/src/pages/orders/OrdersPage.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { orderApi } from '@/api/orderApi'
import type { CustomerOrder } from '@/types/order'
import { mapNewOrderToCustomerOrder } from '@/types/order'

import { Card, CardContent } from '@/components/ui/card'
import TrackOrderModal from '@/components/ui/TrackOrderModal'
import OrderCard from '@/components/ui/OrderCard'

export default function OrdersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('orders')
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackOpen, setTrackOpen] = useState(false)
  const [trackingToView, setTrackingToView] = useState('')

  useEffect(() => {
    if (!auth) return
    Promise.all([
      orderApi.getNewOrdersByUserId(auth.userId, auth.token),
      orderApi.getByUserId(auth.userId, auth.token)
    ])
      .then(([newRes, legacyRes]) => {
        const newMapped = newRes.data.map(o => ({ ...mapNewOrderToCustomerOrder(o), isNew: true }))
        const legacyMapped = legacyRes.data.map(o => ({ ...o, isNew: false }))
        const merged = [...newMapped, ...legacyMapped].sort((a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        )
        setOrders(merged)
      })
      .catch(() => setError(t('error_load') || 'Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [auth]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-grow font-sans text-[#07110A] dark:text-[#E8F0E9]">
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
          <div className="grid gap-4 max-w-[900px]">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                t={t}
                onTrack={(tracking) => {
                  setTrackingToView(tracking)
                  setTrackOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <TrackOrderModal
        open={trackOpen}
        onClose={() => { setTrackOpen(false); setTrackingToView('') }}
        initialTrackingNumber={trackingToView}
      />
    </div>
  )
}
