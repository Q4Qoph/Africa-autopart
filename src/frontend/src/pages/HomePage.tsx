import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Truck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '14K', suffix: '+', label: 'Parts Sourced' },
  { value: '1,240', suffix: '+', label: 'Verified Suppliers' },
  { value: '18', suffix: '', label: 'Countries Served' },
  { value: '96.8', suffix: '%', label: 'Delivery Success' },
]

const vehicleYears = Array.from({ length: 20 }, (_, i) => String(2025 - i))

const vehicleMakes = [
  'Toyota', 'Nissan', 'Mitsubishi', 'Isuzu', 'Land Rover',
  'Mercedes-Benz', 'BMW', 'Ford', 'Honda', 'Hyundai',
  'Kia', 'Mazda', 'Subaru', 'Jeep', 'Volkswagen',
  'Peugeot', 'Renault', 'Suzuki', 'Daihatsu', 'Other',
]

const steps = [
  {
    number: '01',
    title: 'Submit your request',
    desc: 'Enter vehicle details, part name, condition preference, urgency, and destination country.',
  },
  {
    number: '02',
    title: 'Suppliers respond',
    desc: 'Verified suppliers across Africa and Saudi Arabia receive your RFQ and submit offers.',
  },
  {
    number: '03',
    title: 'Compare options',
    desc: 'Review OEM, aftermarket, and second-hand quotes side by side on price, warranty, and ETA.',
  },
  {
    number: '04',
    title: 'Pay securely',
    desc: 'Platform-managed payment with escrow protection and invoice generation.',
  },
  {
    number: '05',
    title: 'Track delivery',
    desc: 'Real-time updates from dispatch to customs to your door.',
  },
]

const capabilities = [
  {
    icon: '🔍',
    title: 'Smart RFQ Matching',
    desc: 'Submit one request and receive competitive quotes from our entire verified supplier network automatically.',
  },
  {
    icon: '⚖️',
    title: 'OEM · Aftermarket · Used',
    desc: 'Three sourcing lanes in every quote — choose the right balance of quality, price, and availability.',
  },
  {
    icon: '🌍',
    title: 'Cross-Border Logistics',
    desc: 'Coordinated shipping from Saudi Arabia, East Africa, and regional hubs with customs handling.',
  },
  {
    icon: '📍',
    title: 'Live Order Tracking',
    desc: 'Milestone-by-milestone visibility: picked up, at border, customs cleared, out for delivery.',
  },
  {
    icon: '🔒',
    title: 'Escrow Payments',
    desc: 'Funds held until delivery is confirmed. Dispute resolution built in at every stage.',
  },
  {
    icon: '✅',
    title: 'Supplier Verification',
    desc: 'Every supplier goes through document review, rating history, and category approval.',
  },
]

const kpis = [
  { value: '3,800+', label: 'Parts categories' },
  { value: '1,240+', label: 'Verified suppliers' },
  { value: '18', label: 'Countries served' },
  { value: '96.8%', label: 'Delivery success rate' },
  { value: '42 min', label: 'Avg. first quote' },
  { value: '4.8 / 5', label: 'Buyer satisfaction' },
]

const testimonials = [
  {
    quote:
      'The ability to compare OEM and aftermarket offers side by side — then watch delivery checkpoints live — made procurement significantly easier for our operations team.',
    author: 'Procurement Lead',
    company: 'Nairobi Fleet Operator',
    tag: 'Fleet Buyer',
    tagColor: 'green',
    avatar: '/images/testimonials/testimonial-1-190x190.jpg',
  },
  {
    quote:
      'A supplier community with RFQ threading is a smart differentiator. It lets serious vendors share availability and close deals faster than any email chain.',
    author: 'Parts Distributor',
    company: 'Jeddah, Saudi Arabia',
    tag: 'Supplier',
    tagColor: 'amber',
    avatar: '/images/testimonials/testimonial-2-190x190.jpg',
  },
  {
    quote:
      'One place for sourcing, payment confirmation, and delivery status. Exactly what workshops in East Africa have been missing.',
    author: 'Workshop Director',
    company: 'Kampala, Uganda',
    tag: 'Workshop',
    tagColor: 'blue',
    avatar: '/images/testimonials/testimonial-3-190x190.jpg',
  },
]

