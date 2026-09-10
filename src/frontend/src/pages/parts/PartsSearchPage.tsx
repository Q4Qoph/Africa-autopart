import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  ListFilter,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { catalogApi } from '@/api/catalogApi'
import type {
  CatalogPartItem,
  VehicleVinResponse,
  PaginatedPartsResponse,
  NhtsaVinDecodeResponse,
} from '@/types/catalog'
import { useExternalCart } from '@/context/ExternalCartContext'
import { Button } from '@/components/ui/button'
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

function DiagramSVG({ code }: { code: number }) {
  switch (code) {
    case 1:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="15" y="10" width="70" height="40" rx="3" />
          <circle cx="35" cy="30" r="10" strokeDasharray="3 2" />
          <line x1="15" y1="20" x2="85" y2="20" />
          <line x1="50" y1="10" x2="50" y2="50" strokeDasharray="4 2" />
          <circle cx="65" cy="35" r="5" />
          <path d="M25,60 L75,60 M35,70 L65,70" strokeWidth="1" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="25" y="15" width="50" height="50" rx="2" />
          <circle cx="50" cy="35" r="16" />
          <circle cx="50" cy="35" r="2" fill="currentColor" stroke="none" />
          <path d="M50,15 L50,35" strokeWidth="2" />
          <path d="M50,35 L62,55" strokeWidth="2" />
          <line x1="20" y1="15" x2="80" y2="15" strokeWidth="2" />
          <line x1="30" y1="65" x2="70" y2="65" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="10" y="15" width="80" height="50" rx="4" />
          <circle cx="25" cy="40" r="10" />
          <circle cx="50" cy="40" r="10" />
          <circle cx="75" cy="40" r="10" />
          <circle cx="25" cy="40" r="3" fill="currentColor" stroke="none" />
          <circle cx="50" cy="40" r="3" fill="currentColor" stroke="none" />
          <circle cx="75" cy="40" r="3" fill="currentColor" stroke="none" />
          <line x1="10" y1="25" x2="90" y2="25" strokeDasharray="4 2" />
          <line x1="10" y1="55" x2="90" y2="55" strokeDasharray="4 2" />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M15,20 L85,20 L75,60 L25,60 Z" />
          <circle cx="35" cy="40" r="8" />
          <circle cx="65" cy="40" r="8" />
          <path d="M20,30 L80,30 M25,50 L75,50" strokeDasharray="2 2" />
          <rect x="42" y="10" width="16" height="10" />
        </svg>
      )
    case 5:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="20" y="10" width="60" height="60" rx="3" />
          <circle cx="50" cy="30" r="12" />
          <path d="M50,30 L38,55 M50,30 L62,55" strokeWidth="2" />
          <circle cx="38" cy="55" r="4" fill="currentColor" stroke="none" />
          <circle cx="62" cy="55" r="4" fill="currentColor" stroke="none" />
          <line x1="15" y1="70" x2="85" y2="70" strokeWidth="3" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="20" y="20" width="60" height="40" rx="2" />
          <circle cx="50" cy="40" r="10" />
        </svg>
      )
  }
}

function getDiagramIndex(partName: string): number {
  let hash = 0
  for (let i = 0; i < partName.length; i++) {
    hash = partName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash % 5) + 1
}

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

