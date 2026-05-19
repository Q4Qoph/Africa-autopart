import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { vinApi } from '@/api/vinApi'
import type { VinPartsResponse, PartDetailResponse, VinPart } from '@/types/vin'
import { useExternalCart } from '@/context/ExternalCartContext'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PartsSearchPage() {
  const location = useLocation()
  const { t } = useTranslation('home')
  const { addItem } = useExternalCart()

  const vinData = location.state?.vinParts as VinPartsResponse | undefined
  const [activeCategory, setActiveCategory] = useState<string>('')

  // Modal state
  const [selectedPart, setSelectedPart] = useState<PartDetailResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Navigation through current category parts
  const [currentParts, setCurrentParts] = useState<VinPart[]>([])
  const [currentPartIndex, setCurrentPartIndex] = useState(0)

  useEffect(() => {
    if (vinData && vinData.categories.length > 0) {
      setActiveCategory(vinData.categories[0].category_code)
    }
  }, [vinData])

  const currentCategory = vinData?.categories.find(c => c.category_code === activeCategory)

  // When a part is clicked, store the current category's parts list and the index
  async function handlePartClick(partId: string) {
    if (!currentCategory) return
    const parts = currentCategory.parts
    const idx = parts.findIndex(p => p.part_id === partId)
    if (idx === -1) return

    setCurrentParts(parts)
    setCurrentPartIndex(idx)
    await loadPartDetail(parts[idx].part_id)
    setModalOpen(true)
  }

  async function loadPartDetail(partId: string) {
    setLoadingDetail(true)
    try {
      const { data } = await vinApi.getPartDetail(partId)
      const detail = Array.isArray(data) ? data[0] : data
      setSelectedPart(detail)
    } catch {
      setSelectedPart(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function goToPrev() {
    if (currentPartIndex <= 0) return
    const newIdx = currentPartIndex - 1
    setCurrentPartIndex(newIdx)
    await loadPartDetail(currentParts[newIdx].part_id)
  }

  async function goToNext() {
    if (currentPartIndex >= currentParts.length - 1) return
    const newIdx = currentPartIndex + 1
    setCurrentPartIndex(newIdx)
    await loadPartDetail(currentParts[newIdx].part_id)
  }

  function handleAddToCart() {
    if (!selectedPart) return
    const part = selectedPart
    const cartItem = {
      name: part.marketData.display_name || part.marketData.part_number,
      partNumber: part.marketData.part_number,
      price: `$${part.marketData.demo_price_usd.toFixed(2)}`,
      originalPrice: '',
      supplier: part.marketData.supplier_name,
      availability: true,
      location: part.marketData.warehouse_location,
      imageURL: part.imageURL || '',
    }
    addItem(cartItem)
    setModalOpen(false)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedPart(null)
    setCurrentParts([])
  }

  const canGoPrev = currentPartIndex > 0
  const canGoNext = currentPartIndex < currentParts.length - 1

  if (!vinData) {
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
                <p className="font-mono text-sm font-semibold">{vinData.vin}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('make') ?? 'Make'}</p>
                <p className="font-semibold">{vinData.brand} {vinData.model_name}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('year') ?? 'Year'}</p>
                <p className="font-semibold">{vinData.model_year}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('engine') ?? 'Engine'}</p>
                <p className="font-semibold">{vinData.engine_code} ({vinData.engine_displacement})</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-[140px]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#7A9A80] mb-4">
                  {t('categories') ?? 'Categories'}
                </h3>
                <nav className="space-y-1">
                  {vinData.categories.map((cat) => (
                    <button
                      key={cat.category_code}
                      onClick={() => setActiveCategory(cat.category_code)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                        activeCategory === cat.category_code
                          ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] font-semibold'
                          : 'text-[#4A6B50] dark:text-[#7A9A80] hover:bg-[rgba(0,200,83,0.04)]'
                      )}
                    >
                      <span>{cat.category_name}</span>
                      <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px]">
                        {cat.parts.length}
                      </Badge>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {currentCategory ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">{currentCategory.category_name}</h2>
                  {currentCategory.parts.length === 0 ? (
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm py-8 text-center">
                      {t('no_parts_category') ?? 'No parts found in this category'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {currentCategory.parts.map((part) => (
                        <div
                          key={part.part_id}
                          onClick={() => handlePartClick(part.part_id)}
                          className="group relative bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden hover:border-[rgba(0,200,83,0.3)] transition-colors flex flex-col cursor-pointer"
                        >
                          <div className="aspect-square bg-[#EFF7F1] dark:bg-[#162019] flex items-center justify-center">
                            <Package className="w-10 h-10 text-[#7A9A80] opacity-40" />
                          </div>
                          <div className="p-3 flex flex-col gap-1.5 flex-1">
                            <p className="text-[#07110A] dark:text-white text-xs font-semibold leading-snug line-clamp-2">{part.part_name}</p>
                            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px]">{part.part_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm py-8 text-center">Select a category</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Part Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 bg-white dark:bg-[#111C14] rounded-2xl border border-[rgba(0,200,83,0.15)] shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#07110A] dark:hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetail ? (
              <div className="p-8 text-center text-sm text-[#4A6B50]">Loading part details…</div>
            ) : selectedPart ? (
              <div className="p-6">
                {/* Previous / Next navigation */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <button
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] text-[#00C853] flex items-center justify-center hover:bg-[rgba(0,200,83,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                    {currentPartIndex + 1} / {currentParts.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={!canGoNext}
                    className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] text-[#00C853] flex items-center justify-center hover:bg-[rgba(0,200,83,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {selectedPart.imageURL && (
                  <img
                    src={selectedPart.imageURL}
                    alt={selectedPart.marketData.display_name}
                    className="w-full h-48 object-contain rounded-lg mb-4 mt-6 bg-[#EFF7F1] dark:bg-[#0D1810]"
                  />
                )}
                <h2 className="text-lg font-bold text-[#07110A] dark:text-white mb-2">
                  {selectedPart.marketData.display_name || selectedPart.marketData.part_number}
                </h2>
                <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] mb-4">
                  {selectedPart.marketData.part_number}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4A6B50] dark:text-[#7A9A80]">Price</span>
                    <span className="font-bold text-[#00C853]">
                      ${selectedPart.marketData.demo_price_usd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6B50] dark:text-[#7A9A80]">Supplier</span>
                    <span className="text-[#07110A] dark:text-white">{selectedPart.marketData.supplier_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6B50] dark:text-[#7A9A80]">Availability</span>
                    <span className="text-[#07110A] dark:text-white">{selectedPart.marketData.availability_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6B50] dark:text-[#7A9A80]">Location</span>
                    <span className="text-[#07110A] dark:text-white">{selectedPart.marketData.warehouse_location}</span>
                  </div>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full mt-6 bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-10 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-red-400">Failed to load part details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}