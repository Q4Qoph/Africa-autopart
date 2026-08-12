import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { partsApi } from '@/api/partsApi'
import { useExternalCart } from '@/context/ExternalCartContext'
import { ShoppingCart, ArrowLeft, ShieldCheck, Tag, Loader2, Award, Layers } from 'lucide-react'

export default function PartDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useExternalCart()
  
  const [quantity, setQuantity] = useState(1)
  const [addedFeedback, setAddedFeedback] = useState(false)

  // Scroll to top on mount or when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Fetch individual part details
  const { data: part, isLoading, isError } = useQuery({
    queryKey: ['part', id],
    queryFn: () => partsApi.fetchCatalogPartById(id || ''),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  })

  const handleQuantityChange = (val: number) => {
    if (val < 1) return
    setQuantity(val)
  }

  const handleAddToCart = () => {
    if (!part) return
    addItem({
      name: part.partName,
      partNumber: part.partCode,
      price: `$${(part.price ?? 0).toFixed(2)}`,
      originalPrice: '',
      supplier: part.supplier,
      availability: true,
      location: part.applicableModel || 'N/A',
      imageURL: part.imageUrl || '',
    }, quantity)

    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-[#00C853] mb-4" />
        <p className="text-sm font-mono tracking-wider">Loading part specifications...</p>
      </div>
    )
  }

  if (isError || !part) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4">
          <Layers className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Specification Load Failed</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Could not retrieve details for this part. It might have been removed or the ID is invalid.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all duration-200"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      {/* Top Breadcrumbs & Back bar */}
      <div className="border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-[#111C14] py-4">
        <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#00C853] dark:text-slate-400 dark:hover:text-[#00C853] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </button>

          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            ID: {part.id}
          </span>
        </div>
      </div>

      {/* Main product view columns */}
      <div className="max-w-[1240px] mx-auto w-full px-6 py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-[#111C14] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 lg:p-10 shadow-sm">
          
          {/* Left Column: Picture frame */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-900/60 aspect-square max-h-[500px]">
            {part.imageUrl ? (
              <img
                src={part.imageUrl}
                alt={part.partName}
                className="w-full h-full object-contain max-h-[400px] hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/400x400/e2e8f0/475569?text=No+Image'
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <Tag className="w-20 h-20 mb-3 stroke-[1.1]" />
                <span className="text-xs font-mono uppercase tracking-widest">Image Unavailable</span>
              </div>
            )}
          </div>

          {/* Right Column: Title, pricing details and dynamic specs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200/20">
                  Code: {part.partCode}
                </span>
                <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/20 text-[#00C853] px-2 py-1 rounded-md font-bold">
                  In Stock
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
                {part.partName}
              </h1>

              <div className="flex items-baseline gap-1 py-2 text-[#00C853]">
                <span className="text-sm font-mono font-bold">$</span>
                <span className="text-3xl font-black tracking-tight">{(part.price ?? 0).toFixed(2)}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono ml-2">Excl. Shipping costs</span>
              </div>
            </div>

            {/* Stepper control + Add to Cart Action */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm h-12">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 font-bold transition-colors text-lg"
                >
                  -
                </button>
                <span className="px-6 font-mono font-bold text-slate-800 dark:text-slate-200 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 font-bold transition-colors text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-grow w-full sm:w-auto h-12 flex items-center justify-center gap-2 bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] font-extrabold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                {addedFeedback ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Structured Specifications Table */}
            <div className="border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
                    <td className="p-4 font-semibold text-slate-400 dark:text-slate-500 w-1/3">Compatible Model</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{part.applicableModel || 'Universal'}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-900">
                    <td className="p-4 font-semibold text-slate-400 dark:text-slate-500">Supplier / Vendor</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{part.supplier}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
                    <td className="p-4 font-semibold text-slate-400 dark:text-slate-500">Data Source</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{part.sourceFile}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 dark:text-slate-500">Record Entry No</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-xs">#{part.rowNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Extra Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-2 bg-slate-50/20 dark:bg-slate-900/5 p-3 rounded-xl border border-slate-100 dark:border-slate-900/50">
                <ShieldCheck className="w-5 h-5 text-[#00C853] shrink-0" />
                <span>Verified Supplier Warranted Part</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50/20 dark:bg-slate-900/5 p-3 rounded-xl border border-slate-100 dark:border-slate-900/50">
                <Award className="w-5 h-5 text-amber-500 shrink-0" />
                <span>OEM Spec Match Guaranteed</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
