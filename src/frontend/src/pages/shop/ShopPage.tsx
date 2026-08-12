import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { partsApi, type PartSeed } from '@/api/partsApi'
import { useExternalCart } from '@/context/ExternalCartContext'
import { ShoppingCart, Tag, Filter, X, ChevronRight, Layers } from 'lucide-react'

// Page numbers generator helper
const getPageNumbers = (current: number, total: number) => {
  const pages: (number | string)[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
}

// Skeleton Loader Component
const PartCardSkeleton = () => (
  <div className="animate-pulse border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 bg-white dark:bg-[#111C14]">
    <div className="bg-slate-100 dark:bg-slate-900 aspect-square rounded-xl"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 pt-1"></div>
    </div>
  </div>
)

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem } = useExternalCart()

  // Read state from URL
  const page = Number(searchParams.get('page')) || 1
  const supplier = searchParams.get('supplier') || ''
  const [selectedModel, setSelectedModel] = useState<string>('')

  // Scroll to top when page or supplier changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, supplier])

  const pageSize = 48

  // React Query with keepPreviousData for smooth pagination transition
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['catalog', page, supplier],
    queryFn: () => partsApi.fetchCatalogParts(page, pageSize, supplier || undefined),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // 1. Extract unique models for the filter sidebar from current page parts
  const availableModels = useMemo(() => {
    if (!data?.items) return []
    const models = data.items.map((item) => item.applicableModel).filter(Boolean)
    return [...new Set(models)] as string[]
  }, [data])

  // 2. Extract unique suppliers for the dropdown filter
  const availableSuppliers = useMemo(() => {
    if (!data?.items) return []
    const suppliers = data.items.map((item) => item.supplier).filter(Boolean)
    return [...new Set(suppliers)] as string[]
  }, [data])

  // 3. Client-side filtering by Model
  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    if (!selectedModel) return data.items
    return data.items.filter((item) => item.applicableModel === selectedModel)
  }, [data?.items, selectedModel])

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(newPage))
      return prev
    })
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams((prev) => {
      if (e.target.value) prev.set('supplier', e.target.value)
      else prev.delete('supplier')
      prev.set('page', '1') // Reset to first page
      return prev
    })
    setSelectedModel('') // Reset model filter
  }

  const handleAddToCart = (part: PartSeed, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      name: part.partName,
      partNumber: part.partCode,
      price: `$${(part.price ?? 0).toFixed(2)}`,
      originalPrice: '',
      supplier: part.supplier,
      availability: true,
      location: part.applicableModel || 'N/A',
      imageURL: part.imageUrl || '',
    })
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams())
    setSelectedModel('')
  }

  if (isError) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4">
          <X className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Failed to Load Catalog</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          There was an error communicating with the catalog service. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      {/* Header section with glassmorphism touches */}
      <section className="py-8 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/40 dark:from-emerald-950/10 dark:via-[#111C14]/30 dark:to-slate-950/10 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
            <span className="block w-6 h-px bg-[#00C853]" />
            Catalog Marketplace
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Browse Auto Parts Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl">
            Explore and filter our live inventory database of high-quality auto replacement components, sourced directly from trusted regional suppliers.
          </p>
        </div>
      </section>

      {/* Main layout with sidebar filters and product grid */}
      <div className="max-w-[1240px] mx-auto w-full px-6 py-8 flex-grow flex flex-col lg:flex-row gap-8">
        
        {/* Left Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="p-5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#111C14] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#00C853]" />
                Filters
              </h3>
              {(supplier || selectedModel) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Supplier dropdown filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Supplier
              </label>
              <select
                value={supplier}
                onChange={handleSupplierChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#00C853]/50 focus:border-[#00C853] outline-none transition-all"
              >
                <option value="">All Suppliers</option>
                {availableSuppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
            </div>

            {/* Applicable Model scroll list */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Vehicle Model
              </label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 select-none custom-scrollbar">
                <button
                  onClick={() => setSelectedModel('')}
                  className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    !selectedModel
                      ? 'bg-[#00C853]/10 text-[#00C853]'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>All Models</span>
                  {!selectedModel && <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />}
                </button>
                {availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                      selectedModel === model
                        ? 'bg-[#00C853]/10 text-[#00C853] font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                    title={model}
                  >
                    <span className="truncate">{model}</span>
                    {selectedModel === model && <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Results counter */}
            {data && (
              <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Total Catalog:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{data.totalCount}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PartCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {filteredItems.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-[#111C14]/10">
                  <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No parts found matching filters</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 text-xs font-bold text-[#00C853] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((part) => (
                    <Link
                      to={`/part-detail/${part.id}`}
                      key={part.id}
                      className="group border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 bg-white dark:bg-[#111C14] hover:border-[#00C853]/40 dark:hover:border-[#00C853]/40 hover:shadow-xl hover:shadow-emerald-500/[0.03] transition-all duration-300 flex flex-col relative overflow-hidden"
                    >
                      {/* Image viewport */}
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center p-2 relative">
                        {part.imageUrl ? (
                          <img
                            src={part.imageUrl}
                            alt={part.partName}
                            className="h-36 w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/200x200/e2e8f0/475569?text=No+Image'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                            <Tag className="w-10 h-10 mb-1.5 stroke-[1.2]" />
                            <span className="text-[10px] font-mono uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        
                        {/* Inline cart quick button */}
                        <button
                          onClick={(e) => handleAddToCart(part, e)}
                          className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md shadow-emerald-500/20 translate-y-1 group-hover:translate-y-0"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content meta */}
                      <div className="mt-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              {part.partCode}
                            </span>
                          </div>
                          <h3
                            className="font-bold text-slate-800 dark:text-slate-100 text-xs line-clamp-2 h-8 leading-tight group-hover:text-[#00C853] transition-colors"
                            title={part.partName}
                          >
                            {part.partName}
                          </h3>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-900 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                            <span className="truncate max-w-[80px]" title={part.applicableModel}>
                              {part.applicableModel || 'Universal'}
                            </span>
                            <span className="truncate max-w-[80px]" title={part.supplier}>
                              {part.supplier}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-0.5 text-[#00C853] font-black text-sm">
                            <span className="text-[10px] font-mono">$</span>
                            <span>{(part.price ?? 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Server-Side Pagination Controls */}
              {data && data.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 border-t border-slate-100 dark:border-slate-900 pt-6 select-none">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isFetching}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs transition-colors disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {getPageNumbers(page, data.totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={idx} className="px-2 py-1 text-xs text-slate-400 dark:text-slate-600 font-mono">
                            ...
                          </span>
                        )
                      }
                      const pageNum = p as number
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isFetching}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                            page === pageNum
                              ? 'bg-[#00C853] text-[#07110A] shadow-md shadow-emerald-500/10'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === data.totalPages || isFetching}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs transition-colors disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}