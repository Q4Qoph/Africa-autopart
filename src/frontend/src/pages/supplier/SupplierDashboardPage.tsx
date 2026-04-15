import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { supplierApi } from '@/api/supplierApi'
import { orderApi } from '@/api/orderApi'
import { imageApi } from '@/api/imageApi'
import type { Supplier } from '@/types/supplier'
import type { Order } from '@/types/order'
import { OrderStatus } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function statusBadge(status: number) {
  if (status === OrderStatus.Delivered) return 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
  if (status === OrderStatus.Shipped) return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
  return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
}

// These are API values stored in the database — not translated
const conditionOptions = ['New', 'OEM', 'Aftermarket', 'Second Hand', 'Refurbished']
const categoryOptions = [
  'Brakes & Suspension',
  'Engine & Drivetrain',
  'Electrical & Lighting',
  'Body & Exterior',
  'Interior & Accessories',
  'Tyres & Wheels',
  'Cooling & Exhaust',
  'Transmission',
  'General / Multi-category',
]

interface AddPartForm {
  partName: string
  partNumber: string
  condition: string
  description: string
  imageURL: string
  price: string
  stock: string
}

const emptyForm: AddPartForm = {
  partName: '', partNumber: '', condition: 'New',
  description: '', imageURL: '', price: '', stock: '',
}

interface OrderEdit {
  status: number
  trackingNumber: string
  saving: boolean
  error: string
}

interface ProfileForm {
  businessName: string
  category: string
  description: string
  email: string
  phone: string
}

