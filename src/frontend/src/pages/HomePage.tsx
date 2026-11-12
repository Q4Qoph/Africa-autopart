// src/frontend/src/pages/HomePage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Phone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CatalogSearchForm } from '@/components/catalog/CatalogSearchForm'
import { readSearch, writeSearch } from '@/lib/catalogSearch'
import { cn } from '@/lib/utils'
import { getBrandLogoPath } from '@/lib/brandUtils'
import { VehicleCoveragePanel } from '@/components/catalog/VehicleCoveragePanel'
import { getVehicleCoverageSnapshot } from '@/data/vehicleCoverage'

// Custom SVG Brand Icons
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

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation('home')
  const coverage = getVehicleCoverageSnapshot()
  const coveredModelCount = coverage.makes.reduce((count, make) => count + make.models.length, 0)

  // UI States
  const [activeTab, setActiveTab] = useState<'easy' | 'catalog' | 'prices' | 'range' | 'shipping'>('easy')

  // Render proper tabs contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'easy':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
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
              help with the selection and ordering of parts.
            </p>
          </div>
        )
      case 'catalog':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
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
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
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
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
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
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-300 dark:border-slate-800 pb-3 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200 font-sans">
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

      <div className="mb-10 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* ── SEARCH BAR CONTAINER ───────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-brand-card/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-4 sm:p-6 font-sans min-w-0">
          <CatalogSearchForm state={readSearch(new URLSearchParams())} onSearch={state => navigate(`/parts-search?${writeSearch(state)}`)} />
        </section>

        <VehicleCoveragePanel coverage={coverage} />

        {/* ── STATS COUNTER GRID ─────────────────────────────────────────────────── */}
        <section className="grid min-w-0 grid-cols-2 gap-3 font-sans lg:col-start-1">
          {[
            { value: '199,985', label: 'SATISFIED CLIENTS' },
            { value: '190', label: 'COUNTRIES WE SHIP' },
            { value: String(coveredModelCount), label: t('coverage_models_stat') },
            { value: '2 DAYS', label: 'AVERAGE DISPATCH' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 dark:bg-brand-card/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="min-w-0 lg:col-start-1" aria-labelledby="covered-catalogs-title">
          <h2 id="covered-catalogs-title" className="mb-4 border-b border-slate-200 pb-2 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200">
            {t('coverage_catalogs_heading')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {coverage.makes.map((make) => (
              <Link
                key={make.make}
                to={`/brands/${encodeURIComponent(make.make)}`}
                className="group flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:border-slate-800 dark:bg-brand-card dark:hover:border-emerald-400"
              >
                <img src={getBrandLogoPath(make.label)} alt="" className="h-14 w-24 object-contain" />
                <bdi className="mt-3 text-sm font-semibold text-slate-700 group-hover:text-emerald-700 dark:text-slate-200 dark:group-hover:text-emerald-400">{make.label}</bdi>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── HOW TO ORDER VIDEO ─────────────────────────────────────────────────── */}
      <section id="how-to-order-video" className="mb-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center font-sans border-b border-slate-200 dark:border-slate-800 pb-2">
          How to make order
        </h2>
        <div className="w-full max-w-4xl mx-auto bg-slate-950 aspect-video rounded overflow-hidden shadow-lg relative border-4 border-white dark:border-slate-800">
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
      <section className="bg-white dark:bg-brand-card border border-slate-200 dark:border-slate-800 shadow-sm rounded p-6 mb-8 font-sans">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-5 font-sans border-b border-slate-200 dark:border-slate-800 pb-2">
          About Africa Autopart
        </h2>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-brand-ink p-1.5 rounded mb-5">
          {[
            { id: 'easy', label: 'Easy to Use' },
            { id: 'catalog', label: 'Online catalogue' },
            { id: 'prices', label: 'Best prices' },
            { id: 'range', label: 'Extensive Range' },
            { id: 'shipping', label: 'World Wide Shipping' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded transition-colors text-center',
                activeTab === tab.id
                  ? 'bg-[#374151] dark:bg-brand-green text-white dark:text-brand-ink shadow-sm'
                  : 'text-slate-600 dark:text-brand-muted hover:bg-slate-200 dark:hover:bg-brand-card-2 hover:text-slate-800 dark:hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic text block */}
        <div className="border border-slate-100 dark:border-slate-800 p-4 rounded bg-slate-50/50 dark:bg-[#07110A]/50 min-h-[160px]">
          {renderTabContent()}
        </div>
      </section>

    </div>
  )
}
