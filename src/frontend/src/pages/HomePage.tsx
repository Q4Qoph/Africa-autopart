// src/frontend/src/pages/HomePage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Menu,
  Mail,
  Phone,
} from 'lucide-react'

// Custom SVG Brand Icons since older lucide-react doesn't export them
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-2.8 0-5 2.2-5 5v2z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7L11 15.8l-6 6.5H1.6l7.7-8.9L1.3 2.4h6.9l4.6 6.1 5.4-6.1zM17 20.3h1.8L7.1 4H5.1l11.9 16.3z" />
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.5 6.2c-.3-1.1-1.1-2-2.2-2.2C19.3 3.5 12 3.5 12 3.5s-7.3 0-9.3.5c-1.1.3-1.9 1.1-2.2 2.2C0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1.1 1.1 2 2.2 2.2 2 .5 9.3.5 9.3.5s7.3 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8z" />
    <polygon points="9.8,8 9.8,16 16.6,12" fill="white" />
  </svg>
)
import { useTranslation } from 'react-i18next'
import { vinApi } from '@/api/vinApi'
import type { VehicleSummary } from '@/types/vin'
import { cn } from '@/lib/utils'

// ─── SVG Brand Logos (Exact replicas of the 27 PartSouq brands) ──────────────────────

const BRAND_LOGOS: Record<string, (color?: string) => React.ReactNode> = {
  Toyota: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="42" ry="24" />
      <ellipse cx="50" cy="30" rx="30" ry="15" />
      <ellipse cx="50" cy="30" rx="12" ry="24" />
    </svg>
  ),
  Lexus: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="40" ry="24" />
      <path d="M30,42 L52,18 L70,18 L48,42 L30,42 Z" fill={color} stroke="none" />
      <path d="M48,42 L68,42 L68,36 L54,36 Z" fill={color} stroke="none" />
    </svg>
  ),
  Nissan: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="20" />
      <rect x="15" y="24" width="70" height="12" fill={color} rx="1" stroke="none" />
      <text x="50" y="33" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="white" stroke="none" textAnchor="middle" letterSpacing="1">NISSAN</text>
    </svg>
  ),
  Infiniti: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="38" ry="22" />
      <path d="M28,40 L50,16 L72,40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50,16 L50,45" strokeWidth="3" />
    </svg>
  ),
  Mitsubishi: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-16 h-12" fill={color}>
      <path d="M50,5 L62,26 L50,47 L38,26 Z" />
      <path d="M36,49 L48,70 L24,70 L12,49 Z" />
      <path d="M64,49 L88,49 L76,70 L64,70 Z" />
    </svg>
  ),
  Subaru: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="2">
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
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <ellipse cx="50" cy="30" rx="40" ry="24" />
      <path d="M34,42 L42,18 H48 L40,42 Z" fill={color} stroke="none" />
      <path d="M52,42 L60,18 H66 L58,42 Z" fill={color} stroke="none" />
      <path d="M38,32 H62 V26 H38 Z" fill={color} stroke="none" />
    </svg>
  ),
  Kia: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="6">
      <path d="M15,45 L15,15 L32,32 L32,15 M32,45 L32,32 M44,15 L44,45 M56,45 L70,15 L84,45" />
    </svg>
  ),
  Suzuki: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-16 h-12" fill="none">
      <path d="M25,10 H65 L35,42 H75 L55,70 H15 L45,38 Z" fill={color === 'currentColor' ? '#E60012' : color} />
    </svg>
  ),
  Mazda: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="24" />
      <path d="M28,28 C36,36 44,40 50,40 C56,40 64,36 72,28 C64,22 58,20 50,32 C42,20 36,22 28,28 Z" fill={color} stroke="none" />
    </svg>
  ),
  Honda: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <path d="M24,10 C24,8 26,6 28,6 H72 C74,6 76,8 76,10 V50 C76,52 74,54 72,54 H28 C26,54 24,52 24,50 Z" />
      <path d="M34,16 V44 H40 V30 H60 V44 H66 V16 H60 V27 H40 V16 Z" fill={color} stroke="none" />
    </svg>
  ),
  Isuzu: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none">
      <text x="50" y="40" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill={color === 'currentColor' ? '#E60012' : color} textAnchor="middle" letterSpacing="1">ISUZU</text>
    </svg>
  ),
  Mercedes: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <circle cx="50" cy="30" r="25" />
      <path d="M50,5 L50,30 L28,42.5 M50,30 L72,42.5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  Renault: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-16 h-12" fill="none" stroke={color} strokeWidth="5">
      <path d="M50,5 L80,35 L50,75 L20,35 Z" />
      <path d="M50,20 L68,38 L50,60 L32,38 Z" fill={color} opacity="0.15" stroke="none" />
    </svg>
  ),
  BMW: (color = 'currentColor') => (
    <svg viewBox="0 0 100 100" className="w-16 h-12" fill="none" stroke={color} strokeWidth="2">
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
    <svg viewBox="0 0 100 100" className="w-16 h-12" fill="none" stroke={color} strokeWidth="5">
      <circle cx="50" cy="50" r="44" />
      <path d="M26,30 L42,75 H47 L34,30 Z M74,30 L58,75 H53 L66,30 Z" fill={color} stroke="none" />
      <path d="M38,30 L50,60 L62,30 H56 L50,45 L44,30 Z" fill={color} stroke="none" />
    </svg>
  ),
  Audi: (color = 'currentColor') => (
    <svg viewBox="0 0 100 40" className="w-16 h-8" fill="none" stroke={color} strokeWidth="4">
      <circle cx="26" cy="20" r="12" />
      <circle cx="42" cy="20" r="12" />
      <circle cx="58" cy="20" r="12" />
      <circle cx="74" cy="20" r="12" />
    </svg>
  ),
  Chevrolet: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-16 h-12" fill="none">
      <path d="M35,10 H65 L68,20 H88 V30 H65 L62,40 H32 L29,30 H12 V20 H32 Z" fill={color === 'currentColor' ? '#D3A13B' : color} stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  'Land Rover': (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none">
      <ellipse cx="50" cy="30" rx="44" ry="24" fill={color === 'currentColor' ? '#005A36' : color} />
      <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="white" strokeWidth="1.5" />
      <text x="50" y="34" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="white" textAnchor="middle" letterSpacing="0.5">LAND ROVER</text>
    </svg>
  ),
  Porsche: (color = 'currentColor') => (
    <svg viewBox="0 0 80 100" className="w-12 h-12" fill="none" stroke={color} strokeWidth="2">
      <path d="M10,10 H70 V40 C70,65 50,85 40,90 C30,85 10,65 10,40 Z" fill={color === 'currentColor' ? '#FFCC00' : 'none'} />
      <path d="M20,20 H60 V40 C60,55 48,70 40,75 C32,70 20,55 20,40 Z" fill="black" />
      <path d="M40,25 L40,70" stroke="#FF3300" strokeWidth="4" />
      <text x="40" y="16" fontFamily="sans-serif" fontWeight="900" fontSize="6" fill="black" stroke="none" textAnchor="middle" letterSpacing="0.5">PORSCHE</text>
    </svg>
  ),
  Volvo: (color = 'currentColor') => (
    <svg viewBox="0 0 100 100" className="w-16 h-12" fill="none" stroke={color} strokeWidth="5">
      <circle cx="45" cy="55" r="28" />
      <path d="M65,35 L80,20 M60,20 H80 V40" strokeWidth="7" strokeLinecap="square" />
      <rect x="20" y="47" width="50" height="16" fill={color} stroke="none" />
      <text x="45" y="59" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="white" stroke="none" textAnchor="middle">VOLVO</text>
    </svg>
  ),
  Ford: (color = 'currentColor') => (
    <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none">
      <ellipse cx="50" cy="30" rx="44" ry="24" fill={color === 'currentColor' ? '#003399' : 'none'} stroke={color} strokeWidth="2" />
      <text x="50" y="38" fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill="white" textAnchor="middle">Ford</text>
    </svg>
  ),
  Chrysler: (color = 'currentColor') => (
    <svg viewBox="0 0 100 40" className="w-16 h-8" fill="none" stroke={color} strokeWidth="2">
      <path d="M10,20 L30,12 L50,18 L70,12 L90,20 L50,24 Z" />
      <circle cx="50" cy="18" r="6" fill={color} stroke="none" />
    </svg>
  ),
  Peugeot: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-16 h-12" fill="none" stroke={color} strokeWidth="3">
      <path d="M30,70 L35,50 H45 L50,70 M55,70 L60,45 C60,35 70,30 80,30 H75 C60,30 50,40 50,50 L45,35 C40,25 30,20 20,20 V25 C25,25 35,30 35,45 L30,55 Z" />
    </svg>
  ),
  Jeep: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-16 h-12" fill="none">
      <text x="50" y="36" fontFamily="sans-serif" fontWeight="900" fontSize="28" fill={color} textAnchor="middle" letterSpacing="-1">Jeep</text>
    </svg>
  ),
  Dodge: (color = 'currentColor') => (
    <svg viewBox="0 0 100 50" className="w-16 h-12" fill="none">
      <text x="45" y="36" fontFamily="sans-serif" fontWeight="900" fontSize="24" fontStyle="italic" fill={color} textAnchor="middle">DODGE</text>
      <path d="M72,15 L85,15 L77,35 L64,35 Z" fill="#E60012" />
      <path d="M82,15 L95,15 L87,35 L74,35 Z" fill="#E60012" />
    </svg>
  ),
  Ram: (color = 'currentColor') => (
    <svg viewBox="0 0 100 80" className="w-16 h-12" fill="none" stroke={color} strokeWidth="4">
      <path d="M20,10 H80 L75,40 C75,55 50,70 50,70 C50,70 25,55 25,40 Z" />
      <path d="M35,25 C30,15 45,15 50,30 C55,15 70,15 65,25 C60,35 50,38 50,45 Z" fill={color} stroke="none" />
    </svg>
  ),
}

