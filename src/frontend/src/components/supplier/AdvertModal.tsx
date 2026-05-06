import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { advertisementApi } from '@/api/advertisementApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  partName: string
  price: number
  supplierName: string
  imageURL: string
  partDescription?: string
  onClose: () => void
}

export function AdvertModal({ open, partName, price, supplierName, imageURL, partDescription, onClose }: Props) {
  const { t } = useTranslation('dashboard')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [description, setDescription] = useState(partDescription ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleSubmit() {
    if (!vehicleMake.trim() || !vehicleModel.trim()) {
      setError("Vehicle make and model are required.")
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await advertisementApi.addAdvert({
        partName, description: description || partDescription || '',
        vehicleMake: vehicleMake.trim(), vehicleModel: vehicleModel.trim(),
        price, supplierName, imageURL,
      })
      onClose()
    } catch {
      setError("Failed to publish. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111C14] rounded-2xl border border-[rgba(0,200,83,0.2)] w-full max-w-md mx-4 p-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">{t('supplier_advertise_title')}</p>
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div>
            <span className="text-xs block text-[#4A6B50]">{t('supplier_field_partName')}</span>
            <span className="text-[#07110A] dark:text-white">{partName}</span>
          </div>
          <div>
            <span className="text-xs block text-[#4A6B50]">{t('supplier_col_price')}</span>
            <span className="text-[#00C853] font-semibold">${price.toLocaleString()}</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs block text-[#4A6B50]">{t('supplier_info_email')}</span>
            <span className="text-[#07110A] dark:text-white">{supplierName}</span>
          </div>
          {imageURL && (
            <div className="col-span-2 flex items-center gap-2">
              <img src={imageURL} alt="Part" className="w-10 h-10 rounded object-cover border" />
              <span className="text-xs text-[#4A6B50]">{t('supplier_image_uploaded')}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">{t('supplier_advert_vehicleMake')}</Label>
            <Input value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g. Toyota"
              className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] focus:border-[#00C853] h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t('supplier_advert_vehicleModel')}</Label>
            <Input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Hilux"
              className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] focus:border-[#00C853] h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t('supplier_field_description')}</Label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] text-sm resize-none" />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}
            className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] h-9 px-4 text-sm">{t('supplier_cancel')}</Button>
          <Button onClick={handleSubmit} disabled={submitting || !vehicleMake.trim() || !vehicleModel.trim()}
            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm">
            {submitting ? t('supplier_publishing') : t('supplier_publish_btn')}
          </Button>
        </div>
      </div>
    </div>
  )
}