import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Package, MapPin, Phone, Calendar, Truck,
  Clock, CheckCircle, XCircle,
} from 'lucide-react'
import { orderApi } from '@/api/orderApi'
import type { Order } from '@/types/order'
import { statusCodeToString, OrderStatus } from '@/types/order'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Helpers ────────────────────────────────────────────────────────────────

type StatusKey = 'Pending' | 'Shipped' | 'Delivered'

const STATUS_CONFIG: Record<
  StatusKey,
  { labelKey: string; color: string; icon: React.ReactNode }
> = {
  [OrderStatus.Pending]: {
    labelKey: 'track_status_pending',
    color: 'bg-amber-900/30 text-amber-300 border-amber-700/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  [OrderStatus.Shipped]: {
    labelKey: 'track_status_shipped',
    color: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  [OrderStatus.Delivered]: {
    labelKey: 'track_status_delivered',
    color: 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
}

const PROGRESS_STEPS = [
  { key: OrderStatus.Pending, labelKey: 'track_step_pending' },
  { key: OrderStatus.Shipped, labelKey: 'track_step_shipped' },
  { key: OrderStatus.Delivered, labelKey: 'track_step_delivered' },
]

// ─── Component ─────────────────────────────────────────────────────────────

export default function TrackOrderPage() {
  const { t } = useTranslation('orders')
  const [searchParams] = useSearchParams()

  const [trackingInput, setTrackingInput] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = searchParams.get('tracking')
    if (q && q.trim()) {
      setTrackingInput(q.trim())
      handleSearch(q.trim())
    } else {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  async function handleSearch(query?: string) {
    const term = (query ?? trackingInput).trim()
    if (!term) return

    setSearching(true)
    setError('')
    setOrder(null)
    setHasSearched(true)

    try {
      const { data } = await orderApi.getByTrackingNumber(term)
      setOrder(data)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(t('track_not_found'))
      } else {
        setError(t('track_error'))
      }
    } finally {
      setSearching(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  // Convert numeric status to string for UI
  const statusString = order ? statusCodeToString(order.status) : ''
  const statusInfo = STATUS_CONFIG[statusString as StatusKey] ?? null

  const progressPercent =
    statusString === OrderStatus.Shipped
      ? 50
      : statusString === OrderStatus.Delivered
      ? 100
      : 0

  // Determine if a step is "done"
  const stepDone = (stepKey: string) => {
    if (statusString === OrderStatus.Delivered) return true
    if (statusString === OrderStatus.Shipped) return stepKey !== OrderStatus.Delivered
    return stepKey === OrderStatus.Pending
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />

      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[720px] mx-auto px-6 py-12">

          {/* ── Hero / Search ── */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">
              {t('track_heading')}
            </h1>
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-2 max-w-md mx-auto">
              {t('track_subheading')}
            </p>

            <div className="mt-8 flex gap-2 max-w-md mx-auto">
              <Input
                ref={inputRef}
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('track_placeholder')}
                className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-12 flex-1 text-sm"
              />
              <Button
                onClick={() => handleSearch()}
                disabled={searching || !trackingInput.trim()}
                className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-12 px-6 text-sm font-semibold"
              >
                {searching ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border-2 border-[#07110A]/30 border-t-[#07110A] rounded-full animate-spin" />
                    {t('track_searching')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    {t('track_search')}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Empty (no search yet) ── */}
          {!hasSearched && !error && (
            <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl px-6 py-16 text-center">
              <Package className="w-10 h-10 text-[#7A9A80] dark:text-[#3D5942] mx-auto mb-3" />
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                {t('track_enter_number')}
              </p>
            </div>
          )}

          {/* ── Order Found ── */}
          {order && statusInfo && (
            <div className="space-y-6">
              {/* Top row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-1">
                    {t('track_tracking_num')}
                  </p>
                  <p className="text-[#07110A] dark:text-white font-mono text-lg font-semibold">
                    {order.trackingNumber}
                  </p>
                </div>
                <Badge className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {t(statusInfo.labelKey)}
                </Badge>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl px-5 py-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-4">
                  {t('track_progress')}
                </p>

                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.08)]" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-[#00C853] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />

                  {PROGRESS_STEPS.map((step, idx) => {
                    const done = stepDone(step.key)
                    return (
                      <div key={step.key} className="relative flex flex-col items-center z-10">
                        <div
                          className={`w-8 h-8 rounded-full grid place-items-center transition-colors ${
                            done
                              ? 'bg-[#00C853] text-[#07110A]'
                              : 'bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)] text-[#7A9A80] dark:text-[#3D5942]'
                          }`}
                        >
                          {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <p
                          className={`text-[10px] mt-2 font-mono uppercase tracking-wider ${
                            done ? 'text-[#00C853]' : 'text-[#7A9A80] dark:text-[#3D5942]'
                          }`}
                        >
                          {t(step.labelKey)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-xl px-5 py-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                    {t('track_part_details')}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">Part</span>
                      <p className="text-[#07110A] dark:text-white text-sm font-medium">
                        {order.partName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">Supplier</span>
                      <p className="text-[#07110A] dark:text-white text-sm">
                        {order.supplierName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">Price</span>
                      <p className="text-[#00C853] font-semibold text-lg">
                        ${order.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-xl px-5 py-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                    {t('track_location')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#00C853] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
                          {t('track_location_label')}
                        </span>
                        <p className="text-[#07110A] dark:text-white text-sm">
                          {order.pickUpLocation || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#00C853] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
                          {t('track_phone_label')}
                        </span>
                        <p className="text-[#07110A] dark:text-white text-sm">
                          {order.pickUpLocationPhoneNumber || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#00C853] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
                          {t('track_request_id')}
                        </span>
                        <p className="text-[#07110A] dark:text-white text-sm font-mono">
                          #{order.partRequestId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-[#7A9A80] dark:text-[#3D5942] text-xs mt-8">
                {t('track_support')}{' '}
                <a href="tel:+25377577016" className="text-[#00C853] hover:underline">
                  +253 775 770 16
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}