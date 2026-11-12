import { PartImage } from '@/components/catalog/PartImage'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  ListFilter,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  SunMoon,
} from 'lucide-react'
import { catalogApi } from '@/api/catalogApi'
import { readSearch, writeSearch, identifyInput } from '@/lib/catalogSearch'
import type { CatalogSearchState } from '@/lib/catalogSearch'
import { useCatalogSearch } from '@/hooks/useCatalogSearch'
import { CatalogSearchForm } from '@/components/catalog/CatalogSearchForm'
import { useTranslation } from 'react-i18next'
import type { CatalogPartItem } from '@/types/catalog'
import { cn } from '@/lib/utils'
import { getBrandLogoPath } from '@/lib/brandUtils'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

// ─── BRAND LOGOS ─────────────────────────────────────────────────────────────

const BRAND_LOGOS: Record<string, (color?: string) => React.ReactNode> = {
  Toyota: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="42" ry="24" />
      <ellipse cx="50" cy="30" rx="30" ry="15" />
      <ellipse cx="50" cy="30" rx="12" ry="24" />
    </svg>
  ),
  Lexus: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="40" ry="24" />
      <path d="M30,42 L52,18 L70,18 L48,42 L30,42 Z" fill={color} stroke="none" />
      <path d="M48,42 L68,42 L68,36 L54,36 Z" fill={color} stroke="none" />
    </svg>
  ),
  Nissan: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="20" />
      <rect x="15" y="24" width="70" height="12" fill={color} rx="1" stroke="none" />
      <text x="50" y="33" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="white" stroke="none" textAnchor="middle" letterSpacing="1">NISSAN</text>
    </svg>
  ),
  Infiniti: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="38" ry="22" />
      <path d="M28,40 L50,16 L72,40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50,16 L50,45" strokeWidth="3" />
    </svg>
  ),
  Mitsubishi: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill={color}>
      <path d="M50,5 L62,26 L50,47 L38,26 Z" />
      <path d="M36,49 L48,70 L24,70 L12,49 Z" />
      <path d="M64,49 L88,49 L76,70 L64,70 Z" />
    </svg>
  ),
  Subaru: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="2">
      <ellipse cx="50" cy="30" rx="42" ry="24" fill="#003399" stroke="none" />
      <path d="M30,30 L32,23 L39,21 L32,19 L30,12 L28,19 L21,21 L28,23 Z" fill="white" stroke="none" />
      <path d="M55,20 L56,17 L60,17 L57,15 L58,12 L55,14 L52,12 L53,15 L50,17 L54,17 Z" fill="white" stroke="none" />
      <path d="M68,26 L69,23 L73,23 L70,21 L71,18 L68,20 L65,18 L66,21 L63,23 L67,23 Z" fill="white" stroke="none" />
      <path d="M60,38 L61,35 L65,35 L62,33 L63,30 L60,32 L57,30 L58,33 L55,35 L59,35 Z" fill="white" stroke="none" />
      <path d="M72,36 L73,33 L77,33 L74,31 L75,28 L72,30 L69,28 L70,31 L67,33 L71,33 Z" fill="white" stroke="none" />
      <path d="M50,30 L51,27 L55,27 L52,25 L53,22 L50,24 L47,22 L48,25 L45,27 L49,27 Z" fill="white" stroke="none" />
    </svg>
  ),
  Hyundai: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="40" ry="24" />
      <path d="M34,42 L42,18 H48 L40,42 Z" fill={color} stroke="none" />
      <path d="M52,42 L60,18 H66 L58,42 Z" fill={color} stroke="none" />
      <path d="M38,32 H62 V26 H38 Z" fill={color} stroke="none" />
    </svg>
  ),
  Kia: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="6">
      <path d="M15,45 L15,15 L32,32 L32,15 M32,45 L32,32 M44,15 L44,45 M56,45 L70,15 L84,45" />
    </svg>
  ),
  Suzuki: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none">
      <path d="M25,10 H65 L35,42 H75 L55,70 H15 L45,38 Z" fill={color === 'currentColor' ? '#E60012' : color} />
    </svg>
  ),
  Mazda: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="24" />
      <path d="M28,28 C36,36 44,40 50,40 C56,40 64,36 72,28 C64,22 58,20 50,32 C42,20 36,22 28,28 Z" fill={color} stroke="none" />
    </svg>
  ),
  Honda: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <path d="M24,10 C24,8 26,6 28,6 H72 C74,6 76,8 76,10 V50 C76,52 74,54 72,54 H28 C26,54 24,52 24,50 Z" />
      <path d="M34,16 V44 H40 V30 H60 V44 H66 V16 H60 V27 H40 V16 Z" fill={color} stroke="none" />
    </svg>
  ),
  Isuzu: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
      <text x="50" y="40" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill={color === 'currentColor' ? '#E60012' : color} textAnchor="middle" letterSpacing="1">ISUZU</text>
    </svg>
  ),
  Mercedes: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="25" />
      <path d="M50,5 L50,30 L28,42.5 M50,30 L72,42.5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  Renault: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" stroke={color} strokeWidth="5">
      <path d="M50,5 L80,35 L50,75 L20,35 Z" />
      <path d="M50,20 L68,38 L50,60 L32,38 Z" fill={color} opacity="0.15" stroke="none" />
    </svg>
  ),
  BMW: (color = 'currentColor') => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke={color} strokeWidth="2">
      <circle cx="50" cy="50" r="48" fill="black" stroke="none" />
      <circle cx="50" cy="50" r="38" fill="white" stroke="none" />
      <circle cx="50" cy="50" r="34" fill="black" stroke="none" />
      <path d="M50,50 L50,16 A34,34 0 0,1 84,50 Z" fill="#0066CC" stroke="none" />
      <path d="M50,50 L16,50 A34,34 0 0,1 50,16 Z" fill="white" stroke="none" />
      <path d="M50,50 L50,84 A34,34 0 0,1 16,50 Z" fill="#0066CC" stroke="none" />
      <path d="M50,50 L84,50 A34,34 0 0,1 50,84 Z" fill="white" stroke="none" />
      <text x="50" y="14" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="white" stroke="none" textAnchor="middle">BMW</text>
    </svg>
  ),
  Volkswagen: (color = 'currentColor') => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke={color} strokeWidth="5">
      <circle cx="50" cy="50" r="44" />
      <path d="M26,30 L42,75 H47 L34,30 Z M74,30 L58,75 H53 L66,30 Z" fill={color} stroke="none" />
      <path d="M38,30 L50,60 L62,30 H56 L50,45 L44,30 Z" fill={color} stroke="none" />
    </svg>
  ),
  Audi: (color = 'currentColor') => (
    <svg viewBox="0 0 100 40" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <circle cx="26" cy="20" r="12" />
      <circle cx="42" cy="20" r="12" />
      <circle cx="58" cy="20" r="12" />
      <circle cx="74" cy="20" r="12" />
    </svg>
  ),
  Chevrolet: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-full h-full" fill="none">
      <path d="M35,10 H65 L68,20 H88 V30 H65 L62,40 H32 L29,30 H12 V20 H32 Z" fill={color === 'currentColor' ? '#D3A13B' : color} stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  'Land Rover': (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
      <ellipse cx="50" cy="30" rx="44" ry="24" fill={color === 'currentColor' ? '#005A36' : color} />
      <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="white" strokeWidth="1.5" />
      <text x="50" y="34" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="white" textAnchor="middle" letterSpacing="0.5">LAND ROVER</text>
    </svg>
  ),
  Porsche: (color = 'currentColor') => (
    <svg viewBox="0 0 80 100" className="w-full h-full" fill="none" stroke={color} strokeWidth="2">
      <path d="M10,10 H70 V40 C70,65 50,85 40,90 C30,85 10,65 10,40 Z" fill={color === 'currentColor' ? '#FFCC00' : 'none'} />
      <path d="M20,20 H60 V40 C60,55 48,70 40,75 C32,70 20,55 20,40 Z" fill="black" />
      <path d="M40,25 L40,70" stroke="#FF3300" strokeWidth="4" />
      <text x="40" y="16" fontFamily="sans-serif" fontWeight="900" fontSize="6" fill="black" stroke="none" textAnchor="middle" letterSpacing="0.5">PORSCHE</text>
    </svg>
  ),
  Volvo: (color = 'currentColor') => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke={color} strokeWidth="5">
      <circle cx="45" cy="55" r="28" />
      <path d="M65,35 L80,20 M60,20 H80 V40" strokeWidth="7" strokeLinecap="square" />
      <rect x="20" y="47" width="50" height="16" fill={color} stroke="none" />
      <text x="45" y="59" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="white" stroke="none" textAnchor="middle">VOLVO</text>
    </svg>
  ),
  Ford: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
      <ellipse cx="50" cy="30" rx="44" ry="24" fill={color === 'currentColor' ? '#003399' : 'none'} stroke={color} strokeWidth="2" />
      <text x="50" y="38" fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill="white" textAnchor="middle">Ford</text>
    </svg>
  ),
  Chrysler: (color = 'currentColor') => (
    <svg viewBox="0 0 100 40" className="w-full h-full" fill="none" stroke={color} strokeWidth="2">
      <path d="M10,20 L30,12 L50,18 L70,12 L90,20 L50,24 Z" />
      <circle cx="50" cy="18" r="6" fill={color} stroke="none" />
    </svg>
  ),
  Peugeot: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" stroke={color} strokeWidth="3">
      <path d="M30,70 L35,50 H45 L50,70 M55,70 L60,45 C60,35 70,30 80,30 H75 C60,30 50,40 50,50 L45,35 C40,25 30,20 20,20 V25 C25,25 35,30 35,45 L30,55 Z" />
    </svg>
  ),
  Jeep: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-full h-full" fill="none">
      <text x="50" y="36" fontFamily="sans-serif" fontWeight="900" fontSize="28" fill={color} textAnchor="middle" letterSpacing="-1">Jeep</text>
    </svg>
  ),
  Dodge: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-full h-full" fill="none">
      <text x="45" y="36" fontFamily="sans-serif" fontWeight="900" fontSize="24" fontStyle="italic" fill={color} textAnchor="middle">DODGE</text>
      <path d="M72,15 L85,15 L77,35 L64,35 Z" fill="#E60012" />
      <path d="M82,15 L95,15 L87,35 L74,35 Z" fill="#E60012" />
    </svg>
  ),
  Ram: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-full h-full" fill="none" stroke={color} strokeWidth="4">
      <path d="M20,10 H80 L75,40 C75,55 50,70 50,70 C50,70 25,55 25,40 Z" />
      <path d="M35,25 C30,15 45,15 50,30 C55,15 70,15 65,25 C60,35 50,38 50,45 Z" fill={color} stroke="none" />
    </svg>
  ),
}

