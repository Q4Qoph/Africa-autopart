// src/frontend/src/pages/parts/PartsSearchPage.tsx
import { useEffect, useState, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Package,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  ListFilter,
  Search,
} from 'lucide-react'
import { vinApi } from '@/api/vinApi'
import type { VinSearchResponse, VinSearchPart } from '@/types/vin'
import { useExternalCart } from '@/context/ExternalCartContext'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── BRAND LOGOS (Same as home page for consistency in the vehicle info block) ──────────

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



// ─── TECHNICAL DIAGRAM VECTORS (Schematic Drawings) ────────────────────────────────

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
    case 6:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="35" cy="40" r="16" />
          <circle cx="35" cy="40" r="8" strokeDasharray="2 2" />
          <circle cx="70" cy="30" r="10" />
          <circle cx="70" cy="30" r="4" strokeDasharray="2 2" />
          <path d="M35,24 C50,22 60,20 70,20 C75,20 80,24 80,30 C80,35 75,40 70,40 C55,42 45,46 35,56 C30,56 19,48 19,40 C19,30 25,24 35,24 Z" strokeDasharray="3 3" />
        </svg>
      )
    case 7:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="50" cy="40" r="18" />
          <circle cx="50" cy="40" r="2" fill="currentColor" stroke="none" />
          <rect x="30" y="25" width="5" height="30" />
          <rect x="65" y="25" width="5" height="30" />
          <path d="M40,15 L60,15 M32,15 L32,25 M68,15 L68,25" />
          <circle cx="50" cy="40" r="12" strokeDasharray="4 2" />
        </svg>
      )
    case 8:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M20,15 C20,15 35,15 50,35 C65,55 80,55 80,55" strokeWidth="3" />
          <path d="M20,35 C20,35 35,35 50,45 C65,55 80,55" strokeWidth="3" />
          <path d="M20,55 C20,55 35,55 50,55 C65,55 80,55" strokeWidth="3" />
          <rect x="15" y="10" width="8" height="50" rx="1" />
          <rect x="75" y="50" width="10" height="15" rx="1" />
        </svg>
      )
    case 9:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="35" y="15" width="30" height="50" rx="4" />
          <line x1="35" y1="25" x2="65" y2="25" />
          <line x1="35" y1="35" x2="65" y2="35" strokeDasharray="3 3" />
          <line x1="35" y1="45" x2="65" y2="45" strokeDasharray="3 3" />
          <line x1="35" y1="55" x2="65" y2="55" />
          <circle cx="50" cy="20" r="2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 10:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full max-h-32 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="15" y="20" width="70" height="40" rx="2" />
          <path d="M25,20 L25,60 M35,20 L35,60 M45,20 L45,60 M55,20 L55,60 M65,20 L65,60 M75,20 L75,60" />
          <line x1="15" y1="30" x2="85" y2="30" strokeDasharray="4 2" />
          <line x1="15" y1="50" x2="85" y2="50" strokeDasharray="4 2" />
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
  return Math.abs(hash % 10) + 1
}

// ─── Component ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'ENGINE',
  'TRANSMISSION',
  'CHASSIS',
  'BODY',
  'TRIM',
  'ELECTRICAL',
]

