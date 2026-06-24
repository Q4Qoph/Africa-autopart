import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { orderApi } from '@/api/orderApi'
import type { PartRequest } from '@/types/request'
import { ConditionPreference, Urgency } from '@/types/request'
import { statusLabel } from '@/types/order'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { paymentApi } from '@/api/paymentApi'
import TrackOrderModal from '@/components/ui/TrackOrderModal'



const selectClass =
  'w-full h-9 px-3 rounded-lg bg-[#EFF7F1] dark:bg-[#162019] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm'

interface EditForm {
  partName: string
  partNumber: string
  conditionPreference: number
  urgency: number
  description: string
  country: string
  phone: string
  email: string
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('requests')
  const { t: tCommon } = useTranslation('common')

  const conditionLabel = [t('condition_any'), t('condition_oem'), t('condition_aftermarket'), t('condition_secondHand'), t('condition_openToAll')]
  const urgencyLabel = [t('urgency_standard_short'), t('urgency_express_short'), t('urgency_urgent_short')]
  const conditionOptions = [
    { value: ConditionPreference.AnyCondition, label: t('condition_any') },
    { value: ConditionPreference.OEM, label: t('condition_oem') },
    { value: ConditionPreference.Aftermarket, label: t('condition_aftermarket') },
    { value: ConditionPreference.Second_Hand, label: t('condition_secondHand') },
    { value: ConditionPreference.Open_To_All, label: t('condition_openToAll') },
  ]
  const urgencyOptions = [
    { value: Urgency.Standard, label: t('urgency_standard_short') },
    { value: Urgency.Express, label: t('urgency_express_short') },
    { value: Urgency.Urgent, label: t('urgency_urgent_short') },
  ]
  const [request, setRequest] = useState<PartRequest | null>(null)
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackOpen, setTrackOpen] = useState(false)
  const [trackingToView, setTrackingToView] = useState('')

  // Payment states
  const [payMethod, setPayMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    partName: '', partNumber: '', conditionPreference: 0,
    urgency: 0, description: '', country: '', phone: '', email: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  // Cancel state
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!auth || !id) return
    const numId = Number(id)
    Promise.all([
      requestApi.getById(numId, auth.token),
      orderApi.getByRequestId(numId, auth.token).catch(() => null),
    ])
      .then(([reqRes, orderRes]) => {
        const data = reqRes.data
        setRequest(data)
        setOrder(orderRes?.data ?? null)
        setEditForm({
          partName: data.partName,
          partNumber: data.partNumber,
          conditionPreference: data.conditionPreference,
          urgency: data.urgency,
          description: data.description,
          country: data.country,
          phone: data.phone,
          email: data.email,
        })
      })
      .catch(() => setError(t('detail_error_load')))
      .finally(() => setLoading(false))
  }, [auth, id])

  async function handleSaveEdit() {
    if (!auth || !request) return
    setEditError('')
    setSavingEdit(true)
    try {
      await requestApi.update(
        request.id,
        {
          vehicleMake: request.vehicleMake,
          model: request.model,
          year: request.year,
          engineType: request.engineType,
          chassisNumber: request.chassisNumber,
          partName: editForm.partName,
          partNumber: editForm.partNumber,
          conditionPreference: editForm.conditionPreference as typeof ConditionPreference[keyof typeof ConditionPreference],
          urgency: editForm.urgency as typeof Urgency[keyof typeof Urgency],
          description: editForm.description,
          country: editForm.country,
          phone: editForm.phone,
          email: editForm.email,
          dateCreated: request.dateCreated,
          userId: request.userId,
          partImages: request.partImages.map((img) => ({ imageUrl: img.imageUrl })),
        },
        auth.token,
      )
      setRequest((prev) => prev ? {
        ...prev,
        ...editForm,
        conditionPreference: editForm.conditionPreference as ConditionPreference,
        urgency: editForm.urgency as Urgency,
      } : prev)
      setEditing(false)
    } catch {
      setEditError(t('detail_error_save'))
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleCancel() {
    if (!auth || !request) return
    if (!window.confirm(t('detail_confirm_cancel'))) return
    setDeleting(true)
    try {
      await requestApi.delete(request.id, auth.token)
      navigate('/requests')
    } catch {
      alert(t('detail_cancel_fail'))
      setDeleting(false)
    }
  }

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

  async function handlePayClick() {
    if (!auth || !order) return
    const orderIdToUse = order.orderId ?? order.id
    setPaying(true)
    setPayError('')
    try {
      if (payMethod === 'stripe') {
        const res = await paymentApi.addPayment({ orderId: orderIdToUse }, auth.token)
        const paymentData = res.data

        sessionStorage.setItem('pendingStripeSessionId', paymentData.stripeSessionId)
        sessionStorage.setItem('pendingOrderId', String(orderIdToUse))
        sessionStorage.removeItem('isNewOrder')

        window.location.href = paymentData.url
      } else {
        const phoneToUse = mpesaPhone.trim() || ''
        if (!phoneToUse) {
          setPayError(t('mpesa_phone_required') || 'Phone number is required.')
          setPaying(false)
          return
        }
        const formattedPhone = formatMpesaPhone(phoneToUse)
        const res = await paymentApi.initiateStkPush(orderIdToUse, formattedPhone, auth.token)
        if (res.data.isSuccessful) {
          sessionStorage.removeItem('isNewOrder')
          navigate(`/orders/mpesa-status/${orderIdToUse}`)
        } else {
          throw new Error(res.data.customerMessage || 'Failed to initiate M-Pesa payment.')
        }
      }
    } catch (err: any) {
      console.error(err)
      setPayError(err?.message || 'Payment initiation failed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div className="flex-grow font-sans text-[#07110A] dark:text-[#E8F0E9]">
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <Link to="/requests" className="text-[#4A6B50] dark:text-[#7A9A80] text-xs hover:text-[#07110A] dark:hover:text-white mb-6 inline-block">
            {t('detail_back')}
          </Link>

          {loading && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{tCommon('loading')}</p>}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {!loading && !error && request && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
                    <span className="block w-6 h-px bg-[#00C853]" />
                    Request #{request.id}
                  </p>
                  <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">{request.partName}</h1>
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
                    {request.vehicleMake} {request.model} {request.year}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn('text-[10px]',
                    request.urgency === 2 ? 'bg-red-400/10 text-red-400 border-red-400/20'
                    : request.urgency === 1 ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    : 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
                  )}>
                    {urgencyLabel[request.urgency] ?? '—'}
                  </Badge>
                  <Badge className={cn('text-[10px]',
                    request.isSorted
                      ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
                      : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                  )}>
                    {request.isSorted ? tCommon('status_sorted') : tCommon('status_pending')}
                  </Badge>
                  {!request.isSorted && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => { setEditing((v) => !v); setEditError('') }}
                        className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                      >
                        {editing ? t('detail_close_edit') : t('detail_edit_btn')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancel}
                        disabled={deleting}
                        className="border border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                      >
                        {deleting ? t('detail_cancelling') : t('detail_cancel_request')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline edit panel */}
              {editing && (
                <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-6">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">{t('detail_edit_heading')}</p>

                  {/* Read-only vehicle info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">{t('detail_field_make')}</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.vehicleMake}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">{t('detail_field_model')}</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.model}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">{t('detail_field_year')}</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.year}</p>
                    </div>
                    <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] sm:col-span-3 italic">{t('detail_vehicle_locked')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_partName')}</Label>
                      <Input
                        value={editForm.partName}
                        onChange={(e) => setEditForm((f) => ({ ...f, partName: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_partNumber')}</Label>
                      <Input
                        value={editForm.partNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, partNumber: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_condition')}</Label>
                      <select
                        value={editForm.conditionPreference}
                        onChange={(e) => setEditForm((f) => ({ ...f, conditionPreference: Number(e.target.value) }))}
                        className={selectClass}
                      >
                        {conditionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_urgency')}</Label>
                      <select
                        value={editForm.urgency}
                        onChange={(e) => setEditForm((f) => ({ ...f, urgency: Number(e.target.value) }))}
                        className={selectClass}
                      >
                        {urgencyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_country')}</Label>
                      <Input
                        value={editForm.country}
                        onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_phone')}</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_email')}</Label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('detail_field_description')}</Label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm resize-none"
                      />
                    </div>
                  </div>

                  {editError && <p className="text-red-400 text-xs mt-3">{editError}</p>}

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={savingEdit || !editForm.partName}
                      className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm"
                    >
                      {savingEdit ? t('detail_saving') : t('detail_save')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                    >
                      {t('cancel_btn')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Request details */}
              <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl p-6 mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-4">{t('detail_label')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Detail label={t('detail_engine')} value={request.engineType || '—'} />
                  <Detail label={t('detail_chassis')} value={request.chassisNumber || '—'} />
                  <Detail label={t('detail_partNumber')} value={request.partNumber || '—'} />
                  <Detail label={t('detail_condition')} value={conditionLabel[request.conditionPreference] ?? '—'} />
                  <Detail label={t('detail_country')} value={request.country} />
                  <Detail label={t('detail_submitted')} value={new Date(request.dateCreated).toLocaleDateString()} />
                </div>
                {request.description && (
                  <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-1">{t('detail_description_label')}</p>
                    <p className="text-[#4A6B50] dark:text-[#C5DEC8] text-sm leading-relaxed">{request.description}</p>
                  </div>
                )}
              </div>

              {/* Order */}
              <div className="mt-8">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                  {t('order_label') ?? 'Associated Order'}
                </p>

                {!order ? (
                  <div className="rounded-2xl border border-[rgba(0,200,83,0.15)] overflow-hidden bg-white dark:bg-[#111C14] px-6 py-12 text-center">
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-1">{t('order_awaiting')}</p>
                    <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mb-5">
                      {t('order_awaiting_desc')}
                    </p>
                    {!request.isSorted && (
                      <Link
                        to={`/requests/${request.id}/parts`}
                        className="inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-5 py-2 text-sm hover:bg-[#39FF88] transition-colors"
                      >
                        {t('order_find_parts_btn')}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[rgba(0,200,83,0.15)] overflow-hidden bg-white dark:bg-[#111C14] px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <Detail label={t('order_part')} value={order.partRequest?.partName ?? order.partName ?? order.requestedPartName ?? '—'} />
                    <Detail label={t('order_price')} value={`$${(order.total ?? order.price ?? 0).toLocaleString()}`} />
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">{t('order_status')}</p>
                      <Badge className={cn('text-[10px]',
                        (order.status === 2 || order.status === 'Delivered') ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
                        : (order.status === 1 || order.status === 'Shipped') ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      )}>
                        {typeof order.status === 'number' ? statusLabel(order.status) : (order.status || '—')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">{t('order_tracking')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-[#07110A] dark:text-white">{order.trackingNumber || tCommon('not_assigned') || 'Not assigned'}</span>
                        {order.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => {
                              setTrackingToView(order.trackingNumber)
                              setTrackOpen(true)
                            }}
                            className="text-xs text-[#00C853] hover:underline"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                    <Detail label={t('order_date')} value={(order.partRequest?.dateCreated ?? order.dateCreated) ? new Date(order.partRequest?.dateCreated ?? order.dateCreated).toLocaleDateString() : '—'} />

                    {/* Pay Action Section for Pending status */}
                    {(order.status === 0 || order.status === 'Pending') && (
                      <div className="col-span-2 sm:col-span-3 border-t border-[rgba(0,200,83,0.08)] pt-4 mt-2">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                          Pay for this Order
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="payMethod"
                                checked={payMethod === 'stripe'}
                                onChange={() => {
                                  setPayMethod('stripe')
                                  setPayError('')
                                }}
                                className="accent-[#00C853]"
                              />
                              Stripe (Card)
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="payMethod"
                                checked={payMethod === 'mpesa'}
                                onChange={() => {
                                  setPayMethod('mpesa')
                                  setPayError('')
                                }}
                                className="accent-[#00C853]"
                              />
                              M-Pesa Mobile
                            </label>
                          </div>

                          {payMethod === 'mpesa' && (
                            <Input
                              type="text"
                              placeholder="M-Pesa phone (e.g. 2547...)"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
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
                  </div>
                )}
              </div>
            </>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">{label}</p>
      <p className="text-[#07110A] dark:text-white text-sm">{value}</p>
    </div>
  )
}