const categories = [
  { id: 1, label: 'Brakes',       img: '/images/categories/category-1-200x200.jpg' },
  { id: 2, label: 'Engine Parts', img: '/images/categories/category-2-200x200.jpg' },
  { id: 3, label: 'Suspension',   img: '/images/categories/category-3-200x200.jpg' },
  { id: 4, label: 'Filters',      img: '/images/categories/category-4-200x200.jpg' },
  { id: 5, label: 'Electrical',   img: '/images/categories/category-5-200x200.jpg' },
  { id: 6, label: 'Body Parts',   img: '/images/categories/category-6-200x200.jpg' },
  { id: 7, label: 'Transmission', img: '/images/categories/category-7-200x200.jpg' },
  { id: 8, label: 'Cooling',      img: '/images/categories/category-8-200x200.jpg' },
]

const brands = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  img: `/images/brands/brand-${i + 1}.png`,
  alt: `Brand ${i + 1}`,
}))

type PartCondition = 'OEM' | 'Aftermarket' | 'Used'

const featuredParts: {
  id: number
  name: string
  condition: PartCondition
  img: string
  conditionColor: 'green' | 'amber' | 'blue'
}[] = [
  { id: 1, name: 'Front Brake Pad Set',   condition: 'OEM',         conditionColor: 'green', img: '/images/products/product-1-245x245.jpg' },
  { id: 2, name: 'Air Filter Assembly',   condition: 'Aftermarket', conditionColor: 'amber', img: '/images/products/product-2-245x245.jpg' },
  { id: 3, name: 'Alternator Unit',       condition: 'OEM',         conditionColor: 'green', img: '/images/products/product-3-245x245.jpg' },
  { id: 4, name: 'Shock Absorber — Rear', condition: 'Aftermarket', conditionColor: 'amber', img: '/images/products/product-4-245x245.jpg' },
  { id: 5, name: 'Radiator Cooling Fan',  condition: 'Used',        conditionColor: 'blue',  img: '/images/products/product-5-245x245.jpg' },
  { id: 6, name: 'Starter Motor',         condition: 'OEM',         conditionColor: 'green', img: '/images/products/product-6-245x245.jpg' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-3 text-sm hover:bg-[#39FF88] transition-colors'
const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] text-[rgba(0,0,0,0.7)] dark:text-[rgba(255,255,255,0.8)] px-6 py-3 text-sm hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)] hover:text-[#07110A] dark:hover:text-white transition-colors'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-3">
      <span className="block w-6 h-px bg-[#00C853]" />
      {children}
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-[68px] md:pt-[104px] min-h-screen flex items-center overflow-hidden">
        {/* Background: glow + grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 65% 55% at 72% 38%, rgba(0,200,83,0.08) 0%, transparent 68%), radial-gradient(ellipse 45% 60% at 8% 78%, rgba(0,200,83,0.05) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,200,83,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.045) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage:
                'radial-gradient(ellipse 85% 72% at 62% 42%, black 0%, transparent 72%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1260px] mx-auto px-6 pt-12 pb-16 w-full">
          <div className="grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-center">

            {/* ── Left: copy + finder ── */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse shrink-0" />
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#00C853]">
                  Africa + Saudi Arabia · OEM · Aftermarket · Second-Hand
                </p>
              </div>

              {/* Headline */}
              <h1 className="font-display text-[clamp(2.2rem,4.5vw,3.7rem)] font-extrabold leading-[1.06] tracking-tight text-[#07110A] dark:text-white mb-5">
                Find any spare part,{' '}
                <span className="text-[#00C853]">across any border.</span>
              </h1>

              {/* Description */}
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[1rem] leading-[1.8] mb-7 max-w-[500px]">
                Africa Autopart connects vehicle owners, workshops, and fleets to verified
                suppliers across Africa and Saudi Arabia — OEM, aftermarket, and second-hand
                parts with real-time tracking and secure payments.
              </p>

              {/* ── Vehicle Finder ── */}
              <VehicleFinder />

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mt-7">
                {[
                  { label: 'OEM Parts',         color: 'green' },
                  { label: 'Aftermarket',        color: 'green' },
                  { label: 'Second-Hand',        color: 'green' },
                  { label: '18 Countries',       color: 'dim' },
                  { label: 'Escrow Payments',    color: 'dim' },
                  { label: 'Live Tracking',      color: 'dim' },
                ].map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      'text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border',
                      t.color === 'green'
                        ? 'bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.18)]'
                        : 'bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[#4A6B50] dark:text-[#7A9A80] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]',
                    )}
                  >
                    {t.label}
                  </span>
                ))}
              </div>

              {/* Extra CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link to="/orders" className={btnOutline}>
                  <Truck className="w-4 h-4 mr-1.5" />
                  Track Order
                </Link>
                <Link to="/become-supplier" className={btnOutline}>
                  <MapPin className="w-4 h-4 mr-1.5" />
                  Become a Supplier
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-extrabold text-[#07110A] dark:text-white leading-none">
                      {s.value}<span className="text-[#00C853]">{s.suffix}</span>
                    </p>
                    <p className="text-[11px] text-[#4A6B50] dark:text-[#7A9A80] mt-1 leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: platform visual ── */}
            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── Parts Category Grid ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="max-w-xl mb-14">
            <SectionLabel>Browse by Category</SectionLabel>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-[#07110A] dark:text-white leading-tight">
              3,800+ parts categories, one platform.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/requests/new"
                className="group relative rounded-2xl overflow-hidden aspect-square block bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,200,83,0.3)] transition-colors"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover opacity-80 dark:opacity-70 group-hover:opacity-100 dark:group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,17,10,0.85)] via-[rgba(7,17,10,0.2)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm leading-snug">{cat.label}</p>
                </div>
                <div className="absolute inset-0 bg-[rgba(0,200,83,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-[#00C853] font-mono text-xs uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    Browse →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="max-w-xl mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-[#07110A] dark:text-white leading-tight">
              From request to delivery in 5 structured steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[38px] left-[calc(100%+2px)] w-[calc(100%-4px)] h-px bg-gradient-to-r from-[rgba(0,200,83,0.4)] to-transparent z-10" />
                )}
                <div className="h-full bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-2xl p-6 hover:border-[rgba(0,200,83,0.3)] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center mb-4">
                    <span className="text-[#00C853] font-mono font-bold text-sm">{step.number}</span>
                  </div>
                  <h3 className="text-[#07110A] dark:text-white font-semibold text-sm leading-snug mb-2">{step.title}</h3>
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-6 items-end mb-14">
            <div>
              <SectionLabel>Platform Capabilities</SectionLabel>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-[#07110A] dark:text-white leading-tight">
                Everything a serious procurement operation needs.
              </h2>
            </div>
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed lg:text-right lg:max-w-md lg:ml-auto">
              Built for workshops, fleet managers, and procurement teams who need
              reliable cross-border sourcing — not guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl p-6 hover:border-[rgba(0,200,83,0.2)] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
              >
                <div className="text-2xl mb-4">{c.icon}</div>
                <h3 className="text-[#07110A] dark:text-white font-semibold mb-2 group-hover:text-[#00C853] transition-colors">
                  {c.title}
                </h3>
                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Logo Strip ── */}
      <section className="py-16 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6 mb-10">
          <SectionLabel>Brand Coverage</SectionLabel>
          <p className="font-display text-[clamp(1.4rem,2.5vw,2rem)] font-extrabold text-[#07110A] dark:text-white">
            Trusted by top automotive brands worldwide.
          </p>
        </div>
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#F7FDF8] dark:from-[#07110A] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#F7FDF8] dark:from-[#07110A] to-transparent" />
          <div className="flex gap-8 w-max animate-marquee">
            {[...brands, ...brands].map((brand, idx) => (
              <div
                key={`${brand.id}-${idx}`}
                className="flex-shrink-0 w-28 h-16 flex items-center justify-center rounded-xl border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] bg-white dark:bg-[#111C14] px-4 py-3 group hover:border-[rgba(0,200,83,0.25)] transition-colors"
              >
                <img
                  src={brand.img}
                  alt={brand.alt}
                  className="max-w-full max-h-full object-contain filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KPI Bar ── */}
      <section className="py-16 border-t border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] bg-[rgba(0,200,83,0.04)] dark:bg-[rgba(0,200,83,0.03)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {kpis.map((k) => (
              <div key={k.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-[#07110A] dark:text-white mb-1">{k.value}</p>
                <p className="text-xs font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#7A9A80]">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="mb-14">
            <SectionLabel>Trusted By</SectionLabel>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-[#07110A] dark:text-white">
              What buyers and suppliers say.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl p-6 flex flex-col gap-4 hover:border-[rgba(0,200,83,0.2)] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
              >
                <Badge
                  className={cn(
                    'w-fit text-[10px]',
                    t.tagColor === 'green' &&
                      'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
                    t.tagColor === 'amber' &&
                      'bg-amber-400/10 text-amber-400 border-amber-400/20',
                    t.tagColor === 'blue' &&
                      'bg-blue-400/10 text-blue-400 border-blue-400/20',
                  )}
                >
                  {t.tag}
                </Badge>
                <span className="text-[#00C853] font-display text-4xl leading-none opacity-30 select-none">"</span>
                <p className="text-[#07110A] dark:text-[#E8F0E9] text-sm leading-relaxed flex-1 -mt-4">
                  {t.quote}
                </p>
                <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-4 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[rgba(0,200,83,0.2)] flex-shrink-0"
                  />
                  <div>
                    <p className="text-[#07110A] dark:text-white font-semibold text-sm">{t.author}</p>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs mt-0.5">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Parts ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-6 items-end mb-14">
            <div>
              <SectionLabel>In Stock &amp; Ready</SectionLabel>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-[#07110A] dark:text-white leading-tight">
                Parts in stock &amp; ready to source.
              </h2>
            </div>
            <div className="lg:text-right">
              <Link to="/requests/new" className={cn(btnOutline, 'lg:ml-auto')}>
                Request Any Part
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredParts.map((part) => (
              <div
                key={part.id}
                className="group bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:border-[rgba(0,200,83,0.25)] transition-colors flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
              >
                <div className="relative bg-[#EFF7F1] dark:bg-[#162019] aspect-square overflow-hidden">
                  <img
                    src={part.img}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className={cn(
                      'absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md',
                      part.conditionColor === 'green' &&
                        'bg-[rgba(7,17,10,0.8)] dark:bg-[rgba(7,17,10,0.85)] text-[#00C853] border border-[rgba(0,200,83,0.3)]',
                      part.conditionColor === 'amber' &&
                        'bg-[rgba(7,17,10,0.8)] dark:bg-[rgba(7,17,10,0.85)] text-amber-400 border border-amber-400/30',
                      part.conditionColor === 'blue' &&
                        'bg-[rgba(7,17,10,0.8)] dark:bg-[rgba(7,17,10,0.85)] text-blue-400 border border-blue-400/30',
                    )}
                  >
                    {part.condition}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p className="text-[#07110A] dark:text-white text-xs font-semibold leading-snug line-clamp-2 flex-1">{part.name}</p>
                  <Link
                    to="/requests/new"
                    className="text-center text-[10px] font-mono uppercase tracking-wider py-1.5 rounded-lg bg-[rgba(0,200,83,0.08)] text-[#00C853] border border-[rgba(0,200,83,0.15)] hover:bg-[rgba(0,200,83,0.18)] hover:border-[rgba(0,200,83,0.3)] transition-colors"
                  >
                    Request Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Become a Supplier ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.15)] rounded-3xl p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <SectionLabel>Become a Supplier</SectionLabel>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-[#07110A] dark:text-white leading-tight mb-4">
                Grow your reach. Win more RFQs.
              </h2>
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed mb-6">
                Join Africa Autopart's verified supplier network and get access to
                high-intent buyers across 18 countries. Respond to RFQs, publish
                stock, and track your performance — all in one dashboard.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Access to buyers across East Africa and the Gulf',
                  'Respond to RFQs directly from your dashboard',
                  'Build trust with ratings and verified profile badges',
                  'No upfront cost — pay only when you win orders',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#07110A] dark:text-[#E8F0E9]">
                    <span className="text-[#00C853] mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/become-supplier" className={btnPrimary}>
                Apply as a Supplier
              </Link>
            </div>

            {/* Right side: supplier stats */}
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {[
                { value: '1,240+', label: 'Active Suppliers', sub: 'Across Africa & Saudi Arabia' },
                { value: '14', label: 'Avg. RFQs / Day', sub: 'Per verified supplier' },
                { value: '92%', label: 'Response Rate', sub: 'Top supplier benchmark' },
                { value: 'Gold', label: 'Verification Tier', sub: 'Highest trust level' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.12)] rounded-xl p-4"
                >
                  <p className="font-display text-2xl font-extrabold text-[#07110A] dark:text-white">{s.value}</p>
                  <p className="text-[#00C853] text-xs font-semibold mt-1">{s.label}</p>
                  <p className="text-[#4A6B50] dark:text-[#3D5942] text-[11px] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            Get Started Today
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold text-[#07110A] dark:text-white mb-4">
            Ready to source smarter?
          </h2>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] mb-10 max-w-lg mx-auto leading-relaxed">
            Join workshops, fleet managers, and procurement teams already using
            Africa Autopart to source parts across 18 countries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/requests/new" className={cn(btnPrimary, 'px-10 py-4 text-base')}>
              Request a Part Now
            </Link>
            <Link to="/register" className={cn(btnOutline, 'px-10 py-4 text-base')}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] py-16 bg-[#EFF7F1] dark:bg-[#07110A]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
                  AA
                </div>
                <span className="text-[#07110A] dark:text-white font-bold font-display">Africa Autopart</span>
              </div>
              <p className="text-[#4A6B50] dark:text-[#3D5942] text-sm leading-relaxed max-w-xs">
                Cross-border spare parts sourcing platform connecting Africa and Saudi Arabia.
              </p>
            </div>

            <FooterCol
              title="Platform"
              links={[
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Request a Part', href: '/requests/new' },
                { label: 'Browse Suppliers', href: '/suppliers' },
                { label: 'Track Order', href: '/orders' },
              ]}
            />
            <FooterCol
              title="Suppliers"
              links={[
                { label: 'Become a Supplier', href: '/become-supplier' },
                { label: 'Supplier Dashboard', href: '/dashboard' },
                { label: 'Verification Process', href: '#' },
                { label: 'Pricing', href: '#' },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: 'About', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ]}
            />
          </div>

          <div className="border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#4A6B50] dark:text-[#3D5942] text-xs">
              © {new Date().getFullYear()} Africa Autopart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Kenya', 'Uganda', 'Tanzania', 'Saudi Arabia', '+14 more'].map((c) => (
                <span key={c} className="text-[#4A6B50] dark:text-[#3D5942] text-[11px] font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[#07110A] dark:text-white font-semibold text-sm mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith('/') ? (
              <Link to={l.href} className="text-[#4A6B50] dark:text-[#3D5942] text-sm hover:text-[#00C853] dark:hover:text-[#7A9A80] transition-colors">
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="text-[#4A6B50] dark:text-[#3D5942] text-sm hover:text-[#00C853] dark:hover:text-[#7A9A80] transition-colors">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function VehicleFinder() {
  const navigate = useNavigate()
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [part, setPart] = useState('')

  function handleFind(e: React.FormEvent) {
    e.preventDefault()
    navigate('/requests/new', { state: { year, make, partName: part } })
  }

  const selectCls =
    'h-10 px-3 rounded-lg bg-white dark:bg-[#162019] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white text-sm focus:outline-none focus:border-[#00C853] transition-colors'

  return (
    <form onSubmit={handleFind} className="bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#3D5942] mb-3">Find Your Part</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
          <option value="">Year</option>
          {vehicleYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={make} onChange={(e) => setMake(e.target.value)} className={selectCls}>
          <option value="">Make</option>
          {vehicleMakes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A6B50] dark:text-[#3D5942]" />
          <input
            type="text"
            value={part}
            onChange={(e) => setPart(e.target.value)}
            placeholder="Part name or number…"
            className="w-full h-10 pl-8 pr-3 rounded-lg bg-white dark:bg-[#162019] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] text-sm focus:outline-none focus:border-[#00C853] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-5 rounded-lg bg-[#00C853] text-[#07110A] font-semibold text-sm hover:bg-[#39FF88] transition-colors shrink-0"
        >
          Find Parts →
        </button>
      </div>
      <p className="text-[10px] text-[#7A9A80] dark:text-[#3D5942] mt-2.5 font-mono">
        No account needed — request as a guest
      </p>
    </form>
  )
}

function HeroVisual() {
  return (
    <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.15)] rounded-2xl p-5 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#3D5942]">Live Sourcing Flow</p>
          <p className="text-[#07110A] dark:text-white font-semibold text-sm">Toyota Prado — Brake Pad Set</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00C853] bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] px-2 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Active RFQ matching progress */}
      <div className="bg-[#EFF7F1] dark:bg-[#162019] rounded-xl p-3 border border-[rgba(0,200,83,0.1)]">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#3D5942]">Matching Suppliers</p>
          <span className="text-[#00C853] text-[10px] font-mono font-bold">72%</span>
        </div>
        <div className="w-full bg-[#D0E8D5] dark:bg-[#0F1F13] rounded-full h-1.5 mb-2">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#00C853] to-[#39FF88]" />
        </div>
        <p className="text-[#4A6B50] dark:text-[#3D5942] text-[10px] font-mono">8 of 11 suppliers matched · 3 responding</p>
      </div>

      {/* Active RFQ */}
      <div className="bg-[#EFF7F1] dark:bg-[#162019] rounded-xl p-4 border border-[rgba(0,200,83,0.1)]">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#3D5942] mb-2">Active RFQ</p>
        <div className="space-y-1.5 text-xs">
          {[
            ['Part', 'Front Brake Pad Set'],
            ['Vehicle', 'Toyota Prado 2021'],
            ['Destination', 'Nairobi, Kenya'],
            ['Condition', 'OEM / Aftermarket'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#4A6B50] dark:text-[#3D5942]">{k}</span>
              <span className="text-[#07110A] dark:text-[#E8F0E9]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier responses */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#3D5942]">3 Supplier Responses</p>
        {[
          { name: 'Al Barq OEM Hub', location: 'Jeddah, KSA', price: '$148', tag: 'OEM', color: 'green', eta: '3.5 days' },
          { name: 'Nairobi Auto Parts', location: 'Nairobi, KE', price: '$94', tag: 'Aftermarket', color: 'amber', eta: '1 day' },
          { name: 'Dar Reclaim Co.', location: 'Dar es Salaam', price: '$42', tag: 'Used', color: 'blue', eta: 'Ready' },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between bg-[#E8F2EA] dark:bg-[#0F1F13] rounded-lg px-3 py-2.5 border border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.04)]">
            <div>
              <p className="text-[#07110A] dark:text-white text-xs font-medium">{s.name}</p>
              <p className="text-[#4A6B50] dark:text-[#3D5942] text-[10px]">{s.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded',
                  s.color === 'green' && 'bg-[rgba(0,200,83,0.1)] text-[#00C853]',
                  s.color === 'amber' && 'bg-amber-400/10 text-amber-400',
                  s.color === 'blue' && 'bg-blue-400/10 text-blue-400',
                )}
              >
                {s.tag}
              </span>
              <div className="text-right">
                <p className="text-[#00C853] text-xs font-bold">{s.price}</p>
                <p className="text-[#4A6B50] dark:text-[#3D5942] text-[9px]">{s.eta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery tracker */}
      <div className="bg-[#EFF7F1] dark:bg-[#162019] rounded-xl p-4 border border-[rgba(0,200,83,0.1)]">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#3D5942]">Delivery Lane</p>
          <span className="text-[#00C853] text-[10px] font-mono">ETA 09 Apr, 16:30</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {['Jeddah', 'Customs', 'Mombasa', 'Nairobi'].map((point, i, arr) => (
            <div key={point} className="flex items-center gap-1 flex-1">
              <div className={cn(
                'text-[9px] font-mono text-center flex-1',
                i <= 2 ? 'text-[#00C853]' : 'text-[#4A6B50] dark:text-[#3D5942]',
              )}>
                {point}
              </div>
              {i < arr.length - 1 && (
                <div className={cn('h-px flex-1', i < 2 ? 'bg-[#00C853]' : 'bg-[#D0E8D5] dark:bg-[#162019]')} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-[#D0E8D5] dark:bg-[#0F1F13] rounded-full h-1.5">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#00C853] to-[#39FF88]" />
        </div>
        <p className="text-[#4A6B50] dark:text-[#3D5942] text-[10px] mt-1.5 font-mono">In customs review · 65% complete</p>
      </div>
    </div>
  )
}
