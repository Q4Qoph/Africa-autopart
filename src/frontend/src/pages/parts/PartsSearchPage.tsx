// src/pages/PartsSearchPage.tsx
import { useEffect, useState, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { partsApi } from '@/api/partsApi'
import type { VinResult, CategoryGroup, SearchPart } from '@/types/parts'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useExternalCart } from '@/context/ExternalCartContext';

export default function PartsSearchPage() {
  const location = useLocation()
  const { t } = useTranslation('home')
  const vehicleInfo = location.state?.vehicleInfo as VinResult | undefined

  const [results, setResults] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('')

  // Refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!vehicleInfo) {
      setLoading(false)
      setError('No vehicle information provided.')
      return
    }
      sessionStorage.setItem('vinVehicleInfo', JSON.stringify(vehicleInfo));
      
    const payload = {
      manufacturer: vehicleInfo.manufacturer || '',
      year: String(vehicleInfo.year ?? ''),
      engine: vehicleInfo.engine || '',
      model: vehicleInfo.model || '',
      class: vehicleInfo.class || '',
      make: vehicleInfo.make || '',
    }

    partsApi
      .searchParts(payload)
      .then(({ data }) => {
        setResults(data)
        if (data.length > 0) {
          setActiveCategory(data[0].category)
        }
      })
      .catch(() => setError(t('vin_error_invalid') ?? 'Failed to load parts'))
      .finally(() => setLoading(false))
  }, [vehicleInfo])

  // Scroll to category and set active
  const scrollToCategory = (category: string) => {
    setActiveCategory(category)
    const el = sectionRefs.current[category]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Track which category is in view on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('category-', '')
            setActiveCategory(id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [results])

  if (!vehicleInfo) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
        <Navbar />
        <main className="pt-[68px] md:pt-[132px] max-w-[900px] mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-extrabold mb-4">{t('no_vehicle') ?? 'No vehicle selected'}</h1>
          <Link to="/" className="text-[#00C853] hover:underline">{t('back_home') ?? 'Go back and enter a VIN'}</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />

      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Vehicle info header */}
          <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">VIN</p>
                <p className="font-mono text-sm font-semibold">{vehicleInfo.vin}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('make') ?? 'Make'}</p>
                <p className="font-semibold">{vehicleInfo.make} {vehicleInfo.model}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('year') ?? 'Year'}</p>
                <p className="font-semibold">{vehicleInfo.year}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('engine') ?? 'Engine'}</p>
                <p className="font-semibold">{vehicleInfo.engine || '—'}</p>
              </div>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && <p className="text-center py-12 text-[#4A6B50]">{t('loading') ?? 'Searching parts…'}</p>}
          {error && <p className="text-center py-12 text-red-400">{error}</p>}

          {/* Results with Sidebar Layout */}
          {!loading && !error && results.length > 0 && (
            <div className="flex gap-8">
              {/* Sidebar */}
              <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-[140px]">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#7A9A80] mb-4">
                    {t('categories') ?? 'Categories'}
                  </h3>
                  <nav className="space-y-1">
                    {results.map((group) => (
                      <button
                        key={group.category}
                        onClick={() => scrollToCategory(group.category)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                          activeCategory === group.category
                            ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] font-semibold'
                            : 'text-[#4A6B50] dark:text-[#7A9A80] hover:bg-[rgba(0,200,83,0.04)]'
                        )}
                      >
                        <span>{group.category}</span>
                        <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px]">
                          {group.parts.length}
                        </Badge>
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {results.map((group) => (
                  <div
                    key={group.category}
                    id={`category-${group.category}`}
                    ref={(el) => { sectionRefs.current[group.category] = el }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xl font-bold">{group.category}</h2>
                      <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px]">
                        {group.parts.length} {t('parts') ?? 'parts'}
                      </Badge>
                    </div>

                    {group.parts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {group.parts.map((part, idx) => (
                          <PartCard key={`${part.partNumber}-${idx}`} part={part} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm py-4">
                        {t('no_parts_category') ?? 'No parts found in this category'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#4A6B50] dark:text-[#7A9A80]">{t('no_parts_found') ?? 'No parts found for this vehicle'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// PartCard remains unchanged
function PartCard({ part }: { part: SearchPart }) {
  const [imageError, setImageError] = useState(false)
  const hasImage = part.imageURL && !imageError
  const { addItem } = useExternalCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(part);
  }
  // function handleAddToWishlist() {
  //   const wishlist = JSON.parse(sessionStorage.getItem('partWishlist') ?? '[]')
  //   wishlist.push(part)
  //   sessionStorage.setItem('partWishlist', JSON.stringify(wishlist))
  //   alert(part.name + ' added to wishlist!')
  // }

  return (
    <div className="group relative bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden hover:border-[rgba(0,200,83,0.3)] transition-colors flex flex-col">
      <div className="aspect-square bg-[#EFF7F1] dark:bg-[#162019] overflow-hidden relative">
        {hasImage ? (
          <img
            src={part.imageURL}
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B0C7B7] dark:text-[#4A6B50]">
            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75h4.5l2.25 6h6.75v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-9h6.75l-2.25-6Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[#07110A] dark:text-white text-xs font-semibold leading-snug line-clamp-2">{part.name}</p>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px]">{part.supplier}</p>
        <div className="mt-auto pt-2 flex items-end justify-between">
          <span className="text-[#00C853] font-extrabold text-sm">{part.price}</span>
          {part.location && <span className="text-[#7A9A80] text-[9px]">{part.location}</span>}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 pt-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1.5 bg-[#00C853] text-[#07110A] font-semibold text-[11px] px-3 py-2 rounded-lg hover:bg-[#39FF88] transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}