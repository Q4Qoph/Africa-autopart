// src/frontend/src/pages/requests/RequestPartsPage.tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { partsApi } from '@/api/partsApi'
import { orderApi } from '@/api/orderApi'
import { paymentApi } from '@/api/paymentApi'
import type { PartRequest } from '@/types/request'
import type { PartResult } from '@/types/parts'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RequestPartsPage() {
  const { id } = useParams<{ id: string }>()
  const { auth } = useAuth()
  const { t } = useTranslation('requests')
  const navigate = useNavigate()

  const [request, setRequest] = useState<PartRequest | null>(null)
  const [parts, setParts] = useState<PartResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedPart, setSelectedPart] = useState<PartResult | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mpesaError, setMpesaError] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!auth || !id) return
    requestApi
      .getById(Number(id), auth.token)
      .then(({ data }) => {
        setRequest(data)
        setSearchQuery(data.partName)
        setPhoneNumber(data.phone || '')
        return partsApi.search({
          query: data.partName,
          make: data.vehicleMake,
          model: data.model,
          year: data.year,
        })
      })
      .then(({ data }) => setParts(data))
      .catch(() => setParts([]))
      .finally(() => setLoading(false))
  }, [auth, id])

  async function handleSearch() {
    if (!searchQuery.trim() || !request) return
    setSearching(true)
    setParts([])
    setSelectedPart(null)
    try {
      const { data } = await partsApi.search({
        query: searchQuery.trim(),
        make: request.vehicleMake,
        model: request.model,
        year: request.year,
      })
      setParts(data)
    } catch {
      setParts([])
    } finally {
      setSearching(false)
    }
  }

  async function handleOrder(part: PartResult) {
    if (!auth || !request) return
    setOrderError('')
    setMpesaError('')
    setOrdering(true)

    try {
      const { data: order } = await orderApi.create(
        {
          supplierName: part.supplierName,
          partName: part.partName,
          partRequestId: request.id,
          price: part.price,
        },
        auth.token,
      )

      if (paymentMethod === 'stripe') {
        const { data: payment } = await paymentApi.addPayment({ orderId: order.orderId }, auth.token)
        sessionStorage.setItem('pendingStripeSessionId', payment.stripeSessionId)
        sessionStorage.setItem('pendingOrderId', String(order.orderId))
        window.location.href = payment.url
        return
      }

      if (!phoneNumber.trim()) {
        setMpesaError('Enter phone number')
        setOrdering(false)
        return
      }

      const { data: stk } = await paymentApi.initiateStkPush(order.orderId, phoneNumber.trim(), auth.token)

      if (!stk.isSuccessful) {
        setMpesaError(stk.responseDescription || 'M-Pesa STK push failed')
        setOrdering(false)
        return
      }

      sessionStorage.setItem('pendingOrderId', String(order.orderId))
      navigate(`/orders/mpesa-status/${order.orderId}`)
    } catch {
      setOrderError(t('parts_order_error'))
      setOrdering(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[1000px] mx-auto px-6 py-12">
          <Link
            to={`/requests/${id}`}
            className="text-[#4A6B50] dark:text-[#7A9A80] text-xs hover:text-[#07110A] dark:hover:text-white mb-6 inline-block"
          >
            {t('detail_back')}
          </Link>

          {request && (
            <div className="mb-8">
              <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
                <span className="block w-6 h-px bg-[#00C853]" />
                {t('parts_heading')}
              </p>
              <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">
                {request.partName}
              </h1>
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
                {request.vehicleMake} {request.model} {request.year}
              </p>
            </div>
          )}

          <div className="mb-6 flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('parts_search_placeholder')}
                className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-10 max-w-sm"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-10 px-5 text-sm font-semibold"
              >
                {searching ? t('parts_loading') : t('parts_search_again')}
              </Button>
            </div>

            <div className="rounded-xl border border-[rgba(0,200,83,0.12)] bg-white dark:bg-[#111C14] px-4 py-4">
              <p className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                Payment method
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                  />
                  Stripe
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'mpesa'}
                    onChange={() => setPaymentMethod('mpesa')}
                  />
                  M-Pesa
                </label>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="mt-3">
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="2547XXXXXXXX"
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-10 max-w-sm"
                  />
                  {mpesaError && <p className="text-red-400 text-xs mt-2">{mpesaError}</p>}
                </div>
              )}
            </div>
          </div>

          {(loading || searching) && (
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('parts_loading')}</p>
          )}

          {!loading && !searching && parts.length === 0 && (
            <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl px-6 py-12 text-center">
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('parts_empty')}</p>
            </div>
          )}

          {!loading && !searching && parts.length > 0 && (
            <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
              <div className="grid grid-cols-[80px_1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)] text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
                <span />
                <span>{t('parts_col_part')}</span>
                <span>{t('parts_col_supplier')}</span>
                <span>{t('parts_col_condition')}</span>
                <span>{t('parts_col_stock')}</span>
                <span>{t('parts_col_price')}</span>
                <span />
              </div>

              {parts.map((part) => (
                <div
                  key={part.id}
                  className={`grid grid-cols-[80px_1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-0 transition-colors ${
                    selectedPart?.id === part.id
                      ? 'bg-[rgba(0,200,83,0.06)]'
                      : 'hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-[#0D1810] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    {part.imageURL ? (
                      <img
                        src={part.imageURL}
                        alt={part.partName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-[#7A9A80]">No image</span>
                    )}
                  </div>

                  <div>
                    <p className="text-[#07110A] dark:text-white text-sm font-medium">{part.partName}</p>
                    {part.partNumber && (
                      <p className="text-[#7A9A80] dark:text-[#3D5942] text-[10px] font-mono">{part.partNumber}</p>
                    )}
                  </div>

                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{part.supplierName}</p>

                  <Badge className="bg-[rgba(0,200,83,0.06)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px] whitespace-nowrap">
                    {part.condition}
                  </Badge>

                  <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">{part.stock}</span>

                  <span className="text-[#00C853] font-semibold text-sm whitespace-nowrap">
                    ${part.price.toLocaleString()}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPart(part)
                      handleOrder(part)
                    }}
                    disabled={ordering}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-8 px-4 text-xs font-semibold whitespace-nowrap"
                  >
                    {ordering && selectedPart?.id === part.id
                      ? t('parts_ordering')
                      : t('parts_order_btn')}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {orderError && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20 mt-4">
              {orderError}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}