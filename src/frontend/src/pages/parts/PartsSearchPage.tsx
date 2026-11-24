import { PartImage } from '@/components/catalog/PartImage'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  SunMoon,
} from 'lucide-react'
import { catalogApi } from '@/api/catalogApi'
import { readSearch, writeSearch, prepareSearch, identifyInput } from '@/lib/catalogSearch'
import type { CatalogSearchState } from '@/lib/catalogSearch'
import { useCatalogSearch } from '@/hooks/useCatalogSearch'
import { CatalogDiagrams } from '@/components/catalog/CatalogDiagrams'
import diagramCatalogs from '@/data/catalogAssemblies.json'
import { CatalogSearchForm } from '@/components/catalog/CatalogSearchForm'
import { useTranslation } from 'react-i18next'
import type { CatalogPartItem } from '@/types/catalog'
import { useExternalCart } from '@/context/ExternalCartContext'
import { formatCheckoutPrice } from '@/lib/checkoutPrice'
import { cn } from '@/lib/utils'
import { getBrandLogoPath } from '@/lib/brandUtils'


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


export default function PartsSearchPage({ browseAll = false }: { browseAll?: boolean }) {
  const { t } = useTranslation('search')
  const navigate = useNavigate()
  const { addItem } = useExternalCart()
  const location = useLocation()
  const route = useParams<{ make?: string; model?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacy = location.state as { vin?: string; searchTerm?: string; make?: string; model?: string } | undefined
  const params = new URLSearchParams(searchParams)
  if (!params.size && !route.make && legacy) {
    for (const key of ['vin', 'make', 'model'] as const) if (legacy[key]) params.set(key, legacy[key])
    if (legacy.searchTerm && !legacy.vin) params.set('q', legacy.searchTerm)
  }
  const state = readSearch(params, route)
  const referenceCatalog = diagramCatalogs.find(catalog => state.scope === 'catalog'
    && catalog.vin === searchParams.get('diagramReference')
    && catalog.make === state.make.toUpperCase() && catalog.model === state.model.toUpperCase())
  const result = useCatalogSearch(state, browseAll, referenceCatalog?.vin)
  const parts = result.error ? [] : result.data?.items || []
  const totalCount = result.error ? 0 : result.data?.totalCount || 0
  const page = state.page
  const totalPages = Math.max(1, result.data?.totalPages || 1)
  const loading = result.loading
  const requestedVin = state.vin
  const isVinMatched = state.scope === 'vin' && !!result.vin?.matched
  const diagramChoices = diagramCatalogs.filter(catalog => {
    if (state.scope === 'vin') return isVinMatched && catalog.vin === requestedVin
    return state.scope === 'catalog' && catalog.make === state.make.toUpperCase() && catalog.model === state.model.toUpperCase()
      && (!state.year || state.year === catalog.modelYear) && (!state.steering || state.steering === catalog.steering)
      && (!state.vehicleSeries || state.vehicleSeries === catalog.vehicleSeries)
      && (!state.engineFamily || state.engineFamily === catalog.engineFamily)
      && (!state.transmission || state.transmission === catalog.transmission)
      && (!state.marketSpec || state.marketSpec === catalog.marketSpec)
  })
  const diagramsAvailable = import.meta.env.VITE_CATALOG_DIAGRAMS !== 'false' && diagramChoices.length > 0
  const view = searchParams.get('view')
  const diagramsOpen = diagramsAvailable && (view === 'diagrams' || (
    view === null && !state.filter && !state.group && state.page === 1
      && (!state.q || state.scope === 'vin' && state.q.toUpperCase() === requestedVin)
  ))
  function toggleDiagrams(open: boolean, referenceVin?: string) {
    const next = new URLSearchParams(params)
    next.set('view', open ? 'diagrams' : 'parts')
    if (referenceVin && state.scope === 'catalog') next.set('diagramReference', referenceVin)
    setSearchParams(next)
  }
  const vinError = result.error ? t(result.error, { defaultValue: t('error') }) : ''
  const vehicleMeta = state.scope === 'vin'
    ? { ...result.vin?.meta, vin: requestedVin, oem: result.vin?.meta.make, vehicle: undefined }
    : { vin: undefined, make: state.make, oem: state.make, model: state.model, modelYear: state.year,
        series: state.vehicleSeries, engineFamily: state.engineFamily, transmission: state.transmission,
        marketSpec: state.marketSpec, steering: state.steering, vehicle: undefined }
  const exactNumber = identifyInput(state.q, state.mode) === 'number' ? state.q.toUpperCase() : ''
  const displayParts = exactNumber ? [...parts].sort((a, b) =>
    Number(b.partNumber.toUpperCase() === exactNumber) - Number(a.partNumber.toUpperCase() === exactNumber)) : parts
  function updateSearch(patch: Partial<CatalogSearchState>) {
    const next = new URLSearchParams(writeSearch({ ...state, ...patch }))
    if (referenceCatalog) next.set('diagramReference', referenceCatalog.vin)
    next.set('view', 'parts')
    setSearchParams(next)
  }
  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages || loading) return
    updateSearch({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const [selectedPreview, setSelectedPart] = useState<CatalogPartItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState(0)
  const [copiedPartNumber, setCopiedPartNumber] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [invertDiagram, setInvertDiagram] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const detail = useQuery({
    queryKey: ['vehicle-part', selectedPreview?.id],
    queryFn: () => catalogApi.getPart(selectedPreview!.id),
    enabled: modalOpen && !!selectedPreview,
    staleTime: 300_000, retry: false,
  })
  const selectedPart = detail.data || selectedPreview
  const selectedPrice = formatCheckoutPrice(selectedPart?.price)

  function addPartToCart(part: CatalogPartItem, price: string) {

    addItem({
      name: part.partName,
      partNumber: part.partNumber,
      price,
      isEstimated: true,
      originalPrice: '',
      supplier: part.oem || part.make || '',
      availability: false,
      location: part.model || '',
      imageURL: part.imageUrl || '',
    })
    navigate('/cart')
  }

  function requestPartUrl(part: CatalogPartItem) {
    const params = new URLSearchParams({
      make: part.make || part.oem || '', model: part.model || '',
      partNumber: part.partNumber, partName: part.partName,
    })
    if (isVinMatched && part.vin === requestedVin) params.set('vin', requestedVin)
    return `/requests/new?${params}`
  }

  function handlePartClick(part: CatalogPartItem, idx: number) {
    setSelectedPart(part)
    setCurrentPartIndex(idx)
    setZoomLevel(1)
    setModalOpen(true)
  }

  function goToPrev() {
    if (currentPartIndex <= 0) return
    const newIdx = currentPartIndex - 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(displayParts[newIdx])
    setZoomLevel(1)
  }

  function goToNext() {
    if (currentPartIndex >= displayParts.length - 1) return
    const newIdx = currentPartIndex + 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(displayParts[newIdx])
    setZoomLevel(1)
  }

  function closeModal() {
    setModalOpen(false)
    setLightboxOpen(false)
    setSelectedPart(null)
    setZoomLevel(1)
  }

  const canGoPrev = currentPartIndex > 0
  const canGoNext = currentPartIndex < displayParts.length - 1

  // Lock body scroll and listen for Escape / Arrow navigation keys when modal is open
  useEffect(() => {
    if (!modalOpen && !lightboxOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const previousFocus = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('[data-catalog-dialog]')
    dialog?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && dialog && !lightboxOpen) {
        const nodes = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, [tabindex="0"]')]
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false)
        } else {
          closeModal()
        }
      }
      if (!lightboxOpen) {
        if (e.key === 'ArrowLeft' && canGoPrev) goToPrev()
        if (e.key === 'ArrowRight' && canGoNext) goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalOpen, lightboxOpen, canGoPrev, canGoNext, currentPartIndex])

  const activeOem = vehicleMeta.make || t('any')
  const activeModel = vehicleMeta.model || ''

  if (diagramsOpen) {
    return <div className="px-4"><CatalogDiagrams choices={diagramChoices} customerVin={isVinMatched ? requestedVin : ''} onClose={referenceVin => toggleDiagrams(false, referenceVin)} /></div>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{activeModel ? `${activeOem} ${activeModel}` : t('catalogShop')}</h1>
          {requestedVin && <p className="text-sm">{t(isVinMatched ? 'exact' : 'guided')}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {diagramsAvailable && <button type="button" onClick={() => toggleDiagrams(true)} className="min-h-11 rounded-lg border px-3 font-semibold">Assembly diagrams</button>}
          {state.scope !== 'global' && <Link to="/#vehicle-catalogs" className="inline-flex min-h-11 items-center underline">Change vehicle</Link>}
        </div>
      </header>

      <form key={JSON.stringify([state.q, state.filter])} role="search" className="space-y-2" onSubmit={event => {
        event.preventDefault()
        const value = String(new FormData(event.currentTarget).get('query') ?? '').trim()
        const next = prepareSearch(value, 'auto', state, [])
        if (state.scope === 'vin' && !value) next.vin = state.vin
        const search = new URLSearchParams(writeSearch(next))
        if (referenceCatalog && next.scope === 'catalog') search.set('diagramReference', referenceCatalog.vin)
        search.set('view', 'parts')
        setSearchParams(search)
      }}>
        <label htmlFor="catalog-results-query" className="block text-sm font-medium">{t('query')}</label>
        <div className="flex gap-2">
          <input id="catalog-results-query" name="query" type="search" dir="auto" maxLength={80} defaultValue={state.q || state.filter} className="min-h-11 min-w-0 flex-1 rounded-lg border bg-transparent px-3" />
          <button type="submit" className="rounded-lg bg-emerald-700 px-4 font-semibold text-white">{t('submit')}</button>
        </div>
      </form>
      <details className="rounded-lg border px-3">
        <summary className="cursor-pointer py-2.5 font-medium">Advanced search</summary>
        <div className="space-y-3 pb-3">
          <CatalogSearchForm key={writeSearch(state)} state={state} decodedMake={result.vin?.meta.make} onSearch={next => setSearchParams(writeSearch(next))} />
          <label className="flex flex-wrap items-center gap-2 text-sm">{t('sort')}
            <select value={state.sort} onChange={event => updateSearch({ sort: event.target.value, page: 1 })} className="rounded border bg-transparent p-2">
              <option value="">{t('defaultSort')}</option><option value="asc">{t('asc')}</option><option value="desc">{t('desc')}</option>
            </select>
          </label>
          {!!(state.filter || state.group || state.sort) && <button type="button" className="underline" onClick={() => updateSearch({ filter: '', group: '', sort: '', page: 1 })}>{t('clearFilters')}</button>}
        </div>
      </details>

      <section aria-labelledby="catalog-parts-title">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="catalog-parts-title" className="text-lg font-semibold">Parts list</h2>
          {!loading && !vinError && <p className="text-sm">{totalCount.toLocaleString()} {t('records')}</p>}
        </div>
        {loading ? <p role="status">{t('loading')}</p> : vinError ? (
          <div role="alert">{vinError} <button type="button" className="underline" onClick={result.retry}>{t('retry')}</button></div>
        ) : !displayParts.length ? (
          <div className="space-y-2">
            <p>{t(state.q || requestedVin || state.filter || state.make ? 'empty' : 'noInput')}</p>
            <Link to={`/requests/new?${new URLSearchParams(requestedVin ? { vin: requestedVin } : {})}`} className="underline">{t('request')}</Link>
          </div>
        ) : <ul className="divide-y rounded-lg border">
          {displayParts.map((part, index) => {
            const price = formatCheckoutPrice(part.price)
            return <li key={part.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
              <button type="button" data-testid="catalog-part" data-part-number={part.partNumber} onClick={() => handlePartClick(part, index)}
                className="min-w-0 flex-1 text-start focus-visible:outline-2 focus-visible:outline-emerald-700">
                <span className="block break-words font-semibold text-emerald-800 hover:underline dark:text-emerald-300">{part.partName}</span>
                <span className="block break-words text-sm"><bdi>{part.partNumber}</bdi>{part.pnc ? ` · PNC ${part.pnc}` : ''}</span>
                <span className="block text-xs text-slate-600 dark:text-slate-300">{[part.make || part.oem, part.model, part.subgroupName].filter(Boolean).join(' · ')}</span>
              </button>
              <div className="text-sm">
                <span className="block">{t('catalogQuantity')} {part.quantity ?? t('unknown')}</span>
                {price && <span className="block font-semibold" title={t('estimateNote')}>{price} <span className="font-normal">est.</span></span>}
              </div>
              {part.imageUrl && <button type="button" onClick={() => handlePartClick(part, index)} className="min-h-11 px-2 text-sm underline">View diagram</button>}
              {price ? <button type="button" onClick={() => addPartToCart(part, price)} className="min-h-11 rounded-lg bg-emerald-700 px-3 font-semibold text-white">Add part</button>
                : <Link to={requestPartUrl(part)} className="inline-flex min-h-11 items-center rounded-lg border px-3 font-semibold">{t('request')}</Link>}
            </li>
          })}
        </ul>}
        {totalPages > 1 && <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" disabled={page === 1 || loading} onClick={() => handlePageChange(page - 1)} className="min-h-11 rounded border px-3 disabled:opacity-40">Previous</button>
          {getPageNumbers(page, totalPages).map((number, index) => number === '...' ? <span key={`gap-${index}`}>…</span> :
            <button key={number} type="button" aria-current={page === number ? 'page' : undefined} onClick={() => handlePageChange(Number(number))}
              className={cn('min-h-11 min-w-11 rounded border px-2', page === number && 'bg-emerald-700 text-white')}>{number}</button>)}
          <button type="button" disabled={page >= totalPages || loading} onClick={() => handlePageChange(page + 1)} className="min-h-11 rounded border px-3 disabled:opacity-40">Next</button>
        </nav>}
      </section>

      {/* Part Detail Modal using Portal to render directly on body above all navbars */}
      {modalOpen && selectedPart && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans select-none animate-fadeIn p-4 sm:p-6 md:p-8">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={closeModal} />
          <div role="dialog" aria-modal="true" aria-label={selectedPart.partName} tabIndex={-1} data-catalog-dialog className="relative z-10 bg-white dark:bg-brand-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl lg:max-w-6xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-brand-card text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Previous component"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={!canGoNext}
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-brand-card text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Next component"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Part <strong className="text-slate-800 dark:text-slate-200 font-bold">{currentPartIndex + 1}</strong> of <strong className="text-slate-800 dark:text-slate-200 font-bold">{displayParts.length}</strong>
                </span>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Two-Column Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 flex-grow overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left Column: Interactive Technical Diagram Viewer */}
              <div className="p-6 flex flex-col items-center justify-between bg-slate-100/90 dark:bg-[#07110A]/90 relative min-h-[360px] md:min-h-[440px] select-none border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                {/* Top Badge & Controls Bar */}
                <div className="w-full flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedPart.pnc && (
                      <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        PNC {selectedPart.pnc}
                      </span>
                    )}
                    {selectedPart.picId && (
                      <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        PIC {selectedPart.picId}
                      </span>
                    )}
                  </div>

                  {/* Interactive Zoom & Mode Controls */}
                  {selectedPart.imageUrl && (
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-xs">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                        disabled={zoomLevel <= 0.75}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 px-1 min-w-[32px] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                        disabled={zoomLevel >= 3}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      {zoomLevel !== 1 && (
                        <button
                          onClick={() => setZoomLevel(1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Reset Zoom"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
                      <button
                        onClick={() => setInvertDiagram((v) => !v)}
                        className={cn(
                          'w-6 h-6 flex items-center justify-center rounded transition-colors',
                          invertDiagram
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                        title={invertDiagram ? 'Switch to Standard Diagram' : 'Switch to Blueprint Mode'}
                      >
                        <SunMoon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setLightboxOpen(true)}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Fullscreen Diagram"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Canvas Viewport */}
                <div
                  className={cn(
                    'w-full flex-grow min-h-[360px] md:min-h-[460px] max-h-[520px] rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-center p-3 relative overflow-hidden transition-colors',
                    invertDiagram ? 'bg-slate-950' : 'bg-white dark:bg-[#F8FAFC]'
                  )}
                >
                  {selectedPart.imageUrl ? (
                    <div
                      className="w-full h-full flex items-center justify-center overflow-auto cursor-zoom-in group/canvas"
                      onClick={() => setLightboxOpen(true)}
                      title="Click to view fullscreen diagram"
                    >
                      <PartImage
                        src={selectedPart.imageUrl}
                        alt={selectedPart.partName}
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transition: 'transform 0.2s ease-out',
                          filter: invertDiagram ? 'invert(1) hue-rotate(180deg) brightness(1.2)' : 'none',
                        }}
                        className="max-h-[440px] max-w-full object-contain select-none"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[260px] aspect-square flex items-center justify-center">
                      <PartImage alt={selectedPart.partName} />
                    </div>
                  )}
                </div>

                {/* Footer Hint */}
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-medium mt-3">
                  <span>Click diagram to expand fullscreen</span>
                  <span className="font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                    {selectedPart.oem || activeOem} EPC SCHEMATIC
                  </span>
                </div>
              </div>

              {/* Right Column: Part Specs & Actions */}
              <div className="p-6 flex flex-col justify-between bg-white dark:bg-brand-card">
                <div>
                  {/* Category breadcrumb */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>{selectedPart.groupName || 'GENERAL GROUP'}</span>
                    {selectedPart.subgroupName && (
                      <>
                        <span>›</span>
                        <span className="text-sky-600 dark:text-sky-400">{selectedPart.subgroupName}</span>
                      </>
                    )}
                  </div>

                  {/* Part Title */}
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2 uppercase">
                    {selectedPart.partName}
                  </h3>

                  {/* Part Number with Copy Action */}
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                    <span className="text-xs font-mono font-black text-sky-600 dark:text-sky-400">
                      {selectedPart.partNumber}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPart.partNumber)
                        setCopiedPartNumber(true)
                        setTimeout(() => setCopiedPartNumber(false), 2000)
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="Copy Part Number"
                    >
                      {copiedPartNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Specs Table */}
                  <div className="space-y-2 text-xs font-semibold border-t border-b border-slate-100 dark:border-slate-800 py-3.5 mb-5">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 font-medium">OEM / Brand</span>
                      <div className="flex items-center gap-1.5">
                        <img
                          src={getBrandLogoPath(selectedPart.oem || activeOem)}
                          alt={selectedPart.oem || activeOem}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none'
                          }}
                        />
                        <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">
                          {selectedPart.oem || activeOem}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 font-medium">Applicable Model</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">
                        {selectedPart.model || activeModel}
                      </span>
                    </div>
                    {selectedPart.pnc && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">PNC Code</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{selectedPart.pnc}</span>
                      </div>
                    )}
                    {selectedPart.picId && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Diagram PIC ID</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{selectedPart.picId}</span>
                      </div>
                    )}
                    {selectedPart.vin && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Catalog Vehicle VIN</span>
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{selectedPart.vin}</span>
                      </div>
                    )}
                    {selectedPart.replacePart && selectedPart.replacePart !== '[ ]' && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Supersedes / Replaces</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {selectedPart.replacePart}
                        </span>
                      </div>
                    )}
                    {selectedPart.engineFamily && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Engine</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {selectedPart.engineFamily} {selectedPart.displacementCC ? `(${selectedPart.displacementCC})` : ''} {selectedPart.engineType || ''}
                        </span>
                      </div>
                    )}
                    {selectedPart.transmission && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Transmission</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedPart.transmission}</span>
                      </div>
                    )}
                    {selectedPart.fuel && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Fuel Type</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedPart.fuel}</span>
                      </div>
                    )}
                    {selectedPart.steering && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Steering</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedPart.steering}</span>
                      </div>
                    )}
                    {selectedPart.body && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Body Type</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedPart.body}</span>
                      </div>
                    )}
                    {selectedPart.marketSpec && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Market Spec</span>
                        <span className="text-slate-800 dark:text-slate-200 text-[10px]">{selectedPart.marketSpec}</span>
                      </div>
                    )}
                    {(selectedPart.compatibilityStartYear || selectedPart.compatibilityEndYear) && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">Compatibility Years</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {selectedPart.compatibilityStartYear || ''} – {selectedPart.compatibilityEndYear || 'Present'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 font-medium">{t('catalogQuantity')}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        {selectedPart.quantity ?? t('unknown')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action */}
                <div>
                  {detail.isError && <p role="alert" className="mb-3 text-sm text-red-600">{t('partError')}</p>}
                  {selectedPrice ? (
                    <div className="mb-3">
                      <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xl font-bold">{selectedPrice}</span>
                        <em className="text-xs text-slate-600 dark:text-slate-300">{t('estimateNote')}</em>
                      </div>
                      <button type="button" onClick={() => addPartToCart(selectedPart, selectedPrice)} className="min-h-12 w-full rounded-lg bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700">
                        Add part
                      </button>
                    </div>
                  ) : <Link to={requestPartUrl(selectedPart)} className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-3 font-semibold text-white">{t('request')}</Link>}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen High-Res Diagram Lightbox Portal */}
      {lightboxOpen && selectedPart?.imageUrl && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0">
                <img
                  src={getBrandLogoPath(selectedPart.oem || activeOem)}
                  alt={selectedPart.oem || activeOem}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide uppercase text-white">
                  {selectedPart.partName} ({selectedPart.partNumber})
                </h4>
                <p className="text-[10px] font-mono text-slate-400">
                  {selectedPart.groupName} {selectedPart.subgroupName ? `› ${selectedPart.subgroupName}` : ''} {selectedPart.pnc ? `• PNC ${selectedPart.pnc}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-white min-w-[40px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                  className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button
                  onClick={() => setInvertDiagram((v) => !v)}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    invertDiagram ? 'bg-amber-500 text-white' : 'hover:bg-white/20 text-white'
                  )}
                  title={invertDiagram ? 'Switch to Standard Light Diagram' : 'Switch to Dark Blueprint'}
                >
                  <SunMoon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Canvas Area */}
          <div
            className="flex-grow flex items-center justify-center overflow-auto p-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'rounded-2xl p-6 shadow-2xl transition-all max-w-[95vw] max-h-[82vh] flex items-center justify-center overflow-auto',
                invertDiagram ? 'bg-slate-950 border border-slate-800' : 'bg-white'
              )}
            >
              <PartImage
                src={selectedPart.imageUrl}
                alt={selectedPart.partName}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease-out',
                  filter: invertDiagram ? 'invert(1) hue-rotate(180deg) brightness(1.2)' : 'none',
                }}
                className="max-h-[78vh] max-w-[90vw] object-contain select-none"
              />
            </div>
          </div>

          {/* Lightbox Footer */}
          <div className="text-center text-xs text-slate-400 py-1 font-sans">
            Use zoom controls or press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[11px] font-mono text-white">Esc</kbd> to exit fullscreen
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
