// src/frontend/src/components/ui/OrderCard.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { paymentApi } from '@/api/paymentApi'
import type { CustomerOrder } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, Clock, Truck } from 'lucide-react'

interface OrderCardProps {
  order: CustomerOrder
  t: (key: string) => string
  onTrack: (tracking: string) => void
  onDelete?: (orderId: number) => void
}

export default function OrderCard({ order, t, onTrack, onDelete }: OrderCardProps) {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  // Payment State
  const [localPayMethod, setLocalPayMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [localPhone, setLocalPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const statusColor =
    order.status === 'Delivered'
      ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
      : order.status === 'Shipped'
        ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'

  function formatMpesaPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1)
    }
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned
    }
    return cleaned
  }

  async function handlePayClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!auth) return
    setPaying(true)
    setPayError('')
    try {
      if (localPayMethod === 'stripe') {
        const paymentPromise = order.isNew
          ? paymentApi.addNewPayment({ orderId: order.orderId }, auth.token)
          : paymentApi.addPayment({ orderId: order.orderId }, auth.token)

        const paymentRes = await paymentPromise
        const paymentData = paymentRes.data

        sessionStorage.setItem('pendingStripeSessionId', paymentData.stripeSessionId)
        sessionStorage.setItem('pendingOrderId', String(order.orderId))
        if (order.isNew) {
          sessionStorage.setItem('isNewOrder', 'true')
        } else {
          sessionStorage.removeItem('isNewOrder')
        }

        window.location.href = paymentData.url
      } else {
        const phoneToUse = localPhone.trim() || ''
        if (!phoneToUse) {
          setPayError(t('mpesa_phone_required') || 'Phone number is required.')
          setPaying(false)
          return
        }
        const formattedPhone = formatMpesaPhone(phoneToUse)
        const mpesaPromise = order.isNew
          ? paymentApi.initiateNewStkPush(order.orderId, formattedPhone, auth.token)
          : paymentApi.initiateStkPush(order.orderId, formattedPhone, auth.token)

        const mpesaRes = await mpesaPromise
        if (mpesaRes.data.isSuccessful) {
          if (order.isNew) {
            sessionStorage.setItem('isNewOrder', 'true')
          } else {
            sessionStorage.removeItem('isNewOrder')
          }
          navigate(`/orders/mpesa-status/${order.orderId}`)
        } else {
          throw new Error(mpesaRes.data.customerMessage || 'Failed to initiate M-Pesa payment.')
        }
      }
    } catch (err: any) {
      console.error(err)
      setPayError(err?.message || 'Payment initiation failed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)] overflow-hidden transition-all shadow-sm">
      {/* Header – always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[rgba(0,200,83,0.02)] transition-colors"
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#7A9A80]">#{order.orderId}</span>
            <h3 className="text-sm font-semibold truncate">{order.requestedPartName}</h3>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#4A6B50] dark:text-[#7A9A80]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(order.dateCreated).toLocaleDateString()}
            </span>
            <span>{order.vehicleMake} {order.model}</span>
            <span className="font-mono">{order.trackingNumber || t('not_assigned')}</span>
            {order.isNew && (
              <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 text-[9px] px-1 py-0.5 border border-sky-500/20">
                VIN Catalog
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Badge className={cn('text-[10px]', statusColor)}>{order.status}</Badge>
          <p className="text-sm font-bold text-[#00C853]">${order.total?.toLocaleString() ?? '0'}</p>
          <ChevronRight className={cn('w-4 h-4 text-[#4A6B50] transition-transform', expanded && 'rotate-90')} />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[rgba(0,200,83,0.12)] px-5 py-4 bg-[rgba(0,200,83,0.01)] dark:bg-[rgba(0,200,83,0.01)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('order_date') || 'Date'}</p>
              <p className="font-medium">{new Date(order.dateCreated).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('tracking') || 'Tracking'}</p>
              <p className="font-medium font-mono">{order.trackingNumber || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('vehicle') || 'Vehicle'}</p>
              <p className="font-medium">{order.vehicleMake} {order.model}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('description') || 'Description'}</p>
              <p className="font-medium text-xs leading-snug">{order.requestDescription || '—'}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-[rgba(0,200,83,0.08)] pt-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
              {t('order_items') || 'Order Items'}
            </p>
            <div className="space-y-2">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.partName}</p>
                    <p className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">{item.supplierName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.price.toLocaleString()}</p>
                    <p className="text-xs text-[#4A6B50]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-[rgba(0,200,83,0.08)] pt-3 mt-3">
              <span className="text-sm font-semibold">{t('total') || 'Total'}</span>
              <span className="text-lg font-bold text-[#00C853]">${order.total?.toLocaleString() ?? '0'}</span>
            </div>
          </div>

          {/* Pay Action Section for Pending status */}
          {order.status === 'Pending' && (
            <div className="border-t border-[rgba(0,200,83,0.08)] pt-4 mt-4 select-none">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                Pay for this Order
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={`payMethod-${order.orderId}`}
                      checked={localPayMethod === 'stripe'}
                      onChange={() => {
                        setLocalPayMethod('stripe')
                        setPayError('')
                      }}
                      className="accent-[#00C853]"
                    />
                    Stripe (Card)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={`payMethod-${order.orderId}`}
                      checked={localPayMethod === 'mpesa'}
                      onChange={() => {
                        setLocalPayMethod('mpesa')
                        setPayError('')
                      }}
                      className="accent-[#00C853]"
                    />
                    M-Pesa Mobile
                  </label>
                </div>

                {localPayMethod === 'mpesa' && (
                  <Input
                    type="text"
                    placeholder="M-Pesa phone (e.g. 2547...)"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="h-8 text-xs max-w-[200px] border-[rgba(0,200,83,0.2)] focus:border-[#00C853]"
                  />
                )}

                <Button
                  size="sm"
                  disabled={paying}
                  onClick={handlePayClick}
                  className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-8 px-4 text-xs font-semibold"
                >
                  {paying ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
              {payError && <p className="text-red-400 text-xs mt-2 font-semibold">{payError}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            {order.trackingNumber && (
              <button
                type="button"
                onClick={() => onTrack(order.trackingNumber!)}
                className="text-xs font-medium text-[#00C853] hover:underline flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" />
                {t('track_order') || 'Track Order'}
              </button>
            )}
            {/* Delete button only for pending orders and if onDelete is provided */}
            {order.status === 'Pending' && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('delete_confirm') || 'Delete this order?')) {
                    onDelete(order.orderId)
                  }
                }}
                className="text-xs text-red-400 hover:underline"
              >
                {t('delete_order') || 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