const BRANDS = Object.keys(BRAND_LOGOS)

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation('home')

  // Search States
  const [vin, setVin] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [demoVins, setDemoVins] = useState<VehicleSummary[]>([])

  // UI States
  const [activeTab, setActiveTab] = useState<'easy' | 'catalog' | 'prices' | 'range' | 'shipping'>('easy')

  useEffect(() => {
    vinApi.getAllVehicles()
      .then(({ data }) => setDemoVins(data.slice(0, 3)))
      .catch(() => {})
  }, [])

  async function handleSearch(vinToSearch: string) {
    const trimmed = vinToSearch.trim()
    if (trimmed.length < 11) {
      setError(t('vin_error_short') ?? 'VIN must be at least 11 characters')
      return
    }
    setError('')
    setSearching(true)
    try {
      const { data } = await vinApi.getPartsByVin(trimmed)
      navigate('/parts-search', { state: { vinParts: data } })
    } catch {
      setError(t('vin_error_invalid') ?? 'Could not find vehicle. Check the VIN/Part number and try again.')
    } finally {
      setSearching(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch(vin)
  }

  // Helper scroll function to direct to video
  const scrollToVideo = (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById('how-to-order-video')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Render proper tabs contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'easy':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-sans">
            <p>
              First of all we take care of comfort for our customers. With{' '}
              <strong>Africa Autopart</strong>, purchasing OEM body parts, engine parts, etc. will be fluent and
              pleasant process. It will be no problem for you to find and order, for example, OEM Subaru parts,
              Honda Civic OEM parts, Toyota UK parts or any other auto spare parts. If you need bearings, for
              instance, it will be easy for you to find the necessary ones in our Toyota catalog or catalogs of
              other manufacturers.
            </p>
            <p>
              Why is it so easy to buy with Africa Autopart? Easy-to-use online catalogue will help you quickly
              find needed parts. Sourcing components on our website is simple and intuitive. For your information
              we have prepared a detailed help section. If necessary, our online support team will personally
              assist you. We are not limited by local warehouse stocks as we have an extensive network of verified
              sub-suppliers who instantly dispatch ordered items available at their facilities. Flexible logistics
              allows us to deliver goods within the shortest time. Sourcing automotive components has never been this
              transparent and accessible.
            </p>
          </div>
        )
      case 'catalog':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-sans">
            <p>
              Our online catalog offers access to millions of unique, high-quality auto parts catalogued logically by
              makes, categories, models, and assembly groups. With integrated VIN decoding and part number search,
              locating correct replacement parts takes seconds.
            </p>
            <p>
              We provide detail specifications, compatibility lists, and real-time inventory updates so you never
              order the wrong component. Whether you drive a Toyota, BMW, or Suzuki, find any spare part across any border.
            </p>
          </div>
        )
      case 'prices':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-sans">
            <p>
              By direct collaboration with leading parts distributors and manufacturers, Africa Autopart bypasses
              traditional middle-man markup chains to deliver wholesale pricing directly to workshops, fleets, and
              private vehicle owners.
            </p>
            <p>
              Compare different pricing tiers side-by-side: Choose OEM parts for absolute reliability, or high-grade
              aftermarket parts for affordable maintenance. Get structural price clarity in every order.
            </p>
          </div>
        )
      case 'range':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-sans">
            <p>
              Over 17,000,000 spare parts catalogued. We supply parts for all primary systems: brake rotors and pads,
              engine assemblies, transmission components, radiators, filtration systems, electrical accessories, and
              outer body panels.
            </p>
            <p>
              We stock parts for common vehicles as well as rare, vintage, or high-performance models. No matter how rare
              the component is, our regional and global supplier networks can secure it for you.
            </p>
          </div>
        )
      case 'shipping':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-sans">
            <p>
              We offer fast shipping across Africa, the Middle East, and worldwide. Through partnerships with top-tier
              freight services and courier networks (DHL, FedEx, UPS), we guarantee fast and secure parcel dispatch.
            </p>
            <p>
              Enjoy live shipping milestone updates and custom declarations handling. Your parts are packed to meet strict
              safeguard standards, assuring they reach your garage in pristine condition.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="px-6 md:px-8 py-8">
        
        {/* Headline Subbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-300 pb-3 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans">
            Auto Parts Around the World
          </h1>
          <div className="flex items-center gap-1.5 mt-3 sm:mt-0">
            <a href="mailto:info@africa-autopart.com" className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors" title="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://wa.me/25377577016" className="w-7 h-7 rounded bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors" title="WhatsApp">
              <Phone className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" className="w-7 h-7 rounded bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-colors" title="Facebook">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" className="w-7 h-7 rounded bg-[#c13584] hover:bg-[#b13079] text-white flex items-center justify-center transition-colors" title="Instagram">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" className="w-7 h-7 rounded bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-colors" title="Twitter/X">
              <TwitterIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ── SEARCH BAR CONTAINER ───────────────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 shadow-sm rounded p-6 mb-8 font-sans max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden shadow-inner focus-within:border-slate-500 transition-colors">
              <input
                type="text"
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder={t('vin_placeholder') ?? 'Part Number or VIN/Frame'}
                className="flex-grow h-12 px-4 outline-none text-slate-800 text-base font-bold tracking-wide"
              />
              <button
                type="button"
                className="h-12 px-3.5 border-l border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Catalog Index"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={searching || !vin.trim()}
                className="h-12 px-6 bg-[#5cb85c] hover:bg-[#4cae4c] text-white flex items-center justify-center font-extrabold transition-colors disabled:opacity-65"
              >
                {searching ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && <p className="text-red-600 text-xs mt-2 text-center font-semibold">{error}</p>}

            {/* Clickable Examples */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 mt-3 font-medium">
              <div className="flex flex-wrap items-center gap-1.5">
                <span>Example:</span>
                {['5330160470', '2360059105', 'KMHCU51DAFU223139'].map((exVin) => (
                  <button
                    key={exVin}
                    type="button"
                    onClick={() => {
                      setVin(exVin)
                      handleSearch(exVin)
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {exVin}
                  </button>
                ))}
                {demoVins.map((v) => (
                  <button
                    key={v.vin}
                    type="button"
                    onClick={() => {
                      setVin(v.vin)
                      handleSearch(v.vin)
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {v.vin}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <a
                  href="#how-to-order-video"
                  onClick={scrollToVideo}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-500 fill-current" />
                  How to make order ?
                </a>
                <button
                  type="button"
                  onClick={() => alert('VIN (Vehicle Identification Number) is a 17-digit code found on your vehicle registration document, door pillar, or windshield edge.')}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Where is VIN/Frame ?
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ── STATS COUNTER GRID ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8 font-sans">
          {[
            { value: '199,985', label: 'SATISFIED CLIENTS' },
            { value: '190', label: 'COUNTRIES WE SHIP' },
            { value: '17,000,000', label: 'PARTS IN DATABASE' },
            { value: '2 DAYS', label: 'AVERAGE DISPATCH' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ── BRAND CATALOG GRID (Online Catalogs) ───────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center sm:text-left font-sans border-b border-slate-200 pb-2">
            Genuine Parts Online Catalogs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BRANDS.map((brand) => (
              <div
                key={brand}
                onClick={() => navigate('/requests/new', { state: { make: brand } })}
                className="bg-white border border-slate-200 rounded p-5 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-200 group"
              >
                {/* SVG Logo Container */}
                <div className="h-16 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform duration-300">
                  {BRAND_LOGOS[brand] ? BRAND_LOGOS[brand]('currentColor') : null}
                </div>
                {/* Name */}
                <span className="text-sm font-semibold text-slate-700 mt-3 group-hover:text-slate-900 font-sans">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW TO ORDER VIDEO ─────────────────────────────────────────────────── */}
        <section id="how-to-order-video" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center font-sans border-b border-slate-200 pb-2">
            How to make order
          </h2>
          <div className="w-full max-w-4xl mx-auto bg-slate-950 aspect-video rounded overflow-hidden shadow-lg relative border-4 border-white">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube.com/embed/H8lCcr4T_D8"
              title="Auto parts ordering guide"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* ── ABOUT AFRICA AUTOPART TABS SECTION ───────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 shadow-sm rounded p-6 mb-8 font-sans">
          <h2 className="text-xl font-bold text-slate-800 mb-5 font-sans border-b border-slate-200 pb-2">
            About Africa Autopart
          </h2>
          
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded mb-5">
            {[
              { id: 'easy', label: 'Easy to Use' },
              { id: 'catalog', label: 'Online catalogue' },
              { id: 'prices', label: 'Best prices' },
              { id: 'range', label: 'Extensive Range' },
              { id: 'shipping', label: 'World Wide Shipping' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded transition-colors text-center',
                  activeTab === tab.id
                    ? 'bg-[#374151] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic text block */}
          <div className="border border-slate-100 p-4 rounded bg-slate-50/50 min-h-[160px]">
            {renderTabContent()}
          </div>
        </section>

    </div>
  )
}