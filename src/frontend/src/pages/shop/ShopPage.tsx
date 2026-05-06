import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { inventoryApi } from '@/api/inventoryApi'
import type { InventoryItem } from '@/types/inventory'
import { useCart } from '@/context/CartContext'

export default function ShopPage() {
  const { t } = useTranslation('shop')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    inventoryApi.getAllAdverts()
      .then(({ data }) => setInventory(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9] overflow-x-hidden">
      <Navbar />

      <section className="pt-[68px] md:pt-[132px] pb-8 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6 pb-4">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
            <span className="block w-6 h-px bg-[#00C853]" />
            {t('shop_label')}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#07110A] dark:text-white">
            {t('shop_heading')}
          </h1>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-2">
            {t('shop_subtext')}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-[1260px] mx-auto px-6">
          {loading && <p className="text-center">{t('loading')}</p>}
          {error && <p className="text-center text-red-400">{t('error_load')}</p>}
          {!loading && !error && (
            <>
              {inventory.length === 0 ? (
                <p className="text-center">{t('no_parts')}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {inventory.map((item) => (
                    <PartCard key={item.id} item={item} t={t} onAddToCart={addItem} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

// Reuse the same card design but adapted to InventoryItem
function PartCard({ item, t, onAddToCart }: { item: InventoryItem; t: (key: string) => string; onAddToCart: (id: number, qty: number) => void }) {
  const [imageError, setImageError] = useState(false)
  const hasImage = item.imageURL && !imageError

  const price = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(item.price)

  return (
    <div className="group relative bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:border-[rgba(0,200,83,0.3)] transition-colors flex flex-col">
      <div className="aspect-square bg-[#EFF7F1] dark:bg-[#162019] overflow-hidden relative">
        {hasImage ? (
          <img src={item.imageURL} alt={item.partName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImageError(true)} />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#7A9A80]">
          <span>{item.vehicleMake}</span>
          <span className="text-[#00C853]">—</span>
          <span>{item.vehicleModel}</span>
        </div>
        <h3 className="text-[#07110A] dark:text-white text-sm font-semibold line-clamp-2">{item.partName}</h3>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{item.supplierName}</p>
        <div className="mt-auto pt-2 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] flex items-end justify-between">
          <span className="text-[#00C853] font-extrabold text-sm">{price}</span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pt-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        <div className="flex flex-col gap-2">
          <button
            className="w-full flex items-center justify-center gap-2 bg-[#00C853] text-[#07110A] font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#39FF88] transition-colors"
            onClick={() => onAddToCart(item.id, 1)}
          >
            <ShoppingCart className="w-4 h-4" />
            {t('add_to_cart')}
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#222] text-[#07110A] dark:text-white font-semibold text-xs px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
            <Heart className="w-4 h-4" />
            {t('add_to_wishlist')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlaceholderImage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-[#B0C7B7] dark:text-[#4A6B50]">
      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75h4.5l2.25 6h6.75v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-9h6.75l-2.25-6Z" />
      </svg>
      <span className="text-xs font-mono uppercase tracking-wider">No Image</span>
    </div>
  )
}