// ─── TECHNICAL SCHEMATIC SVG FALLBACKS ────────────────────────────────────────

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
  const result = useCatalogSearch(state, browseAll)
  const parts = result.error ? [] : result.data?.items || []
  const totalCount = result.error ? 0 : result.data?.totalCount || 0
  const page = state.page
  const totalPages = Math.max(1, result.data?.totalPages || 1)
  const loading = result.loading
  const requestedVin = state.vin
  const isVinMatched = state.scope === 'vin' && !!result.vin?.matched
  const activeGroup = state.group || 'ALL'
  const filterQuery = state.filter
  const vinError = result.error ? t(result.error, { defaultValue: t('error') }) : ''
  const vehicleMeta = state.scope === 'vin'
    ? { ...result.vin?.meta, vin: requestedVin, oem: result.vin?.meta.make, vehicle: undefined }
    : { vin: undefined, make: state.make, oem: state.make, model: state.model, modelYear: state.year,
        series: state.vehicleSeries, engineFamily: state.engineFamily, transmission: state.transmission,
        marketSpec: state.marketSpec, steering: state.steering, vehicle: undefined }
  const availableGroups = ['ALL', ...new Set([state.group, ...parts.map(p => p.groupName?.trim() || '')].filter(Boolean))]
  const displayParts = parts
  function updateSearch(patch: Partial<CatalogSearchState>) {
    setSearchParams(writeSearch({ ...state, ...patch }))
  }
  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages || loading) return
    updateSearch({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function handleGroupSelect(group: string) {
    updateSearch({ group: group === 'ALL' ? '' : group, page: 1 })
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

  const getBrandLogo = (makeName: string | null | undefined, color = 'currentColor') => {
    if (!makeName) return null
    const normalized = makeName.charAt(0).toUpperCase() + makeName.slice(1).toLowerCase()
    const logoFn = BRAND_LOGOS[normalized] || BRAND_LOGOS[makeName]
    return logoFn ? logoFn(color) : null
  }

  const activeOem = vehicleMeta.make || t('any')
  const activeModel = vehicleMeta.model || ''

  return (
    <div className="flex-grow flex flex-col font-sans">
      {/* Top Breadcrumbs */}
      <div className="bg-slate-50 dark:bg-brand-card border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium select-none">
        <Link to="/" className="hover:text-amber-600 flex items-center">
          <Home className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600" />
        </Link>
        <span>•</span>
        <Link to="/" className="hover:text-amber-500">Genuine Parts Catalogs</Link>
        <span>•</span>
        {vehicleMeta.make || state.make ? (
          <Link
            to={`/brands/${encodeURIComponent(vehicleMeta.make || state.make || activeOem)}`}
            className="text-slate-800 dark:text-slate-200 font-bold uppercase hover:text-[#00C853] hover:underline"
          >
            {activeOem}
          </Link>
        ) : (
          <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">
            {activeOem}
          </span>
        )}
        <span>•</span>
        <span className="text-slate-500 font-mono text-[10px]">
          {requestedVin || state.q || 'PARTS CATALOG'}
        </span>
        {activeModel && (
          <>
            <span>•</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">
              {activeModel}
            </span>
          </>
        )}
        <span>•</span>
        <span className="text-[#00C853] font-extrabold uppercase">
          {activeGroup === 'ALL' ? 'ALL GROUPS' : activeGroup}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-6 flex-grow">
        <div className="mb-5 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <CatalogSearchForm key={writeSearch(state)} state={state} decodedMake={result.vin?.meta.make} onSearch={next => setSearchParams(writeSearch(next))} />
        </div>
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          {requestedVin && <p className="font-bold">{t('customerVin')}: <bdi className="font-mono">{requestedVin}</bdi></p>}
          {loading ? <p>{t('loading')}</p> : vinError ? <><p role="alert">{vinError}</p><button type="button" className="mt-2 underline" onClick={result.retry}>{t('retry')}</button></> : (
            <>
              {state.scope === 'vin' && result.vin && <p>{t('identity')}: <bdi>{[vehicleMeta.make, vehicleMeta.model, vehicleMeta.modelYear].filter(Boolean).join(' ') || t('unknown')}</bdi></p>}
              {state.q && identifyInput(state.q, state.mode) === 'number' && <p><bdi>{state.q}</bdi> — {t('numberMatches')}</p>}
              {state.scope === 'global' && (identifyInput(state.q, state.mode) === 'name' || state.filter) && <p className="mt-1 text-xs">{t('groupedMakes')}</p>}
              <p className="mt-1 font-bold">{totalCount} {t('records')}</p>
              <p>{state.scope === 'vin' ? t(isVinMatched ? 'exact' : 'guided') : state.scope === 'catalog' ? t('catalog') : t(state.q || state.filter ? 'global' : browseAll ? 'browseAll' : 'noInput')}</p>
              {state.scope === 'vin' && !isVinMatched && <Link to={`/requests/new?vin=${encodeURIComponent(requestedVin)}`} className="mt-2 inline-block font-bold underline">{t('request')}</Link>}
            </>
          )}
        </div>
        {state.scope !== 'global' && <>
        {/* Vehicle Metadata Header */}
        <h2 className="text-sm font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wide">
          {activeOem} Parts Catalog {activeModel ? `— ${activeModel}` : ''}
        </h2>

        {/* Vehicle Info Table Card */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded mb-6 select-none shadow-sm bg-white dark:bg-brand-card">
          <Table>
            <TableHeader className="bg-slate-100 dark:bg-[#0D1810] text-slate-600 dark:text-[#7A9A80] font-bold uppercase">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-4 py-2 text-[11px]">Brand / OEM</TableHead>
                <TableHead className="px-4 py-2 text-[11px]">Model</TableHead>
                <TableHead className="px-4 py-2 text-[11px]">Year</TableHead>
                <TableHead className="px-4 py-2 text-[11px] font-mono">VIN / Vehicle ID</TableHead>
                <TableHead className="px-4 py-2 text-[11px]">Series</TableHead>
                <TableHead className="px-4 py-2 text-[11px]">Assembly Groups</TableHead>
                <TableHead className="px-4 py-2 text-[11px]">Total Parts</TableHead>
                <TableHead className="px-4 py-2 text-[11px] text-center">Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-700 dark:text-[#C5DEC8] font-medium">
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 min-w-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-0.5 flex items-center justify-center shrink-0">
                      <img
                        src={getBrandLogoPath(activeOem)}
                        alt={activeOem}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'block'
                          }
                        }}
                      />
                      <div className="w-full h-full hidden">
                        {getBrandLogo(activeOem)}
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase">
                      {activeOem}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 font-bold uppercase text-slate-800 dark:text-white">
                  {activeModel}
                </TableCell>
                <TableCell className="px-4 py-2">
                  {vehicleMeta.modelYear || t('unknown')}
                </TableCell>
                <TableCell className="px-4 py-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {vehicleMeta.vin || vehicleMeta.vehicle || 'CATALOG SEARCH'}
                </TableCell>
                <TableCell className="px-4 py-2 text-[11px]">
                  {vehicleMeta.series || t('unknown')}
                </TableCell>
                <TableCell className="px-4 py-2 text-[11px]">
                  {availableGroups.length - 1} Categories
                </TableCell>
                <TableCell className="px-4 py-2">
                  <span className="font-bold text-emerald-600 dark:text-[#00C853]">
                    {totalCount} {t('records')}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <Info className="w-4 h-4 text-slate-400 mx-auto cursor-pointer hover:text-slate-600" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        </>}

        {/* Catalog Navigation Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-[#00C853] mb-5">
          <button className="bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
            <ListFilter className="w-3.5 h-3.5" />
            {t('groups')} ({availableGroups.length - 1})
          </button>
          <button className="bg-white dark:bg-brand-card border border-slate-200 dark:border-slate-800 border-b-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-500 text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
            <Package className="w-3.5 h-3.5" />
            Loaded Parts ({displayParts.length})
          </button>
        </div>

        {/* Main Grid + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Category Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <form key={filterQuery} className="mb-4 space-y-2" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); updateSearch({ filter: String(data.get('filter') || '').trim(), page: 1 }) }}>
              <label className="text-xs" htmlFor="part-result-filter">{t('filter')}</label>
              <input id="part-result-filter" name="filter" defaultValue={filterQuery} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-brand-card" />
              <button type="submit" className="text-sm font-semibold text-emerald-700 underline dark:text-emerald-300">{t('filterSubmit')}</button>
              <label className="block text-xs" htmlFor="part-sort">{t('sort')}</label>
              <select id="part-sort" value={state.sort} onChange={e => updateSearch({ sort: e.target.value, page: 1 })} className="w-full rounded border bg-white p-2 text-sm dark:bg-brand-card"><option value="">{t('defaultSort')}</option><option value="asc">{t('asc')}</option><option value="desc">{t('desc')}</option></select>
            </form>

            <div className="sticky top-[100px]">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {t('groups')}
              </h3>
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {availableGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => handleGroupSelect(group)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between font-bold tracking-wide border border-transparent',
                      activeGroup === group
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#00C853] border-emerald-300 dark:border-emerald-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <span className="truncate mr-1">{group === 'ALL' ? t('allGroups') : group}</span>
                    {activeGroup === group && (
                      <span className="bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        {totalCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Parts Grid */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {activeGroup === 'ALL' ? 'All Catalog Components' : activeGroup}
                {filterQuery.trim() && (
                  <span className="text-emerald-600 dark:text-[#00C853] font-normal ml-2 lowercase">
                    (matching &ldquo;{filterQuery.trim()}&rdquo;)
                  </span>
                )}
              </h3>
              {totalCount > 0 && (
                <span className="text-xs font-mono text-slate-500">
                  Page {page} of {totalPages} ({totalCount} parts total)
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-[#00C853] animate-spin mb-2" />
                <p className="text-slate-400 text-xs font-semibold font-sans">Searching catalog in database...</p>
              </div>
            ) : displayParts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-brand-card rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {t(result.error ? 'error' : 'empty')}
                </h4>
                {!browseAll && !requestedVin && !state.q && !state.make && !state.model && !state.filter && <p className="mb-4 text-sm">{t('noInput')}</p>}
                {!result.error && state.q.includes(' ') && identifyInput(state.q, state.mode) === 'name' && state.q.split(/\s+/).filter(word => word.length > 2).map(word => <button key={word} type="button" className="m-1 text-sm underline" onClick={() => updateSearch({ q: word, mode: 'name', page: 1 })}>{t('submit')}: <bdi>{word}</bdi></button>)}
                {!result.error && state.mode === 'number' && state.q.includes('-') && <button type="button" className="m-1 text-sm underline" onClick={() => updateSearch({ q: state.q.replace(/-/g, ''), page: 1 })}>{t('submit')}: <bdi>{state.q.replace(/-/g, '')}</bdi></button>}
                {!result.error && (state.make || state.vin) && (state.filter || (state.q && identifyInput(state.q, state.mode) !== 'vin')) && <button type="button" className="mb-4 text-sm underline" onClick={() => setSearchParams(writeSearch({ ...readSearch(new URLSearchParams()), q: state.filter || state.q, mode: state.filter ? 'auto' : state.mode }))}>{t('allVehicles')}</button>}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {(filterQuery || activeGroup !== 'ALL') && (
                    <button
                      onClick={() => {
                        updateSearch({ group: '', filter: '', page: 1 })
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t('clearFilters')}
                    </button>
                  )}
                  <Link
                    to={`/requests/new${vehicleMeta.vin ? `?vin=${encodeURIComponent(vehicleMeta.vin)}` : ''}`}
                    className="px-5 py-2.5 bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] font-extrabold text-xs rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Request Custom Parts Sourcing
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayParts.map((part, index) => {
                    return (
                      <div
                        key={`${part.id}-${part.partNumber}-${index}`}
                        role="button" tabIndex={0} aria-label={`${part.partName} ${part.partNumber}`}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePartClick(part, index) } }}
                        data-testid="catalog-part" data-part-number={part.partNumber} onClick={() => handlePartClick(part, index)}
                        className="bg-white dark:bg-brand-card border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-col justify-between cursor-pointer hover:border-slate-400 dark:hover:border-[#00C853] shadow-sm transition-all duration-200 group"
                      >
                        {/* Diagram / Component Image */}
                        <div className="aspect-[4/3] bg-white dark:bg-[#F8FAFC] border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-center justify-center p-2 mb-3 shadow-xs overflow-hidden relative group/img">
                          <PartImage src={part.imageUrl} alt={part.partName} className="max-h-full max-w-full object-contain" />
                          {part.pnc && (
                            <span className="absolute top-1.5 left-1.5 bg-slate-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold tracking-tight shadow-xs">
                              PNC {part.pnc}
                            </span>
                          )}
                        </div>

                        {/* Part Details */}
                        <div>
                          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:underline leading-snug break-words block">
                            {part.partNumber}: {part.partName.toUpperCase()}
                          </span>
                          {part.groupName && (
                            <span className="text-[10px] text-slate-400 mt-1 font-semibold truncate block">
                              {part.groupName} {part.subgroupName ? `› ${part.subgroupName}` : ''}
                            </span>
                          )}
                          {part.replacePart && part.replacePart !== '[ ]' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded mt-1">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Replaces: {part.replacePart}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 select-none">
                    <div className="text-xs text-slate-500 font-medium">
                      Showing Page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} total parts)
                    </div>

                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-xs transition-colors disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>

                      {getPageNumbers(page, totalPages).map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={idx} className="px-2 py-1 text-xs text-slate-400 font-mono">
                              ...
                            </span>
                          )
                        }
                        const pageNum = p as number
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              page === pageNum
                                ? 'bg-[#00C853] text-[#07110A] shadow-sm'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-xs transition-colors disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
                  <p className="mb-3 text-sm text-slate-500">{t('priceNote')}</p>
                  <Link
                    to={`/requests/new?${new URLSearchParams({ vin: requestedVin, make: state.make || selectedPart.make || selectedPart.oem || '', model: state.model || '', year: state.year, partNumber: selectedPart.partNumber, partName: selectedPart.partName })}`}
                    className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 px-3 text-center text-sm font-bold text-white hover:bg-emerald-700"
                  >{t('quotation')}</Link>
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
