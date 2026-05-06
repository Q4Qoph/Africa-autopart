import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { supplierApi } from '@/api/supplierApi'
import type { Supplier } from '@/types/supplier'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const categoryOptions = [
  "Brakes & Suspension", "Engine & Drivetrain", "Electrical & Lighting",
  "Body & Exterior", "Interior & Accessories", "Tyres & Wheels",
  "Cooling & Exhaust", "Transmission", "General / Multi-category",
]

interface ProfileForm {
  businessName: string; category: string; description: string; email: string; phone: string
}

interface Props {
  supplier: Supplier
  onClose: () => void
  onSaved: (supplier: Supplier) => void
}

export function EditProfilePanel({ supplier, onClose, onSaved }: Props) {
  const { auth } = useAuth()
  const { t } = useTranslation('dashboard')
  const [form, setForm] = useState<ProfileForm>({
    businessName: supplier.businessName,
    category: supplier.category,
    description: supplier.description,
    email: supplier.email,
    phone: supplier.phone,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!auth) return
    setError('')
    setSaving(true)
    try {
      await supplierApi.update(supplier.id, form, auth.token)
      onSaved({ ...supplier, ...form })
      onClose()
    } catch {
      setError(t('supplier_profile_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-6">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">
        {t('supplier_edit_profile_heading')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">{t('supplier_field_businessName')}</Label>
          <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
            className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t('supplier_field_category')}</Label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full h-9 px-3 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-sm">
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t('supplier_field_email')}</Label>
          <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t('supplier_field_phone')}</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] h-9 text-sm" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">{t('supplier_field_description_profile')}</Label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-sm resize-none" />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <Button onClick={handleSave} disabled={saving || !form.businessName}
          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
          {saving ? t('supplier_profile_saving') : t('supplier_profile_save')}
        </Button>
        <Button variant="outline" onClick={onClose}
          className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] h-9 px-4 text-sm">
          {t('supplier_profile_cancel')}
        </Button>
      </div>
    </div>
  )
}