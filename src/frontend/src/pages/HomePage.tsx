import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '18', suffix: '', label: 'Countries Served' },
  { value: '1,240', suffix: '+', label: 'Approved Suppliers' },
  { value: '42', suffix: ' min', label: 'Avg. First Quote' },
  { value: '96.8', suffix: '%', label: 'Delivery Success' },
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
  },
  {
    quote:
      'A supplier community with RFQ threading is a smart differentiator. It lets serious vendors share availability and close deals faster than any email chain.',
    author: 'Parts Distributor',
    company: 'Jeddah, Saudi Arabia',
    tag: 'Supplier',
    tagColor: 'amber',
  },
  {
    quote:
      'One place for sourcing, payment confirmation, and delivery status. Exactly what workshops in East Africa have been missing.',
    author: 'Workshop Director',
    company: 'Kampala, Uganda',
    tag: 'Workshop',
    tagColor: 'blue',
  },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-3 text-sm hover:bg-[#39FF88] transition-colors'
const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.8)] px-6 py-3 text-sm hover:bg-[rgba(255,255,255,0.06)] hover:text-white transition-colors'

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
    <div className="min-h-screen bg-[#07110A] text-[#E8F0E9] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-[68px] min-h-screen flex items-center overflow-hidden">
        {/* Background glow + grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(0,200,83,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(0,200,83,0.04) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,200,83,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage:
                'radial-gradient(ellipse 80% 70% at 60% 40%, black 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1260px] mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#00C853]">
                  Africa + Saudi Arabia Sourcing Network
                </p>
              </div>

              <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.04] tracking-tight text-white mb-6">
                Source spare parts{' '}
                <span className="text-[#00C853]">across borders,</span>{' '}
                without the chaos.
              </h1>

              <p className="text-[#7A9A80] text-[1.05rem] leading-[1.8] mb-8 max-w-[500px]">
                Africa Autopart connects vehicle owners, workshops, and fleets to verified
                suppliers across Africa and Saudi Arabia. Get competing quotes, compare
                OEM vs aftermarket, pay securely, and track every shipment in real time.
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['OEM Parts', 'Aftermarket', 'Second Hand', 'Cross-border Delivery', 'Escrow Payments'].map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-[rgba(0,200,83,0.08)] text-[#00C853] border border-[rgba(0,200,83,0.15)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/register" className={btnPrimary}>
                  Request a Part
                </Link>
                <Link to="/suppliers" className={btnOutline}>
                  Browse Suppliers
                </Link>
              </div>

              {/* Inline stats */}
              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-[rgba(255,255,255,0.06)]">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-extrabold text-white">
                      {s.value}
                      <span className="text-[#00C853]">{s.suffix}</span>
                    </p>
                    <p className="text-xs text-[#7A9A80] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: live platform preview */}
            <div className="hidden lg:block">
              <LivePreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="max-w-xl mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-white leading-tight">
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
                <div className="h-full bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-2xl p-6 hover:border-[rgba(0,200,83,0.3)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center mb-4">
                    <span className="text-[#00C853] font-mono font-bold text-sm">{step.number}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug mb-2">{step.title}</h3>
                  <p className="text-[#7A9A80] text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-6 items-end mb-14">
            <div>
              <SectionLabel>Platform Capabilities</SectionLabel>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-white leading-tight">
                Everything a serious procurement operation needs.
              </h2>
            </div>
            <p className="text-[#7A9A80] text-sm leading-relaxed lg:text-right lg:max-w-md lg:ml-auto">
              Built for workshops, fleet managers, and procurement teams who need
              reliable cross-border sourcing — not guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="bg-[#111C14] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 hover:border-[rgba(0,200,83,0.2)] transition-colors group"
              >
                <div className="text-2xl mb-4">{c.icon}</div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-[#00C853] transition-colors">
                  {c.title}
                </h3>
                <p className="text-[#7A9A80] text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KPI Bar ── */}
      <section className="py-16 border-t border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,200,83,0.03)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {kpis.map((k) => (
              <div key={k.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-white mb-1">{k.value}</p>
                <p className="text-xs font-mono uppercase tracking-wider text-[#7A9A80]">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="mb-14">
            <SectionLabel>Trusted By</SectionLabel>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold text-white">
              What buyers and suppliers say.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-[#111C14] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 flex flex-col gap-4"
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
                <p className="text-[#E8F0E9] text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-[#7A9A80] text-xs mt-0.5">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Become a Supplier ── */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="bg-[#111C14] border border-[rgba(0,200,83,0.15)] rounded-3xl p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center relative overflow-hidden">
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <SectionLabel>Become a Supplier</SectionLabel>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-white leading-tight mb-4">
                Grow your reach. Win more RFQs.
              </h2>
              <p className="text-[#7A9A80] text-sm leading-relaxed mb-6">
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
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#E8F0E9]">
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
                  <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[#00C853] text-xs font-semibold mt-1">{s.label}</p>
                  <p className="text-[#3D5942] text-[11px] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1260px] mx-auto px-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            Get Started Today
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold text-white mb-4">
            Ready to source smarter?
          </h2>
          <p className="text-[#7A9A80] mb-10 max-w-lg mx-auto leading-relaxed">
            Join workshops, fleet managers, and procurement teams already using
            Africa Autopart to source parts across 18 countries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className={cn(btnPrimary, 'px-10 py-4 text-base')}>
              Create Free Account
            </Link>
            <Link to="/suppliers" className={cn(btnOutline, 'px-10 py-4 text-base')}>
              Browse Suppliers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-16">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
                  AA
                </div>
                <span className="text-white font-bold font-display">Africa Autopart</span>
              </div>
              <p className="text-[#3D5942] text-sm leading-relaxed max-w-xs">
                Cross-border spare parts sourcing platform connecting Africa and Saudi Arabia.
              </p>
            </div>

            <FooterCol
              title="Platform"
              links={[
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Request a Part', href: '/register' },
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

          <div className="border-t border-[rgba(255,255,255,0.05)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#3D5942] text-xs">
              © {new Date().getFullYear()} Africa Autopart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Kenya', 'Uganda', 'Tanzania', 'Saudi Arabia', '+14 more'].map((c) => (
                <span key={c} className="text-[#3D5942] text-[11px] font-mono">
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
      <p className="text-white font-semibold text-sm mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith('/') ? (
              <Link to={l.href} className="text-[#3D5942] text-sm hover:text-[#7A9A80] transition-colors">
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="text-[#3D5942] text-sm hover:text-[#7A9A80] transition-colors">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LivePreviewCard() {
  return (
    <div className="bg-[#111C14] border border-[rgba(0,200,83,0.15)] rounded-2xl p-5 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#3D5942]">Platform Preview</p>
          <p className="text-white font-semibold text-sm">Live sourcing flow</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00C853] bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] px-2 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
          Live
        </span>
      </div>

      {/* Active RFQ */}
      <div className="bg-[#162019] rounded-xl p-4 border border-[rgba(0,200,83,0.1)]">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#3D5942] mb-2">Active RFQ</p>
        <div className="space-y-1.5 text-xs">
          {[
            ['Part', 'Front Brake Pad Set'],
            ['Vehicle', 'Toyota Prado 2021'],
            ['Destination', 'Nairobi, Kenya'],
            ['Condition', 'OEM / Aftermarket'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#3D5942]">{k}</span>
              <span className="text-[#E8F0E9]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier responses */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#3D5942]">3 Supplier Responses</p>
        {[
          { name: 'Al Barq OEM Hub', location: 'Jeddah, KSA', price: '$148', tag: 'OEM', color: 'green', eta: '3.5 days' },
          { name: 'Nairobi Auto Parts', location: 'Nairobi, KE', price: '$94', tag: 'Aftermarket', color: 'amber', eta: '1 day' },
          { name: 'Dar Reclaim Co.', location: 'Dar es Salaam', price: '$42', tag: 'Used', color: 'blue', eta: 'Ready' },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between bg-[#0F1F13] rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.04)]">
            <div>
              <p className="text-white text-xs font-medium">{s.name}</p>
              <p className="text-[#3D5942] text-[10px]">{s.location}</p>
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
                <p className="text-[#3D5942] text-[9px]">{s.eta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery tracker */}
      <div className="bg-[#162019] rounded-xl p-4 border border-[rgba(0,200,83,0.1)]">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#3D5942]">Delivery Lane</p>
          <span className="text-[#00C853] text-[10px] font-mono">ETA 09 Apr, 16:30</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {['Jeddah', 'Customs', 'Mombasa', 'Nairobi'].map((point, i, arr) => (
            <div key={point} className="flex items-center gap-1 flex-1">
              <div className={cn(
                'text-[9px] font-mono text-center flex-1',
                i <= 2 ? 'text-[#00C853]' : 'text-[#3D5942]',
              )}>
                {point}
              </div>
              {i < arr.length - 1 && (
                <div className={cn('h-px flex-1', i < 2 ? 'bg-[#00C853]' : 'bg-[#162019]')} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-[#0F1F13] rounded-full h-1.5">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#00C853] to-[#39FF88]" />
        </div>
        <p className="text-[#3D5942] text-[10px] mt-1.5 font-mono">In customs review · 65% complete</p>
      </div>
    </div>
  )
}