export default function PartsSearchPage() {
  const location = useLocation()
  const { t } = useTranslation('home')
  const { addItem } = useExternalCart()

  const vinSearchDetails = location.state?.vinSearchDetails as VinSearchResponse | undefined
  const [activeCategory, setActiveCategory] = useState<string>('ENGINE')
  const [parts, setParts] = useState<VinSearchPart[]>([])
  const [loadingParts, setLoadingParts] = useState(false)
  const [errorLoadingParts, setErrorLoadingParts] = useState('')
  const [filterQuery, setFilterQuery] = useState<string>('')

  // Modal state
  const [selectedPart, setSelectedPart] = useState<VinSearchPart | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPartIndex, setCurrentPartIndex] = useState(0)

  // Cache to avoid refetching parts when changing categories
  const partsCacheRef = useRef<Record<string, VinSearchPart[]>>({})

  useEffect(() => {
    if (!vinSearchDetails) return

    const cached = partsCacheRef.current[activeCategory]
    if (cached) {
      setParts(cached)
      return
    }

    async function fetchParts() {
      setLoadingParts(true)
      setErrorLoadingParts('')
      try {
        const { data } = await vinApi.searchPartsByCategory(activeCategory, vinSearchDetails!)
        setParts(data)
        partsCacheRef.current[activeCategory] = data
      } catch (err) {
        console.error(err)
        setErrorLoadingParts('Failed to load parts for this category.')
      } finally {
        setLoadingParts(false)
      }
    }

    fetchParts()
  }, [activeCategory, vinSearchDetails])

  // Filter parts locally based on search input
  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(filterQuery.toLowerCase())
  )

  function handlePartClick(part: VinSearchPart, idx: number) {
    setSelectedPart(part)
    setCurrentPartIndex(idx)
    setModalOpen(true)
  }

  function goToPrev() {
    if (currentPartIndex <= 0) return
    const newIdx = currentPartIndex - 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(filteredParts[newIdx])
  }

  function goToNext() {
    if (currentPartIndex >= filteredParts.length - 1) return
    const newIdx = currentPartIndex + 1
    setCurrentPartIndex(newIdx)
    setSelectedPart(filteredParts[newIdx])
  }

  function handleAddToCart() {
    if (!selectedPart) return
    const part = selectedPart
    const cartItem = {
      name: part.name,
      partNumber: part.partNumber,
      price: `$${part.price.toFixed(2)}`,
      originalPrice: '',
      supplier: vinSearchDetails?.manufacturer || 'Genuine OEM Supplier',
      availability: true,
      location: vinSearchDetails?.plantCountry || 'South Korea',
      imageURL: '',
    }
    addItem(cartItem)
    setModalOpen(false)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedPart(null)
  }

  const canGoPrev = currentPartIndex > 0
  const canGoNext = currentPartIndex < filteredParts.length - 1

  const getBrandLogo = (makeName: string | null | undefined, color = 'currentColor') => {
    if (!makeName) return null
    const normalized = makeName.charAt(0).toUpperCase() + makeName.slice(1).toLowerCase()
    const logoFn = BRAND_LOGOS[normalized] || BRAND_LOGOS[makeName]
    return logoFn ? logoFn(color) : null
  }

  if (!vinSearchDetails) {
    return (
      <div className="px-6 md:px-8 py-16 text-center font-sans">
        <h1 className="text-2xl font-black text-slate-800 mb-4">{t('no_vehicle') ?? 'No vehicle selected'}</h1>
        <Link to="/" className="text-sky-600 hover:underline font-bold">{t('back_home') ?? 'Go back and enter a VIN'}</Link>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col font-sans">
      {/* Top Centered Content Area */}
      <div className="flex-grow">
          {/* Breadcrumbs Subbar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium select-none">
            <Link to="/" className="hover:text-amber-600 flex items-center">
              <Home className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600" />
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-amber-500">Genuine Parts Catalogs</Link>
            <span>•</span>
            <span className="text-slate-800 font-bold uppercase">{vinSearchDetails.make || 'UNKNOWN'}</span>
            <span>•</span>
            <span className="text-slate-500 font-mono text-[10px]">{vinSearchDetails.vin}</span>
            <span>•</span>
            <span className="text-slate-800 font-bold uppercase">{vinSearchDetails.model || 'UNKNOWN'}</span>
            <span>•</span>
            <span className="text-[#33b5e5] font-extrabold uppercase">{activeCategory}</span>
          </div>

          {/* Center Content Padding Area */}
          <div className="px-6 py-6">
            
            {/* Vehicle Info Table Card */}
            <h2 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">
              {vinSearchDetails.make || 'UNKNOWN'} Parts Catalogs {vinSearchDetails.model || 'UNKNOWN'}
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded mb-6 select-none shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-[11px] bg-slate-50">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-2">Brand</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Engine</th>
                    <th className="px-4 py-2">Trim</th>
                    <th className="px-4 py-2">Manufacturer</th>
                    <th className="px-4 py-2">Plant</th>
                    <th className="px-4 py-2">Doors</th>
                    <th className="px-4 py-2">Body Class</th>
                    <th className="px-4 py-2 text-center">i</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700 font-medium">
                  <tr>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 text-slate-800 flex items-center justify-center">
                          {getBrandLogo(vinSearchDetails.make)}
                        </div>
                        <span className="font-extrabold text-slate-900">{(vinSearchDetails.make || 'UNKNOWN').toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-bold uppercase">{vinSearchDetails.model || 'N/A'}</td>
                    <td className="px-4 py-2">{vinSearchDetails.modelYear || 'N/A'}</td>
                    <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">
                      {vinSearchDetails.displacementL ? `${vinSearchDetails.displacementL}L` : ''} {vinSearchDetails.fuelTypePrimary || ''}
                    </td>
                    <td className="px-4 py-2">{vinSearchDetails.trim || 'N/A'}</td>
                    <td className="px-4 py-2 font-mono text-[10px]">{vinSearchDetails.manufacturer || 'N/A'}</td>
                    <td className="px-4 py-2 text-[10px]">
                      {vinSearchDetails.plantCity || ''}{vinSearchDetails.plantCity && vinSearchDetails.plantCountry ? ', ' : ''}{vinSearchDetails.plantCountry || ''}
                    </td>
                    <td className="px-4 py-2">{vinSearchDetails.doors || 'N/A'}</td>
                    <td className="px-4 py-2">{vinSearchDetails.bodyClass || 'N/A'}</td>
                    <td className="px-4 py-2 text-center">
                      <Info className="w-4 h-4 text-slate-400 mx-auto cursor-pointer hover:text-slate-600" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Part Category Navigation Tabs */}
            <div className="flex items-center gap-1 border-b-2 border-sky-400 mb-5">
              <button className="bg-[#4bc0db] hover:bg-[#39a9c4] text-white text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
                <ListFilter className="w-3.5 h-3.5" />
                Categories
              </button>
              <button className="bg-white border border-slate-200 border-b-0 hover:bg-slate-50 text-slate-500 text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
              <button className="bg-white border border-slate-200 border-b-0 hover:bg-slate-50 text-slate-500 text-[11px] font-bold px-5 py-2.5 uppercase flex items-center gap-1.5 transition-colors">
                <Package className="w-3.5 h-3.5" />
                Groups
              </button>
            </div>

            {/* Split layout: Sidebar & Diagrams */}
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Sidebar Category Sorter */}
              <aside className="w-full lg:w-60 shrink-0">
                {/* Search query input */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="For example: engine"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 transition-colors shadow-inner"
                  />
                </div>

                <div className="sticky top-[100px]">
                  <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat)
                          setFilterQuery('')
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between uppercase font-bold tracking-wide border border-transparent',
                          activeCategory === cat
                            ? 'bg-sky-50 text-sky-600 border-sky-200'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        )}
                      >
                        <span className="truncate mr-1">{cat}</span>
                        {activeCategory === cat && !loadingParts && (
                          <span className="bg-slate-200/80 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                            {filteredParts.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Right Sidebar Blueprint Diagrams Grid */}
              <div className="flex-grow min-w-0">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                    {activeCategory} Diagrams
                  </h3>
                  
                  {loadingParts ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <span className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-2" />
                      <p className="text-slate-400 text-xs font-semibold font-sans">Loading parts catalog...</p>
                    </div>
                  ) : errorLoadingParts ? (
                    <p className="text-red-500 text-sm py-16 text-center font-medium font-sans">
                      {errorLoadingParts}
                    </p>
                  ) : filteredParts.length === 0 ? (
                    <p className="text-slate-400 text-sm py-16 text-center font-medium font-sans">
                      {filterQuery ? 'No parts match your filter' : `No parts found in ${activeCategory}`}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredParts.map((part, index) => {
                        const diagIndex = getDiagramIndex(part.name)
                        return (
                          <div
                            key={part.partNumber}
                            onClick={() => handlePartClick(part, index)}
                            className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between cursor-pointer hover:border-slate-400 shadow-sm transition-all duration-200 group"
                          >
                            {/* Schematic Diagram Outlines */}
                            <div className="aspect-[4/3] bg-slate-50/80 border border-slate-100 rounded flex items-center justify-center p-2 mb-3 shadow-inner">
                              <DiagramSVG code={diagIndex} />
                            </div>
                            {/* Label */}
                            <span className="text-[11px] font-bold text-sky-600 group-hover:text-sky-700 group-hover:underline leading-snug break-words">
                              {part.partNumber}: {part.name.toUpperCase()}
                            </span>
                          </div>
                        )})}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      {/* Part Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center font-sans select-none animate-fadeIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 bg-white dark:bg-[#111C14] rounded border border-slate-300 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            
            {/* Modal header */}
            <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  disabled={!canGoPrev}
                  className="w-7 h-7 rounded border border-slate-300 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 font-bold">
                  {currentPartIndex + 1} / {filteredParts.length}
                </span>
                <button
                  onClick={goToNext}
                  disabled={!canGoNext}
                  className="w-7 h-7 rounded border border-slate-300 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPart ? (
              <div className="p-6">
                
                {/* Schematic SVG image to look exactly like PartsSouq blueprint diagrams */}
                <div className="w-full h-44 bg-slate-50 border border-slate-100 rounded flex items-center justify-center p-4 mb-4 shadow-inner">
                  <div className="w-36 h-36">
                    <DiagramSVG code={getDiagramIndex(selectedPart.name)} />
                  </div>
                </div>
                
                <h3 className="text-sm font-extrabold text-slate-900 mb-1 uppercase">
                  {selectedPart.name}
                </h3>
                <p className="text-xs font-mono font-bold text-sky-600 mb-2">
                  PART NUMBER: {selectedPart.partNumber}
                </p>
                <p className="text-xs text-slate-500 mb-4 italic leading-relaxed">
                  {selectedPart.description}
                </p>

                <div className="space-y-2 text-xs font-semibold border-t border-b border-slate-100 py-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">PRICE</span>
                    <span className="text-sm font-black text-amber-600">
                      ${selectedPart.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">BRAND</span>
                    <span className="text-slate-700 font-bold uppercase">{vinSearchDetails?.make || 'UNKNOWN'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SUPPLIER</span>
                    <span className="text-slate-700">{vinSearchDetails?.manufacturer || 'Genuine OEM Supplier'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">STATUS</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      IN STOCK
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">DISPATCH ORIGIN</span>
                    <span className="text-slate-700">{vinSearchDetails?.plantCountry || 'South Korea'}</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-extrabold h-11 flex items-center justify-center gap-2 rounded border-0 transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  ADD TO BASKET
                </Button>

              </div>
            ) : (
              <div className="p-12 text-center text-sm text-red-500 font-semibold">Failed to load part details.</div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}