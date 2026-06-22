import { Outlet, Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'

// ─── SVG Brand Logos (For the Footer) ──────────────────────────────────
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

export default function RootLayout() {
  return (
    <div
      className="min-h-screen text-slate-900 bg-slate-50 relative selection:bg-amber-500 selection:text-white"
      style={{
        backgroundImage: "url('/images/car_blueprint_pattern.jpg')",
        backgroundSize: '320px 320px',
        backgroundRepeat: 'repeat',
      }}
    >
      <Navbar />

      <main className="pt-[65px] w-full max-w-[1240px] mx-auto bg-white border-x border-slate-200 shadow-sm relative z-10 min-h-[90vh] flex flex-col justify-between font-sans">
        <div className="flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* ── FOOTER (PartSouq Style Redesign) ────────────────────────────────────── */}
      <footer className="bg-[#0e1726] text-slate-300 font-sans border-t border-slate-800 relative z-10 select-none">
        
        {/* Outline logos stripe */}
        <div className="bg-[#0b121f] border-b border-slate-800/80">
          <div className="w-full max-w-[1240px] mx-auto px-4 py-6 flex flex-wrap justify-center items-center gap-6">
            {BRANDS.map((b) => (
              <div key={b} className="text-slate-600 hover:text-slate-400 transition-colors duration-200 cursor-pointer h-6 flex items-center" title={b}>
                {BRAND_LOGOS[b] ? BRAND_LOGOS[b]('currentColor') : null}
              </div>
            ))}
          </div>
        </div>

        {/* Footer link columns */}
        <div className="w-full max-w-[1240px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('FAQ Section: Search for vehicle parts by inserting VIN. Sourcing options are provided instantly. For payment support, consult contact details.')
                  }}
                  className="hover:text-amber-500 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#articles"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Knowledgebase details catalog guidelines, parts maintenance, and cross-border customs declarations.')
                  }}
                  className="hover:text-amber-500 transition-colors"
                >
                  Articles
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Information
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><a href="#policies" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Policies</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Terms & Conditions</a></li>
              <li><a href="#news" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">News</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              My Account
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/orders" className="hover:text-amber-500 transition-colors">Orders</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Wishlist</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Garage</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Social Links
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Twitter</a></li>
              <li><a href="https://wa.me/25377577016" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Whatsapp</a></li>
            </ul>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="bg-[#0b121f] py-6 border-t border-slate-800/80">
          <div className="w-full max-w-[1240px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            
            {/* Payment method icons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">PayPal</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">VISA</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">MasterCard</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">AMEX</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">Apple Pay</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">Bitcoin</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">FedEx</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">DHL</span>
              <span className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">UPS</span>
            </div>

            {/* Copyright & registration details */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
              <span>AFRICA AUTOPART WHOLESALERS L.L.C.</span>
              <span>© {new Date().getFullYear()} Africa Autopart. All rights reserved.</span>
            </div>

          </div>
        </div>

      </footer>
    </div>
  )
}