export default function PartsSearchPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { addItem } = useExternalCart()

  // Location state payload from HomePage or previous navigation
  const locationState = location.state as {
    vehicleVinResponse?: VehicleVinResponse
    searchResults?: PaginatedPartsResponse
    nhtsaDecode?: NhtsaVinDecodeResponse
    vin?: string
    searchTerm?: string
    model?: string
    make?: string
    modelYear?: string
  } | undefined

  // URL Query Parameters fallback
  const urlVin = searchParams.get('vin') || undefined
  const urlMake = searchParams.get('make') || undefined
  const urlModel = searchParams.get('model') || undefined
  const urlSearch = searchParams.get('q') || searchParams.get('searchTerm') || searchParams.get('keyword') || undefined
  const urlGroup = searchParams.get('groupName') || undefined

  // Initial Part List extraction
  const initialParts: CatalogPartItem[] = useMemo(() => {
    if (locationState?.searchResults?.items) return locationState.searchResults.items
    if (locationState?.vehicleVinResponse?.parts) {
      return Array.isArray(locationState.vehicleVinResponse.parts)
        ? locationState.vehicleVinResponse.parts
        : locationState.vehicleVinResponse.parts.items || []
    }
    return []
  }, [locationState])

  // Main state variables
  const [parts, setParts] = useState<CatalogPartItem[]>(initialParts)
  const [vehicleMeta, setVehicleMeta] = useState<{
    vin?: string | null
    make?: string | null
    model?: string | null
    modelYear?: string | null
    series?: string | null
    vehicle?: string | null
    oem?: string | null
    manufacturer?: string | null
    fuel?: string | null
    transmission?: string | null
    displacementCC?: string | null
    engineFamily?: string | null
    engineType?: string | null
    steering?: string | null
    body?: string | null
    marketSpec?: string | null
  }>({
    vin: locationState?.vehicleVinResponse?.vin || locationState?.nhtsaDecode?.vin || locationState?.vin || urlVin,
    make: locationState?.make || locationState?.nhtsaDecode?.make || locationState?.vehicleVinResponse?.decoded?.make || urlMake,
    model: locationState?.model || locationState?.vehicleVinResponse?.model || locationState?.nhtsaDecode?.model || urlModel,
    modelYear: locationState?.modelYear || locationState?.vehicleVinResponse?.modelYear || locationState?.nhtsaDecode?.modelYear,
    series: locationState?.vehicleVinResponse?.series || locationState?.nhtsaDecode?.series,
    vehicle: locationState?.vehicleVinResponse?.vehicle,
    oem: locationState?.make || locationState?.vehicleVinResponse?.decoded?.make || urlMake,
    manufacturer: locationState?.nhtsaDecode?.manufacturer,
    fuel: initialParts[0]?.fuel,
    transmission: initialParts[0]?.transmission,
    displacementCC: initialParts[0]?.displacementCC,
    engineFamily: initialParts[0]?.engineFamily,
    engineType: initialParts[0]?.engineType,
    steering: initialParts[0]?.steering,
    body: initialParts[0]?.body,
    marketSpec: initialParts[0]?.marketSpec,
  })

  // Pagination & Filtering state
  const [page, setPage] = useState<number>(
    locationState?.searchResults?.pageNumber || locationState?.searchResults?.page || 1
  )
  const [totalPages, setTotalPages] = useState<number>(
    locationState?.searchResults?.totalPages || 1
  )
  const [totalCount, setTotalCount] = useState<number>(
    locationState?.searchResults?.totalCount || initialParts.length
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [activeGroup, setActiveGroup] = useState<string>(urlGroup || 'ALL')
  const [filterQuery, setFilterQuery] = useState<string>('')
  const [apiGroups, setApiGroups] = useState<string[]>([])

  // Modal State
  const [selectedPart, setSelectedPart] = useState<CatalogPartItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState(0)
  const [copiedPartNumber, setCopiedPartNumber] = useState(false)

  // Fetch available category groups from API
  useEffect(() => {
    catalogApi.getPartGroups()
      .then((groups) => {
        if (groups && groups.length > 0) {
          setApiGroups(groups)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-fetch if direct URL navigation or missing parts
  useEffect(() => {
    if (parts.length > 0) {
      // populate technical specs from first part if available
      if (parts[0]) {
        setVehicleMeta((prev) => ({
          ...prev,
          make: prev.make || parts[0].make || parts[0].oem,
          model: prev.model || parts[0].model,
          modelYear: prev.modelYear || parts[0].modelYear,
          series: prev.series || parts[0].vehicleSeries || parts[0].series,
          oem: prev.oem || parts[0].oem || parts[0].make,
          fuel: prev.fuel || parts[0].fuel,
          transmission: prev.transmission || parts[0].transmission,
          displacementCC: prev.displacementCC || parts[0].displacementCC,
          engineFamily: prev.engineFamily || parts[0].engineFamily,
          engineType: prev.engineType || parts[0].engineType,
          steering: prev.steering || parts[0].steering,
          body: prev.body || parts[0].body,
          marketSpec: prev.marketSpec || parts[0].marketSpec,
        }))
      }
      return
    }

    const targetVin = locationState?.vin || urlVin
    const targetSearch = locationState?.searchTerm || urlSearch
    const targetMake = locationState?.make || urlMake
    const targetModel = locationState?.model || urlModel

    if (targetVin && /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/.test(targetVin)) {
      setLoading(true)
      catalogApi.getVehicleByVin(targetVin, 1, 20)
        .then(async (res) => {
          const partsList = Array.isArray(res.parts) ? res.parts : (res.parts?.items || [])
          const totalParts = Array.isArray(res.parts) ? res.parts.length : (res.parts?.totalCount || partsList.length)
          const pages = Array.isArray(res.parts) ? Math.ceil(partsList.length / 20) || 1 : (res.parts?.totalPages || 1)

          if (res.matchedInCatalog || partsList.length > 0) {
            setParts(partsList)
            setPage(1)
            setTotalPages(pages)
            setTotalCount(totalParts)
            const first = partsList[0]
            setVehicleMeta({
              vin: targetVin,
              model: res.model || res.decoded?.model || first?.model,
              make: res.decoded?.make || first?.oem || first?.make,
              modelYear: res.modelYear || (res.decoded?.modelYear ? String(res.decoded.modelYear) : first?.modelYear),
              series: res.series || first?.vehicleSeries,
              vehicle: res.vehicle,
              oem: first?.oem || res.decoded?.make,
              fuel: first?.fuel,
              transmission: first?.transmission,
              displacementCC: first?.displacementCC,
              engineFamily: first?.engineFamily,
              engineType: first?.engineType,
              steering: first?.steering,
              body: first?.body,
              marketSpec: first?.marketSpec,
            })
          } else {
            // Not in internal catalog, fallback decode
            const decoded = await catalogApi.decodeVinFallback(targetVin)
            const modelTerm = decoded.model?.trim() || ''
            const makeTerm = decoded.make?.trim() || ''

            const searchRes = await catalogApi.searchVehicles({
              model: modelTerm || undefined,
              make: makeTerm || undefined,
              page: 1,
              pageSize: 20,
            })

            setParts(searchRes.items || [])
            setPage(searchRes.page || 1)
            setTotalPages(searchRes.totalPages || 1)
            setTotalCount(searchRes.totalCount || 0)
            const first = searchRes.items?.[0]
            setVehicleMeta({
              vin: targetVin,
              model: decoded.model || first?.model || null,
              make: decoded.make || first?.oem || null,
              oem: decoded.make || first?.oem || null,
              modelYear: decoded.modelYear,
              series: decoded.series || decoded.trim || first?.vehicleSeries,
              manufacturer: decoded.manufacturer,
              fuel: first?.fuel,
              transmission: first?.transmission,
              displacementCC: first?.displacementCC,
              engineFamily: first?.engineFamily,
              engineType: first?.engineType,
              steering: first?.steering,
              body: first?.body,
              marketSpec: first?.marketSpec,
            })
          }
        })
        .catch(async () => {
          try {
            const decoded = await catalogApi.decodeVinFallback(targetVin)
            setVehicleMeta({
              vin: targetVin,
              model: decoded.model,
              make: decoded.make,
              modelYear: decoded.modelYear,
              manufacturer: decoded.manufacturer,
            })
          } catch (e) {
            console.warn('Fallback decode failed:', e)
          }
        })
        .finally(() => setLoading(false))
    } else if (targetMake && targetModel) {
      setLoading(true)
      catalogApi.getPartsByMakeModel(targetMake, targetModel, 1, 20)
        .then((res) => {
          setParts(res.items || [])
          setPage(res.page || 1)
          setTotalPages(res.totalPages || 1)
          setTotalCount(res.totalCount || 0)
          const first = res.items?.[0]
          if (first) {
            setVehicleMeta({
              make: targetMake,
              model: targetModel,
              modelYear: first.modelYear,
              oem: first.oem || targetMake,
              series: first.vehicleSeries || first.series,
              fuel: first.fuel,
              transmission: first.transmission,
              displacementCC: first.displacementCC,
              engineFamily: first.engineFamily,
              engineType: first.engineType,
              steering: first.steering,
              body: first.body,
              marketSpec: first.marketSpec,
            })
          }
        })
        .catch((err) => console.warn('Failed to get parts by make/model:', err))
        .finally(() => setLoading(false))
    } else if (targetSearch || targetMake || targetModel) {
      setLoading(true)
      catalogApi.searchVehicles({
        keyword: targetSearch,
        make: targetMake,
        model: targetModel,
        page: 1,
        pageSize: 20,
      })
        .then((res) => {
          setParts(res.items || [])
          setPage(res.page || 1)
          setTotalPages(res.totalPages || 1)
          setTotalCount(res.totalCount || 0)
          const first = res.items?.[0]
          if (first) {
            setVehicleMeta({
              model: first.model,
              modelYear: first.modelYear,
              oem: first.oem,
              vin: first.vin,
              make: first.make || first.oem,
              series: first.vehicleSeries || first.series,
              fuel: first.fuel,
              transmission: first.transmission,
              displacementCC: first.displacementCC,
              engineFamily: first.engineFamily,
              engineType: first.engineType,
              steering: first.steering,
              body: first.body,
              marketSpec: first.marketSpec,
            })
          }
        })
        .catch((err) => console.warn('Failed to search vehicles:', err))
        .finally(() => setLoading(false))
    }
  }, [parts.length, locationState, urlVin, urlMake, urlModel, urlSearch, urlGroup])

  // Debounced backend search when filterQuery changes
  useEffect(() => {
    const trimmed = filterQuery.trim()
    const timer = setTimeout(() => {
      if (trimmed) {
        setLoading(true)
        catalogApi.searchVehicles({
          keyword: trimmed,
          vin: vehicleMeta.vin || undefined,
          make: vehicleMeta.make || undefined,
          model: vehicleMeta.model || undefined,
          groupName: activeGroup !== 'ALL' ? activeGroup : undefined,
          page: 1,
          pageSize: 20,
        })
          .then((res) => {
            setParts(res.items || [])
            setPage(res.page || 1)
            setTotalPages(res.totalPages || 1)
            setTotalCount(res.totalCount || 0)
          })
          .catch((err) => console.warn('Global part search failed:', err))
          .finally(() => setLoading(false))
      } else if (parts.length > 0 && vehicleMeta.vin) {
        // If filter is cleared, restore page 1 of full vehicle catalog
        setLoading(true)
        catalogApi.getVehicleByVin(vehicleMeta.vin, 1, 20)
          .then((res) => {
            const partsList = Array.isArray(res.parts) ? res.parts : (res.parts?.items || [])
            const totalParts = Array.isArray(res.parts) ? res.parts.length : (res.parts?.totalCount || partsList.length)
            const pages = Array.isArray(res.parts) ? Math.ceil(partsList.length / 20) || 1 : (res.parts?.totalPages || 1)
            setParts(partsList)
            setPage(1)
            setTotalPages(pages)
            setTotalCount(totalParts)
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [filterQuery, activeGroup])

  // Extract unique groups from both API and current parts
  const availableGroups = useMemo(() => {
    const fromParts = parts.map((p) => p.groupName?.trim()).filter(Boolean) as string[]
    const combined = Array.from(new Set([...apiGroups, ...fromParts])).filter(Boolean)
    return ['ALL', ...combined]
  }, [parts, apiGroups])

  // Current parts list for active view
  const displayParts = parts

  // Handle Server-Side Page Change
  async function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages || loading) return
    setLoading(true)
    try {
      const trimmed = filterQuery.trim()
      if (trimmed) {
        const res = await catalogApi.searchVehicles({
          keyword: trimmed,
          vin: vehicleMeta.vin || undefined,
          make: vehicleMeta.make || undefined,
          model: vehicleMeta.model || undefined,
          groupName: activeGroup !== 'ALL' ? activeGroup : undefined,
          page: newPage,
          pageSize: 20,
        })
        setParts(res.items || [])
        setPage(res.page || newPage)
        setTotalPages(res.totalPages || 1)
        setTotalCount(res.totalCount || 0)
      } else if (vehicleMeta.vin && /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/.test(vehicleMeta.vin)) {
        const res = await catalogApi.getVehicleByVin(vehicleMeta.vin, newPage, 20)
        const partsList = Array.isArray(res.parts) ? res.parts : (res.parts?.items || [])
        const totalParts = Array.isArray(res.parts) ? res.parts.length : (res.parts?.totalCount || partsList.length)
        const pages = Array.isArray(res.parts) ? Math.ceil(partsList.length / 20) || 1 : (res.parts?.totalPages || 1)

        setParts(partsList)
        setPage(newPage)
        setTotalPages(pages)
        setTotalCount(totalParts)
      } else {
        const res = await catalogApi.searchVehicles({
          make: vehicleMeta.make || undefined,
          model: vehicleMeta.model || undefined,
          keyword: locationState?.searchTerm || urlSearch || undefined,
          groupName: activeGroup !== 'ALL' ? activeGroup : undefined,
          page: newPage,
          pageSize: 20,
        })
        setParts(res.items || [])
        setPage(res.page || newPage)
        setTotalPages(res.totalPages || 1)
        setTotalCount(res.totalCount || 0)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Page change error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Group Selection
  async function handleGroupSelect(group: string) {
    setActiveGroup(group)
    setPage(1)
    setLoading(true)
    try {
      const res = await catalogApi.searchVehicles({
        vin: vehicleMeta.vin || undefined,
        make: vehicleMeta.make || undefined,
        model: vehicleMeta.model || undefined,
        keyword: filterQuery.trim() || undefined,
        groupName: group !== 'ALL' ? group : undefined,
        page: 1,
        pageSize: 20,
      })
      setParts(res.items || [])
      setPage(1)
      setTotalPages(res.totalPages || 1)
      setTotalCount(res.totalCount || 0)
    } catch (err) {
      console.warn('Group filter change failed:', err)
    } finally {
      setLoading(false)
    }
  }

  function handlePartClick(part: CatalogPartItem, idx: number) {
    setSelectedPart(part)
    setCurrentPartIndex(idx)
    setModalOpen(true)
  }

  function goToPrev() {
    if (currentPartIndex <= 0) return
    const newIdx = currentPartIndex - 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(displayParts[newIdx])
  }

  function goToNext() {
    if (currentPartIndex >= displayParts.length - 1) return
    const newIdx = currentPartIndex + 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(displayParts[newIdx])
  }

  function handleAddToCart() {
    if (!selectedPart) return
    const part = selectedPart
    const cartItem = {
      name: part.partName,
      partNumber: part.partNumber,
      price: '$45.00',
      originalPrice: '',
      supplier: part.source || part.oem || 'Genuine OEM Supplier',
      availability: true,
      location: part.model || 'Genuine Parts Warehouse',
      imageURL: part.imageUrl || '',
    }
    addItem(cartItem)
    setModalOpen(false)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedPart(null)
  }

  const canGoPrev = currentPartIndex > 0
  const canGoNext = currentPartIndex < displayParts.length - 1

  // Lock body scroll and listen for Escape / Arrow navigation keys when modal is open
  useEffect(() => {
    if (!modalOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft' && canGoPrev) goToPrev()
      if (e.key === 'ArrowRight' && canGoNext) goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalOpen, canGoPrev, canGoNext, currentPartIndex])

  const getBrandLogo = (makeName: string | null | undefined, color = 'currentColor') => {
    if (!makeName) return null
    const normalized = makeName.charAt(0).toUpperCase() + makeName.slice(1).toLowerCase()
    const logoFn = BRAND_LOGOS[normalized] || BRAND_LOGOS[makeName]
    return logoFn ? logoFn(color) : null
  }

  const activeOem = vehicleMeta.oem || vehicleMeta.make || parts[0]?.oem || 'OEM'
  const activeModel = vehicleMeta.model || parts[0]?.model || 'CATALOG'

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
        <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">
          {activeOem}
        </span>
        <span>•</span>
        <span className="text-slate-500 font-mono text-[10px]">
          {vehicleMeta.vin || locationState?.searchTerm || 'PARTS CATALOG'}
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
        {/* Decoded VIN Notification Banner with Make Image */}
        {(locationState?.nhtsaDecode || locationState?.vehicleVinResponse || locationState?.vin || vehicleMeta.vin) && (
          <div
            className={cn(
              'mb-4 border rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs',
              vehicleMeta.make || vehicleMeta.model || activeOem !== 'OEM'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            )}
          >
            <div className="flex items-center gap-3">
              {/* Make Image Badge */}
              {(vehicleMeta.make || activeOem) && (
                <div className="h-10 w-10 min-w-[40px] rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shadow-xs shrink-0">
                  <img
                    src={getBrandLogoPath(vehicleMeta.make || activeOem)}
                    alt={vehicleMeta.make || activeOem}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 font-bold">
                  {vehicleMeta.make || vehicleMeta.model || activeOem !== 'OEM' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <span>
                    {vehicleMeta.make || vehicleMeta.model || activeOem !== 'OEM' ? (
                      <>
                        VIN <strong className="font-mono">{vehicleMeta.vin || locationState?.vin}</strong> decoded as{' '}
                        <strong className="uppercase">{vehicleMeta.make || activeOem} {vehicleMeta.model || activeModel}</strong> {vehicleMeta.modelYear ? `(${vehicleMeta.modelYear})` : ''}. Displaying matching catalog components.
                      </>
                    ) : (
                      <>
                        VIN <strong className="font-mono">{vehicleMeta.vin || locationState?.vin}</strong> was not found in our catalog and could not be verified by NHTSA.
                      </>
                    )}
                  </span>
                </div>
                {vehicleMeta.manufacturer && (
                  <p className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 ml-5.5">
                    Manufacturer: {vehicleMeta.manufacturer}
                  </p>
                )}
              </div>
            </div>
            {totalCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0">
                {totalCount} parts found
              </span>
            )}
          </div>
        )}

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
                  {vehicleMeta.modelYear || parts[0]?.modelYear || 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {vehicleMeta.vin || vehicleMeta.vehicle || 'CATALOG SEARCH'}
                </TableCell>
                <TableCell className="px-4 py-2 text-[11px]">
                  {vehicleMeta.series || parts[0]?.series || 'Standard Series'}
                </TableCell>
                <TableCell className="px-4 py-2 text-[11px]">
                  {availableGroups.length - 1} Categories
                </TableCell>
                <TableCell className="px-4 py-2">
                  <span className="font-bold text-emerald-600 dark:text-[#00C853]">
                    {totalCount} catalog parts
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <Info className="w-4 h-4 text-slate-400 mx-auto cursor-pointer hover:text-slate-600" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Catalog Navigation Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-[#00C853] mb-5">
          <button className="bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
            <ListFilter className="w-3.5 h-3.5" />
            Assembly Groups ({availableGroups.length - 1})
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
            <div className="mb-4">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search part number, PNC, or name across catalog..."
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-brand-card rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#00C853] transition-colors shadow-inner"
              />
            </div>

            <div className="sticky top-[100px]">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Catalog Categories
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
                    <span className="truncate mr-1">{group === 'ALL' ? 'ALL GROUPS' : group}</span>
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
                  {filterQuery.trim() ? `No Parts Matching "${filterQuery.trim()}"` : 'No Catalog Parts Found'}
                </h4>
                <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
                  {filterQuery.trim()
                    ? `No components match "${filterQuery.trim()}" in the ${activeGroup === 'ALL' ? 'entire catalog' : activeGroup + ' group'}. Try a different part number or PNC code.`
                    : vehicleMeta.vin
                      ? `We could not find ingested catalog components for VIN ${vehicleMeta.vin}. Our procurement team can source genuine components directly for you.`
                      : 'No parts match your current selection.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {(filterQuery || activeGroup !== 'ALL') && (
                    <button
                      onClick={() => {
                        setActiveGroup('ALL')
                        setFilterQuery('')
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Clear Search & Filters
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
                    const diagIndex = getDiagramIndex(part.partName)
                    return (
                      <div
                        key={`${part.id}-${part.partNumber}-${index}`}
                        onClick={() => handlePartClick(part, index)}
                        className="bg-white dark:bg-brand-card border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-col justify-between cursor-pointer hover:border-slate-400 dark:hover:border-[#00C853] shadow-sm transition-all duration-200 group"
                      >
                        {/* Diagram / Component Image */}
                        <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded flex items-center justify-center p-2 mb-3 shadow-inner overflow-hidden relative">
                          {part.imageUrl ? (
                            <img
                              src={part.imageUrl}
                              alt={part.partName}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <DiagramSVG code={diagIndex} />
                          )}
                          {part.pnc && (
                            <span className="absolute top-1 right-1 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
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
          <div className="relative z-10 bg-white dark:bg-brand-card rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden my-auto">
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
              {/* Left Column: Clear Full Image / Schematic */}
              <div className="p-6 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-950/40 relative min-h-[300px] md:min-h-[420px]">
                {selectedPart.pnc && (
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded shadow-sm">
                    PNC {selectedPart.pnc}
                  </div>
                )}
                {selectedPart.picId && (
                  <div className="absolute top-4 right-4 z-10 bg-blue-600/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded shadow-sm">
                    PIC {selectedPart.picId}
                  </div>
                )}
                
                <div className="w-full h-full flex items-center justify-center p-2">
                  {selectedPart.imageUrl ? (
                    <img
                      src={selectedPart.imageUrl}
                      alt={selectedPart.partName}
                      className="max-h-[340px] max-w-full object-contain rounded-lg drop-shadow-md hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full max-w-[260px] aspect-square flex items-center justify-center">
                      <DiagramSVG code={getDiagramIndex(selectedPart.partName)} />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium text-center mt-3">
                  {selectedPart.imageUrl ? 'Genuine OEM Component Diagram & Spec Image' : 'Schematic Technical Layout'}
                </p>
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
                      <span className="text-slate-400 font-medium">Availability</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Stock ({selectedPart.quantity || 1} required)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400">UNIT PRICE</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-500">
                      $45.00
                    </span>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] font-extrabold text-sm h-12 flex items-center justify-center gap-2 rounded-lg border-0 transition-colors shadow-md"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    ADD TO BASKET
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
