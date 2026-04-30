// src/frontend/src/pages/shop/ShopPage.tsx

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { advertisementApi, type Advertisement } from '@/api/advertisementApi'

export default function ShopPage() {
  const { t } = useTranslation('shop')
  const [adverts, setAdverts] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    advertisementApi.getAllAdverts()
      .then(({ data }) => setAdverts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Hover state for cards (optional, but we can just keep buttons visible on hover via CSS group)
  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9] overflow-x-hidden">
      <Navbar />

      {/* Header */}
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

      {/* Content */}
      <section className="py-10">
        <div className="max-w-[1260px] mx-auto px-6">

          {loading && (
            <div className="flex justify-center py-20">
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
            </div>
          )}

          {error && (
            <div className="flex justify-center py-20">
              <p className="text-red-400 text-sm">{t('error_load')}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {adverts.length === 0 ? (
                <div className="flex justify-center py-20">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('no_parts')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {adverts.map((ad) => (
                    <PartCard key={ad.id} advert={ad} t={t} />
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

// ─── Single part card ────────────────────────────────────────────────────────
// ─── Single part card ────────────────────────────────────────────────────────

function PartCard({ advert, t }: { advert: Advertisement; t: (key: string) => string }) {
  const [imageError, setImageError] = useState(false)
  const hasImage = advert.imageURL && !imageError

  const price = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(advert.price)

  return (
    <div className="group relative bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:border-[rgba(0,200,83,0.3)] transition-colors flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">

      {/* Image area – no overlay at all */}
      <div className="aspect-square bg-[#EFF7F1] dark:bg-[#162019] overflow-hidden relative">
        {hasImage ? (
          <img
            src={advert.imageURL}
            alt={advert.partName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Make & Model */}
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#7A9A80]">
          <span>{advert.vehicleMake}</span>
          <span className="text-[#00C853]">—</span>
          <span>{advert.vehicleModel}</span>
        </div>

        {/* Part name */}
        <h3 className="text-[#07110A] dark:text-white text-sm font-semibold leading-snug line-clamp-2">
          {advert.partName}
        </h3>

        {/* Supplier */}
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs mt-1 line-clamp-1">
          {advert.supplierName}
        </p>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] flex items-end justify-between">
          <span className="text-[#00C853] font-extrabold text-sm">{price}</span>
        </div>
      </div>

      {/* Hover actions – slide up from the bottom, no background on image */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pt-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        <div className="flex flex-col gap-2">
          <button
            className="w-full flex items-center justify-center gap-2 bg-[#00C853] text-[#07110A] font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#39FF88] transition-colors"
            onClick={(e) => e.preventDefault()}
            title={t('add_to_cart')}
          >
            <ShoppingCart className="w-4 h-4" />
            {t('add_to_cart')}
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-[#222] text-[#07110A] dark:text-white font-semibold text-xs px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
            onClick={(e) => e.preventDefault()}
            title={t('add_to_wishlist')}
          >
            <Heart className="w-4 h-4" />
            {t('add_to_wishlist')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Image placeholder – shown when image is missing or fails to load ──────

function PlaceholderImage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-[#B0C7B7] dark:text-[#4A6B50]">
      {/* Simple car-part-related SVG icon */}
      <svg
        className="w-12 h-12 mb-2 opacity-50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.75h4.5l2.25 6h6.75v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-9h6.75l-2.25-6Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.75L8.25 9h7.5l-1.5-5.25"
        />
      </svg>
      <span className="text-xs font-mono uppercase tracking-wider">No Image</span>
    </div>
  )
}