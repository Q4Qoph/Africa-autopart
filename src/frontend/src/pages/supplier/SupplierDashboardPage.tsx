import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const statusLabel = ['Pending', 'Shipped', 'Delivered']
function statusBadge(status: number) {
  if (status === OrderStatus.Delivered) return 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]'
  if (status === OrderStatus.Shipped) return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
  return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
}

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
      .getAll(auth.token)
      .then(({ data }) => setOrders(data.filter((o) => o.supplierId === supplier.id)))
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

  // Add part
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
      setAddPartError('Failed to add part. Please try again.')
    } finally {
      setAddingPart(false)
    }
  }

  // Edit part
  function startEditPart(part: Supplier['parts'][number]) {
    setEditingPartId(part.id)
    setPartEditForm({
      partName: part.partName,
      partNumber: part.partNumber,
      condition: part.condition,
      description: '', // not returned in list response
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
      setPartEditError('Failed to save changes. Please try again.')
    } finally {
      setSavingPart(false)
    }
  }

  // Edit profile
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
      setProfileError('Failed to save profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Order edit
  function startEditOrder(order: Order) {
    setEditingOrderId(order.id)
    setOrderEdit({ status: order.status, trackingNumber: order.trackingNumber ?? '', saving: false, error: '' })
  }

  async function saveOrderEdit(order: Order) {
    if (!auth) return
    setOrderEdit((s) => ({ ...s, saving: true, error: '' }))
    try {
      await orderApi.update(
        order.id,
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
          o.id === order.id
            ? { ...o, status: orderEdit.status as OrderStatus, trackingNumber: orderEdit.trackingNumber }
            : o,
        ),
      )
      setEditingOrderId(null)
    } catch {
      setOrderEdit((s) => ({ ...s, saving: false, error: 'Failed to save. Please try again.' }))
    }
  }

  const parts = supplier?.parts ?? []

  // Reusable image upload handler
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
        setError('Image upload failed. Please try again.')
      } finally {
        setUploading(false)
        e.target.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#07110A]">
      {/* Top bar */}
      <header className="border-b border-[rgba(0,200,83,0.1)] bg-[#0D1810]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
              AA
            </div>
            <div>
              <span className="text-white font-bold text-sm">Africa Autopart</span>
              {supplier && (
                <span className="text-[#7A9A80] text-xs ml-2">— {supplier.businessName}</span>
              )}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="text-[#7A9A80] bg-transparent border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white text-sm h-9 px-4"
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-6">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
            <span className="block w-6 h-px bg-[#00C853]" />
            Supplier Portal
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            {loadingSupplier ? 'Dashboard' : supplier?.businessName ?? 'Dashboard'}
          </h1>
          {supplier && <p className="text-[#7A9A80] text-sm mt-0.5">{supplier.category}</p>}
        </div>

        {loadingSupplier && <p className="text-[#7A9A80] text-sm">Loading…</p>}
        {supplierError && !loadingSupplier && (
          <p className="text-red-400 text-sm">Failed to load your supplier profile.</p>
        )}

        {!loadingSupplier && !supplierError && (
          <>
            {/* Business info */}
            {supplier && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                  <InfoCard label="Business Email" value={supplier.email} />
                  <InfoCard label="Phone" value={supplier.phone} />
                  <InfoCard label="Status" value={
                    <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                      Active
                    </Badge>
                  } />
                </div>
                <div className="flex justify-end mb-6">
                  <Button
                    size="sm"
                    onClick={openEditProfile}
                    className="bg-transparent border border-[rgba(0,200,83,0.2)] text-[#00C853] hover:bg-[rgba(0,200,83,0.08)] h-8 text-xs px-3"
                  >
                    Edit Profile
                  </Button>
                </div>
              </>
            )}

            {/* Edit profile panel */}
            {editingProfile && supplier && (
              <div className="bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">Edit Business Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#E8F0E9] text-xs">Business Name *</Label>
                    <Input
                      value={profileForm.businessName}
                      onChange={(e) => setProfileForm((f) => ({ ...f, businessName: e.target.value }))}
                      className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#E8F0E9] text-xs">Category *</Label>
                    <select
                      value={profileForm.category}
                      onChange={(e) => setProfileForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg bg-[#0D1810] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#00C853] text-sm"
                    >
                      {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#E8F0E9] text-xs">Email *</Label>
                    <Input
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                      className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#E8F0E9] text-xs">Phone *</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[#E8F0E9] text-xs">Description</Label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-[#0D1810] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#00C853] text-sm resize-none"
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
                    {savingProfile ? 'Saving…' : 'Save Profile'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                    className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm"
                  >
                    Cancel
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
                    'px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                    activeTab === tab
                      ? 'border-[#00C853] text-[#00C853]'
                      : 'border-transparent text-[#7A9A80] hover:text-white',
                  )}
                >
                  {tab}
                  {tab === 'parts' && <span className="ml-1.5 text-xs text-[#3D5942]">({parts.length})</span>}
                  {tab === 'orders' && orders.length > 0 && (
                    <span className="ml-1.5 text-xs text-[#3D5942]">({orders.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── PARTS TAB ── */}
            {activeTab === 'parts' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#7A9A80] text-sm">{parts.length} part{parts.length !== 1 ? 's' : ''} in inventory</p>
                  <Button
                    onClick={() => { setShowAddPart((v) => !v); setAddPartError('') }}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-4 text-sm"
                  >
                    {showAddPart ? 'Cancel' : '+ Add Part'}
                  </Button>
                </div>

                {/* Add part form */}
                {showAddPart && (
                  <div className="bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">New Part</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Part Name *</Label>
                        <Input value={addForm.partName} onChange={(e) => setAddForm((f) => ({ ...f, partName: e.target.value }))}
                          placeholder="Front Brake Pad Set" className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Part Number</Label>
                        <Input value={addForm.partNumber} onChange={(e) => setAddForm((f) => ({ ...f, partNumber: e.target.value }))}
                          placeholder="04465-0K260" className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Condition *</Label>
                        <select value={addForm.condition} onChange={(e) => setAddForm((f) => ({ ...f, condition: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg bg-[#0D1810] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#00C853] text-sm">
                          {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Part Image</Label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="flex-1 h-9 px-3 rounded-lg bg-[#0D1810] border border-[rgba(255,255,255,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                            {uploadingImage ? (
                              <span className="text-[#7A9A80] text-xs">Uploading…</span>
                            ) : addForm.imageURL ? (
                              <>
                                <img src={addForm.imageURL} alt="preview" className="h-6 w-6 rounded object-cover shrink-0" />
                                <span className="text-white text-xs truncate">Image uploaded</span>
                              </>
                            ) : (
                              <span className="text-[#3D5942] text-xs">Click to upload image…</span>
                            )}
                          </div>
                          {addForm.imageURL && !uploadingImage && (
                            <button type="button" onClick={(e) => { e.preventDefault(); setAddForm((f) => ({ ...f, imageURL: '' })) }}
                              className="text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0">Remove</button>
                          )}
                          <input type="file" accept="image/*" className="sr-only" disabled={uploadingImage}
                            onChange={makeImageUploadHandler(setUploadingImage, setAddForm, setAddPartError)} />
                        </label>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Price (USD) *</Label>
                        <Input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                          placeholder="0" className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#E8F0E9] text-xs">Stock *</Label>
                        <Input type="number" value={addForm.stock} onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                          placeholder="0" className="bg-[#0D1810] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-[#E8F0E9] text-xs">Description</Label>
                        <textarea value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2} placeholder="Additional notes…"
                          className="w-full px-3 py-2 rounded-lg bg-[#0D1810] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:outline-none focus:border-[#00C853] text-sm resize-none" />
                      </div>
                    </div>
                    {addPartError && <p className="text-red-400 text-xs mt-3">{addPartError}</p>}
                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleAddPart} disabled={addingPart || uploadingImage || !addForm.partName || !addForm.price || !addForm.stock}
                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
                        {addingPart ? 'Adding…' : 'Add Part'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddPart(false)}
                        className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Parts table */}
                <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                  <div className="overflow-x-auto">
                    {parts.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#7A9A80] text-sm mb-1">No parts in your inventory yet.</p>
                        <p className="text-[#3D5942] text-xs">Click "+ Add Part" to list your first part.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                            <Th>Part Name</Th><Th>Part #</Th><Th>Condition</Th><Th>Price</Th><Th>Stock</Th><Th>Actions</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {parts.map((part) => (
                            <>
                              <tr key={part.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                <td className="px-5 py-3 text-white">{part.partName}</td>
                                <td className="px-5 py-3 text-[#7A9A80] font-mono text-xs">{part.partNumber || '—'}</td>
                                <td className="px-5 py-3">
                                  <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px]">
                                    {part.condition}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 text-[#C5DEC8]">${part.price.toLocaleString()}</td>
                                <td className="px-5 py-3 text-[#7A9A80]">{part.stock}</td>
                                <td className="px-5 py-3">
                                  <Button
                                    size="sm"
                                    onClick={() => editingPartId === part.id ? setEditingPartId(null) : startEditPart(part)}
                                    className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                  >
                                    {editingPartId === part.id ? 'Close' : 'Edit'}
                                  </Button>
                                </td>
                              </tr>

                              {/* Inline edit row */}
                              {editingPartId === part.id && (
                                <tr key={`edit-${part.id}`}>
                                  <td colSpan={6} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-5">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">Edit Part</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Part Name *</Label>
                                        <Input value={partEditForm.partName} onChange={(e) => setPartEditForm((f) => ({ ...f, partName: e.target.value }))}
                                          className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Part Number</Label>
                                        <Input value={partEditForm.partNumber} onChange={(e) => setPartEditForm((f) => ({ ...f, partNumber: e.target.value }))}
                                          className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Condition *</Label>
                                        <select value={partEditForm.condition} onChange={(e) => setPartEditForm((f) => ({ ...f, condition: e.target.value }))}
                                          className="w-full h-9 px-3 rounded-lg bg-[#111C14] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#00C853] text-sm">
                                          {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Part Image</Label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                          <div className="flex-1 h-9 px-3 rounded-lg bg-[#111C14] border border-[rgba(255,255,255,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                                            {uploadingEditImage ? (
                                              <span className="text-[#7A9A80] text-xs">Uploading…</span>
                                            ) : partEditForm.imageURL ? (
                                              <>
                                                <img src={partEditForm.imageURL} alt="preview" className="h-6 w-6 rounded object-cover shrink-0" />
                                                <span className="text-white text-xs truncate">Image uploaded</span>
                                              </>
                                            ) : (
                                              <span className="text-[#3D5942] text-xs">Click to upload image…</span>
                                            )}
                                          </div>
                                          {partEditForm.imageURL && !uploadingEditImage && (
                                            <button type="button" onClick={(e) => { e.preventDefault(); setPartEditForm((f) => ({ ...f, imageURL: '' })) }}
                                              className="text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0">Remove</button>
                                          )}
                                          <input type="file" accept="image/*" className="sr-only" disabled={uploadingEditImage}
                                            onChange={makeImageUploadHandler(setUploadingEditImage, setPartEditForm, setPartEditError)} />
                                        </label>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Price (USD) *</Label>
                                        <Input type="number" value={partEditForm.price} onChange={(e) => setPartEditForm((f) => ({ ...f, price: e.target.value }))}
                                          className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[#E8F0E9] text-xs">Stock *</Label>
                                        <Input type="number" value={partEditForm.stock} onChange={(e) => setPartEditForm((f) => ({ ...f, stock: e.target.value }))}
                                          className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white focus:border-[#00C853] h-9 text-sm" />
                                      </div>
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-[#E8F0E9] text-xs">Description</Label>
                                        <textarea value={partEditForm.description} onChange={(e) => setPartEditForm((f) => ({ ...f, description: e.target.value }))}
                                          rows={2}
                                          className="w-full px-3 py-2 rounded-lg bg-[#111C14] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#00C853] text-sm resize-none" />
                                      </div>
                                    </div>
                                    {partEditError && <p className="text-red-400 text-xs mt-3">{partEditError}</p>}
                                    <div className="flex gap-3 mt-4">
                                      <Button onClick={() => handleSavePart(part.id)}
                                        disabled={savingPart || uploadingEditImage || !partEditForm.partName || !partEditForm.price || !partEditForm.stock}
                                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
                                        {savingPart ? 'Saving…' : 'Save Changes'}
                                      </Button>
                                      <Button variant="outline" onClick={() => setEditingPartId(null)}
                                        className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm">
                                        Cancel
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
                {loadingOrders && <p className="text-[#7A9A80] text-sm">Loading orders…</p>}

                {!loadingOrders && (
                  <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#7A9A80] text-sm">No orders for your parts yet.</p>
                        <p className="text-[#3D5942] text-xs mt-1">Orders will appear here when the admin assigns your parts to customer requests.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                              <Th>#</Th><Th>Part</Th><Th>Request</Th><Th>Price</Th><Th>Tracking</Th><Th>Status</Th><Th>Actions</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <>
                                <tr key={order.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                  <td className="px-5 py-3 text-[#3D5942] font-mono text-xs">#{order.id}</td>
                                  <td className="px-5 py-3 text-white">{order.part?.partName ?? `Part #${order.partId}`}</td>
                                  <td className="px-5 py-3 text-[#7A9A80] font-mono text-xs">Req #{order.partRequestId}</td>
                                  <td className="px-5 py-3 text-[#00C853] font-semibold">${order.price.toLocaleString()}</td>
                                  <td className="px-5 py-3 font-mono text-xs">
                                    <span className={order.trackingNumber ? 'text-white' : 'text-[#3D5942]'}>
                                      {order.trackingNumber || '—'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Badge className={cn('text-[10px]', statusBadge(order.status))}>
                                      {statusLabel[order.status] ?? '—'}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Button
                                      size="sm"
                                      onClick={() => editingOrderId === order.id ? setEditingOrderId(null) : startEditOrder(order)}
                                      className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                    >
                                      {editingOrderId === order.id ? 'Close' : 'Update'}
                                    </Button>
                                  </td>
                                </tr>
                                {editingOrderId === order.id && (
                                  <tr key={`edit-${order.id}`}>
                                    <td colSpan={7} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-4">
                                      <div className="flex items-end gap-4 flex-wrap">
                                        <div className="space-y-1">
                                          <p className="text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">Status</p>
                                          <select
                                            value={orderEdit.status}
                                            onChange={(e) => setOrderEdit((s) => ({ ...s, status: Number(e.target.value) }))}
                                            className="h-9 px-3 rounded-lg bg-[#111C14] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#00C853] text-sm"
                                          >
                                            <option value={OrderStatus.Pending}>Pending</option>
                                            <option value={OrderStatus.Shipped}>Shipped</option>
                                            <option value={OrderStatus.Delivered}>Delivered</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">Tracking Number</p>
                                          <Input
                                            value={orderEdit.trackingNumber}
                                            onChange={(e) => setOrderEdit((s) => ({ ...s, trackingNumber: e.target.value }))}
                                            placeholder="e.g. TRK-00123"
                                            className="bg-[#111C14] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 w-44"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => saveOrderEdit(order)}
                                          disabled={orderEdit.saving}
                                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                                        >
                                          {orderEdit.saving ? 'Saving…' : 'Save'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingOrderId(null)}
                                          className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm"
                                        >
                                          Cancel
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
    <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#7A9A80]">
      {children}
    </th>
  )
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-[#111C14] rounded-xl border border-[rgba(0,200,83,0.1)] px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#7A9A80] mb-1">{label}</p>
      <div className="text-white text-sm">{value}</div>
    </div>
  )
}