export default function SupplierDashboardPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const [activeTab, setActiveTab] = useState<'parts' | 'orders'>('parts')

  // Supplier data
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loadingSupplier, setLoadingSupplier] = useState(true)
  const [supplierError, setSupplierError] = useState(false)

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [orderEdit, setOrderEdit] = useState<OrderEdit>({ status: 0, trackingNumber: '', saving: false, error: '' })

  // Add part form
  const [showAddPart, setShowAddPart] = useState(false)
  const [addForm, setAddForm] = useState<AddPartForm>(emptyForm)
  const [addingPart, setAddingPart] = useState(false)
  const [addPartError, setAddPartError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Edit part
  const [editingPartId, setEditingPartId] = useState<number | null>(null)
  const [partEditForm, setPartEditForm] = useState<AddPartForm>(emptyForm)
  const [uploadingEditImage, setUploadingEditImage] = useState(false)
  const [savingPart, setSavingPart] = useState(false)
  const [partEditError, setPartEditError] = useState('')

  // Edit profile
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>({ businessName: '', category: '', description: '', email: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const orderStatusLabel: Record<number, string> = {
    [OrderStatus.Pending]: t('supplier_order_status_pending'),
    [OrderStatus.Shipped]: t('supplier_order_status_shipped'),
    [OrderStatus.Delivered]: t('supplier_order_status_delivered'),
  }

  const tabLabel: Record<string, string> = {
    parts: t('supplier_tab_parts'),
    orders: t('supplier_tab_orders'),
  }

  useEffect(() => {
    if (!auth) return
    supplierApi
      .myProducts(auth.userId, auth.token)
      .then(({ data }) => setSupplier(data[0] ?? null))
      .catch(() => setSupplierError(true))
      .finally(() => setLoadingSupplier(false))
  }, [auth])

  useEffect(() => {
    if (!auth || !supplier || activeTab !== 'orders') return
    setLoadingOrders(true)
    orderApi
      .getBySupplierId(supplier.id, auth.token)
      .then(({ data }) => setOrders(Array.isArray(data) ? data : [data]))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [auth, supplier, activeTab])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function refreshSupplier() {
    if (!auth) return
    const { data } = await supplierApi.myProducts(auth.userId, auth.token)
    setSupplier(data[0] ?? null)
  }

  async function handleAddPart() {
    if (!auth || !supplier) return
    setAddPartError('')
    setAddingPart(true)
    try {
      await supplierApi.addPart(
        {
          supplierId: supplier.id,
          partName: addForm.partName,
          partNumber: addForm.partNumber,
          condition: addForm.condition,
          description: addForm.description,
          imageURL: addForm.imageURL,
          price: Number(addForm.price),
          stock: Number(addForm.stock),
        },
        auth.token,
      )
      await refreshSupplier()
      setAddForm(emptyForm)
      setShowAddPart(false)
    } catch {
      setAddPartError(t('supplier_add_error'))
    } finally {
      setAddingPart(false)
    }
  }

  function startEditPart(part: Supplier['parts'][number]) {
    setEditingPartId(part.id)
    setPartEditForm({
      partName: part.partName,
      partNumber: part.partNumber,
      condition: part.condition,
      description: '',
      imageURL: part.imageURL ?? '',
      price: String(part.price),
      stock: String(part.stock),
    })
    setPartEditError('')
  }

  async function handleSavePart(partId: number) {
    if (!auth) return
    setPartEditError('')
    setSavingPart(true)
    try {
      await supplierApi.updatePart(
        partId,
        {
          partName: partEditForm.partName,
          partNumber: partEditForm.partNumber,
          condition: partEditForm.condition,
          description: partEditForm.description,
          imageURL: partEditForm.imageURL,
          price: Number(partEditForm.price),
          stock: Number(partEditForm.stock),
        },
        auth.token,
      )
      await refreshSupplier()
      setEditingPartId(null)
    } catch {
      setPartEditError(t('supplier_save_part_error'))
    } finally {
      setSavingPart(false)
    }
  }

  function openEditProfile() {
    if (!supplier) return
    setProfileForm({
      businessName: supplier.businessName,
      category: supplier.category,
      description: supplier.description,
      email: supplier.email,
      phone: supplier.phone,
    })
    setProfileError('')
    setEditingProfile(true)
  }

  async function handleSaveProfile() {
    if (!auth || !supplier) return
    setProfileError('')
    setSavingProfile(true)
    try {
      await supplierApi.update(supplier.id, profileForm, auth.token)
      setSupplier((prev) => prev ? { ...prev, ...profileForm } : prev)
      setEditingProfile(false)
    } catch {
      setProfileError(t('supplier_profile_error'))
    } finally {
      setSavingProfile(false)
    }
  }

  function startEditOrder(order: Order) {
    setEditingOrderId(order.orderId)
    setOrderEdit({ status: order.status, trackingNumber: order.trackingNumber ?? '', saving: false, error: '' })
  }

  async function saveOrderEdit(order: Order) {
    if (!auth) return
    setOrderEdit((s) => ({ ...s, saving: true, error: '' }))
    try {
      await orderApi.update(
        order.orderId,
        {
          supplierId: order.supplierId,
          partId: order.partId,
          partRequestId: order.partRequestId,
          price: order.price,
          status: orderEdit.status,
          trackingNumber: orderEdit.trackingNumber,
        },
        auth.token,
      )
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId
            ? { ...o, status: orderEdit.status, trackingNumber: orderEdit.trackingNumber }
            : o,
        ),
      )
      setEditingOrderId(null)
    } catch {
      setOrderEdit((s) => ({ ...s, saving: false, error: t('supplier_order_save_error') }))
    }
  }

  const parts = supplier?.parts ?? []

  function makeImageUploadHandler(
    setUploading: (v: boolean) => void,
    setForm: (fn: (f: AddPartForm) => AddPartForm) => void,
    setError: (e: string) => void,
  ) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      setError('')
      try {
        const { data: url } = await imageApi.upload(file)
        setForm((f) => ({ ...f, imageURL: url }))
      } catch {
        setError(t('supplier_add_error'))
      } finally {
        setUploading(false)
        e.target.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
      {/* Top bar */}
      <header className="border-b border-[rgba(0,200,83,0.1)] bg-[#E8F2EA] dark:bg-[#0D1810]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Africa Autopart" className="w-36 h-auto" />
            {supplier && (
              <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs border-l border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] pl-3">
                {supplier.businessName}
              </span>
            )}
          </div>
          <Button
            onClick={handleLogout}
            className="text-[#4A6B50] dark:text-[#7A9A80] bg-transparent border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#07110A] dark:hover:text-white text-sm h-9 px-4"
          >
            {t('supplier_sign_out')}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-6">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
            <span className="block w-6 h-px bg-[#00C853]" />
            {t('supplier_portal_label')}
          </p>
          <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">
            {loadingSupplier ? t('supplier_dashboard') : supplier?.businessName ?? t('supplier_dashboard')}
          </h1>
          {supplier && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-0.5">{supplier.category}</p>}
        </div>

        {loadingSupplier && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('supplier_saving')}</p>}
        {supplierError && !loadingSupplier && (
          <p className="text-red-400 text-sm">{t('supplier_error_profile')}</p>
        )}

        {!loadingSupplier && !supplierError && (
          <>
            {/* Business info */}
            {supplier && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                  <InfoCard label={t('supplier_info_email')} value={supplier.email} />
                  <InfoCard label={t('supplier_field_phone')} value={supplier.phone} />
                  <InfoCard label={t('supplier_info_status')} value={
                    <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                      {t('supplier_status_active')}
                    </Badge>
                  } />
                </div>
                <div className="flex justify-end mb-6">
                  <Button
                    size="sm"
                    onClick={openEditProfile}
                    className="bg-transparent border border-[rgba(0,200,83,0.2)] text-[#00C853] hover:bg-[rgba(0,200,83,0.08)] h-8 text-xs px-3"
                  >
                    {t('supplier_profile_edit')}
                  </Button>
                </div>
              </>
            )}

            {/* Edit profile panel */}
            {editingProfile && supplier && (
              <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">{t('supplier_edit_profile_heading')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_businessName')}</Label>
                    <Input
                      value={profileForm.businessName}
                      onChange={(e) => setProfileForm((f) => ({ ...f, businessName: e.target.value }))}
                      className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_category')}</Label>
                    <select
                      value={profileForm.category}
                      onChange={(e) => setProfileForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm"
                    >
                      {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_email')}</Label>
                    <Input
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                      className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_phone')}</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_description_profile')}</Label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm resize-none"
                    />
                  </div>
                </div>
                {profileError && <p className="text-red-400 text-xs mt-3">{profileError}</p>}
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profileForm.businessName}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm"
                  >
                    {savingProfile ? t('supplier_profile_saving') : t('supplier_profile_save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                    className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                  >
                    {t('supplier_profile_cancel')}
                  </Button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[rgba(0,200,83,0.1)]">
              {(['parts', 'orders'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab
                      ? 'border-[#00C853] text-[#00C853]'
                      : 'border-transparent text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#07110A] dark:hover:text-white',
                  )}
                >
                  {tabLabel[tab]}
                  {tab === 'parts' && <span className="ml-1.5 text-xs text-[#7A9A80] dark:text-[#3D5942]">({parts.length})</span>}
                  {tab === 'orders' && orders.length > 0 && (
                    <span className="ml-1.5 text-xs text-[#7A9A80] dark:text-[#3D5942]">({orders.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── PARTS TAB ── */}
            {activeTab === 'parts' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('supplier_parts_count', { count: parts.length })}</p>
                  <Button
                    onClick={() => { setShowAddPart((v) => !v); setAddPartError('') }}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-4 text-sm"
                  >
                    {showAddPart ? t('supplier_cancel') : t('supplier_add_part')}
                  </Button>
                </div>

                {/* Add part form */}
                {showAddPart && (
                  <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">{t('supplier_new_part_label')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_partName')}</Label>
                        <Input value={addForm.partName} onChange={(e) => setAddForm((f) => ({ ...f, partName: e.target.value }))}
                          placeholder="Front Brake Pad Set" className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_partNumber')}</Label>
                        <Input value={addForm.partNumber} onChange={(e) => setAddForm((f) => ({ ...f, partNumber: e.target.value }))}
                          placeholder="04465-0K260" className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_condition')}</Label>
                        <select value={addForm.condition} onChange={(e) => setAddForm((f) => ({ ...f, condition: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm">
                          {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_image_label')}</Label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="flex-1 h-9 px-3 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                            {uploadingImage ? (
                              <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{t('supplier_uploading')}</span>
                            ) : addForm.imageURL ? (
                              <>
                                <img src={addForm.imageURL} alt="preview" className="h-6 w-6 rounded object-cover shrink-0" />
                                <span className="text-[#07110A] dark:text-white text-xs truncate">{t('supplier_image_uploaded')}</span>
                              </>
                            ) : (
                              <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">{t('supplier_image_placeholder')}</span>
                            )}
                          </div>
                          {addForm.imageURL && !uploadingImage && (
                            <button type="button" onClick={(e) => { e.preventDefault(); setAddForm((f) => ({ ...f, imageURL: '' })) }}
                              className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0">{t('supplier_image_remove')}</button>
                          )}
                          <input type="file" accept="image/*" className="sr-only" disabled={uploadingImage}
                            onChange={makeImageUploadHandler(setUploadingImage, setAddForm, setAddPartError)} />
                        </label>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_price')}</Label>
                        <Input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                          placeholder="0" className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_stock')}</Label>
                        <Input type="number" value={addForm.stock} onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                          placeholder="0" className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_description')}</Label>
                        <textarea value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2} placeholder="Additional notes…"
                          className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:outline-none focus:border-[#00C853] text-sm resize-none" />
                      </div>
                    </div>
                    {addPartError && <p className="text-red-400 text-xs mt-3">{addPartError}</p>}
                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleAddPart} disabled={addingPart || uploadingImage || !addForm.partName || !addForm.price || !addForm.stock}
                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
                        {addingPart ? t('supplier_adding') : t('supplier_add_part')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddPart(false)}
                        className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm">
                        {t('supplier_cancel')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Parts table */}
                <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                  <div className="overflow-x-auto">
                    {parts.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-1">{t('supplier_no_parts')}</p>
                        <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs">{t('supplier_no_parts_hint')}</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                            <Th>{t('supplier_col_part_name')}</Th>
                            <Th>{t('supplier_col_part_number')}</Th>
                            <Th>{t('supplier_col_condition')}</Th>
                            <Th>{t('supplier_col_price')}</Th>
                            <Th>{t('supplier_col_stock')}</Th>
                            <Th>{t('supplier_col_actions')}</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {parts.map((part) => (
                            <>
                              <tr key={part.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                <td className="px-5 py-3 text-[#07110A] dark:text-white">{part.partName}</td>
                                <td className="px-5 py-3 text-[#4A6B50] dark:text-[#7A9A80] font-mono text-xs">{part.partNumber || '—'}</td>
                                <td className="px-5 py-3">
                                  <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px]">
                                    {part.condition}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 text-[#4A6B50] dark:text-[#C5DEC8]">${part.price.toLocaleString()}</td>
                                <td className="px-5 py-3 text-[#4A6B50] dark:text-[#7A9A80]">{part.stock}</td>
                                <td className="px-5 py-3">
                                  <Button
                                    size="sm"
                                    onClick={() => editingPartId === part.id ? setEditingPartId(null) : startEditPart(part)}
                                    className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                  >
                                    {editingPartId === part.id ? t('supplier_close') : t('supplier_edit_part')}
                                  </Button>
                                </td>
                              </tr>

                              {/* Inline edit row */}
                              {editingPartId === part.id && (
                                <tr key={`edit-${part.id}`}>
                                  <td colSpan={6} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-5">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">{t('supplier_edit_part_label')}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_partName')}</Label>
                                        <Input value={partEditForm.partName} onChange={(e) => setPartEditForm((f) => ({ ...f, partName: e.target.value }))}
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_partNumber')}</Label>
                                        <Input value={partEditForm.partNumber} onChange={(e) => setPartEditForm((f) => ({ ...f, partNumber: e.target.value }))}
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_condition')}</Label>
                                        <select value={partEditForm.condition} onChange={(e) => setPartEditForm((f) => ({ ...f, condition: e.target.value }))}
                                          className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm">
                                          {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_image_label')}</Label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                          <div className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                                            {uploadingEditImage ? (
                                              <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{t('supplier_uploading')}</span>
                                            ) : partEditForm.imageURL ? (
                                              <>
                                                <img src={partEditForm.imageURL} alt="preview" className="h-6 w-6 rounded object-cover shrink-0" />
                                                <span className="text-[#07110A] dark:text-white text-xs truncate">{t('supplier_image_uploaded')}</span>
                                              </>
                                            ) : (
                                              <span className="text-[#7A9A80] dark:text-[#3D5942] text-xs">{t('supplier_image_placeholder')}</span>
                                            )}
                                          </div>
                                          {partEditForm.imageURL && !uploadingEditImage && (
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPartEditForm((f) => ({ ...f, imageURL: '' })) }}
                                              className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0">{t('supplier_image_remove')}</button>
                                          )}
                                          <input type="file" accept="image/*" className="sr-only" disabled={uploadingEditImage}
                                            onChange={makeImageUploadHandler(setUploadingEditImage, setPartEditForm, setPartEditError)} />
                                        </label>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_price')}</Label>
                                        <Input type="number" value={partEditForm.price} onChange={(e) => setPartEditForm((f) => ({ ...f, price: e.target.value }))}
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_stock')}</Label>
                                        <Input type="number" value={partEditForm.stock} onChange={(e) => setPartEditForm((f) => ({ ...f, stock: e.target.value }))}
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-[#07110A] dark:text-[#E8F0E9] text-xs">{t('supplier_field_description')}</Label>
                                        <textarea value={partEditForm.description} onChange={(e) => setPartEditForm((f) => ({ ...f, description: e.target.value }))}
                                          rows={2}
                                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm resize-none" />
                                      </div>
                                    </div>
                                    {partEditError && <p className="text-red-400 text-xs mt-3">{partEditError}</p>}
                                    <div className="flex gap-3 mt-4">
                                      <Button onClick={() => handleSavePart(part.id)}
                                        disabled={savingPart || uploadingEditImage || !partEditForm.partName || !partEditForm.price || !partEditForm.stock}
                                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
                                        {savingPart ? t('supplier_saving') : t('supplier_save_changes')}
                                      </Button>
                                      <Button variant="outline" onClick={() => setEditingPartId(null)}
                                        className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm">
                                        {t('supplier_cancel')}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <>
                {loadingOrders && <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('supplier_loading_orders')}</p>}

                {!loadingOrders && (
                  <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('supplier_no_orders')}</p>
                        <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-1">{t('supplier_no_orders_hint')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                              <Th>#</Th>
                              <Th>{t('supplier_col_part_name')}</Th>
                              <Th>{t('supplier_col_vehicle')}</Th>
                              <Th>{t('supplier_col_price')}</Th>
                              <Th>{t('supplier_col_tracking')}</Th>
                              <Th>{t('supplier_col_status')}</Th>
                              <Th>{t('supplier_col_actions')}</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <>
                                <tr key={order.orderId} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                  <td className="px-5 py-3 text-[#7A9A80] dark:text-[#3D5942] font-mono text-xs">#{order.orderId}</td>
                                  <td className="px-5 py-3 text-[#07110A] dark:text-white">{order.part?.partName ?? '—'}</td>
                                  <td className="px-5 py-3 text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                                    {order.partRequest?.vehicleMake} {order.partRequest?.model}
                                  </td>
                                  <td className="px-5 py-3 text-[#00C853] font-semibold">${order.price.toLocaleString()}</td>
                                  <td className="px-5 py-3 font-mono text-xs">
                                    <span className={order.trackingNumber ? 'text-[#07110A] dark:text-white' : 'text-[#7A9A80] dark:text-[#3D5942]'}>
                                      {order.trackingNumber || '—'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Badge className={cn('text-[10px]', statusBadge(order.status))}>
                                      {orderStatusLabel[order.status] ?? String(order.status)}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Button
                                      size="sm"
                                      onClick={() => editingOrderId === order.orderId ? setEditingOrderId(null) : startEditOrder(order)}
                                      className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                    >
                                      {editingOrderId === order.orderId ? t('supplier_close') : t('supplier_update_order')}
                                    </Button>
                                  </td>
                                </tr>
                                {editingOrderId === order.orderId && (
                                  <tr key={`edit-${order.orderId}`}>
                                    <td colSpan={7} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-4">
                                      <div className="flex items-end gap-4 flex-wrap">
                                        <div className="space-y-1">
                                          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">{t('supplier_order_status')}</p>
                                          <select
                                            value={orderEdit.status}
                                            onChange={(e) => setOrderEdit((s) => ({ ...s, status: Number(e.target.value) }))}
                                            className="h-9 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm"
                                          >
                                            <option value={OrderStatus.Pending}>{t('supplier_order_status_pending')}</option>
                                            <option value={OrderStatus.Shipped}>{t('supplier_order_status_shipped')}</option>
                                            <option value={OrderStatus.Delivered}>{t('supplier_order_status_delivered')}</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">{t('supplier_order_tracking')}</p>
                                          <Input
                                            value={orderEdit.trackingNumber}
                                            onChange={(e) => setOrderEdit((s) => ({ ...s, trackingNumber: e.target.value }))}
                                            placeholder="e.g. TRK-00123"
                                            className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 w-44"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => saveOrderEdit(order)}
                                          disabled={orderEdit.saving}
                                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                                        >
                                          {orderEdit.saving ? t('supplier_saving') : t('supplier_save_order')}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingOrderId(null)}
                                          className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                                        >
                                          {t('supplier_cancel')}
                                        </Button>
                                      </div>
                                      {orderEdit.error && <p className="text-red-400 text-xs mt-2">{orderEdit.error}</p>}
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
      {children}
    </th>
  )
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111C14] rounded-xl border border-[rgba(0,200,83,0.1)] px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-1">{label}</p>
      <div className="text-[#07110A] dark:text-white text-sm">{value}</div>
    </div>
  )
}
