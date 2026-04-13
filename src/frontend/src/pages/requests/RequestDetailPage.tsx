import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { orderApi } from '@/api/orderApi'
import type { PartRequest } from '@/types/request'
import { ConditionPreference, Urgency } from '@/types/request'
import type { Order } from '@/types/order'
import { OrderStatus, statusLabel } from '@/types/order'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const conditionLabel = ['Any Condition', 'OEM', 'Aftermarket', 'Second Hand', 'Open to All']
const urgencyLabel = ['Standard', 'Express', 'Urgent']

const conditionOptions = [
  { value: ConditionPreference.AnyCondition, label: 'Any Condition' },
  { value: ConditionPreference.OEM, label: 'OEM' },
  { value: ConditionPreference.Aftermarket, label: 'Aftermarket' },
  { value: ConditionPreference.Second_Hand, label: 'Second Hand' },
  { value: ConditionPreference.Open_To_All, label: 'Open to All' },
]

const urgencyOptions = [
  { value: Urgency.Standard, label: 'Standard' },
  { value: Urgency.Express, label: 'Express' },
  { value: Urgency.Urgent, label: 'Urgent' },
]

function statusBadgeClass(status: number) {
  if (status === OrderStatus.Delivered)
    return 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
  if (status === OrderStatus.Shipped)
    return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
  return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
}

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
  const [request, setRequest] = useState<PartRequest | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      .catch(() => setError('Failed to load request details.'))
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
      setEditError('Failed to save changes. Please try again.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleCancel() {
    if (!auth || !request) return
    if (!window.confirm('Cancel this request? This cannot be undone.')) return
    setDeleting(true)
    try {
      await requestApi.delete(request.id, auth.token)
      navigate('/requests')
    } catch {
      alert('Failed to cancel request. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[104px]">
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <Link to="/requests" className="text-[#4A6B50] dark:text-[#7A9A80] text-xs hover:text-[#07110A] dark:hover:text-white mb-6 inline-block">
            ← Back to Requests
          </Link>

          {loading && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">Loading…</p>}

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
                    {request.isSorted ? 'Sorted' : 'Pending'}
                  </Badge>
                  {!request.isSorted && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => { setEditing((v) => !v); setEditError('') }}
                        className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                      >
                        {editing ? 'Close Edit' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancel}
                        disabled={deleting}
                        className="border border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                      >
                        {deleting ? 'Cancelling…' : 'Cancel Request'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline edit panel */}
              {editing && (
                <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-6">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">Edit Request</p>

                  {/* Read-only vehicle info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">Make</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.vehicleMake}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">Model</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.model}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] uppercase tracking-widest mb-0.5">Year</p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{request.year}</p>
                    </div>
                    <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] sm:col-span-3 italic">Vehicle details are locked after submission</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Part Name *</Label>
                      <Input
                        value={editForm.partName}
                        onChange={(e) => setEditForm((f) => ({ ...f, partName: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Part Number</Label>
                      <Input
                        value={editForm.partNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, partNumber: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Condition Preference</Label>
                      <select
                        value={editForm.conditionPreference}
                        onChange={(e) => setEditForm((f) => ({ ...f, conditionPreference: Number(e.target.value) }))}
                        className={selectClass}
                      >
                        {conditionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Urgency</Label>
                      <select
                        value={editForm.urgency}
                        onChange={(e) => setEditForm((f) => ({ ...f, urgency: Number(e.target.value) }))}
                        className={selectClass}
                      >
                        {urgencyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Country</Label>
                      <Input
                        value={editForm.country}
                        onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Phone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Email</Label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">Description</Label>
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
                      {savingEdit ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Request details */}
              <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl p-6 mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-4">Request Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Detail label="Engine Type" value={request.engineType || '—'} />
                  <Detail label="Chassis / VIN" value={request.chassisNumber || '—'} />
                  <Detail label="Part Number" value={request.partNumber || '—'} />
                  <Detail label="Condition" value={conditionLabel[request.conditionPreference] ?? '—'} />
                  <Detail label="Country" value={request.country} />
                  <Detail label="Submitted" value={new Date(request.dateCreated).toLocaleDateString()} />
                </div>
                {request.description && (
                  <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-1">Description</p>
                    <p className="text-[#4A6B50] dark:text-[#C5DEC8] text-sm leading-relaxed">{request.description}</p>
                  </div>
                )}
              </div>

              {/* Order */}
              <div className="rounded-2xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                <div className="bg-[#E8F2EA] dark:bg-[#0D1810] px-6 py-3 border-b border-[rgba(0,200,83,0.12)]">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
                    Order {order ? `· ${order.trackingNumber ?? ''}` : ''}
                  </p>
                </div>

                {!order ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 grid place-items-center mx-auto mb-4">
                      <span className="text-amber-400 text-lg">⏳</span>
                    </div>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">Awaiting a match from our team</p>
                    <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-1">
                      Our team is searching for the best supplier for your request.
                    </p>
                  </div>
                ) : (
                  <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <Detail label="Part" value={order.part?.partName ?? '—'} />
                    <Detail label="Part #" value={order.part?.partNumber || '—'} />
                    <Detail label="Condition" value={order.part?.condition ?? '—'} />
                    <Detail label="Supplier" value={order.supplier?.businessName ?? '—'} />
                    <Detail label="Price" value={`$${order.price.toLocaleString()}`} />
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">Status</p>
                      <Badge className={cn('text-[10px]', statusBadgeClass(order.status))}>
                        {statusLabel(order.status)}
                      </Badge>
                    </div>
                    <Detail label="Tracking" value={order.trackingNumber || 'Not assigned'} />
                    <Detail label="Date" value={order.partRequest?.dateCreated ? new Date(order.partRequest.dateCreated).toLocaleDateString() : '—'} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
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
