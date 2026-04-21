import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sun, Moon, Phone, Menu, X,
  MapPin, Package, LayoutDashboard, LogOut,
  ChevronDown, Truck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { UserRole } from '@/types/user'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageDropdown } from '@/components/ui/LanguageDropdown'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const btnBase =
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2 transition-all'

function NavLink({
  href,
  children,
  active,
  onClick,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  const cls = cn(
    'text-sm transition-colors',
    active
      ? 'text-[#00C853] font-semibold'
      : 'text-[rgba(0,0,0,0.65)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#07110A] dark:hover:text-white',
  )

  if (href.startsWith('/') && !href.includes('#')) {
    return (
      <Link to={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { auth, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation('nav')
  const navigate = useNavigate()
  const location = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setDrawerOpen(false)
  }

  // Nav link sets — defined inside component so labels react to language changes
  const publicLinks = [
    { label: t('nav_howItWorks'), href: '/#how-it-works' },
    { label: t('nav_suppliers'),  href: '/suppliers' },
    { label: t('nav_trackOrder'), href: '/orders' },
    { label: t('nav_becomeSupplier'), href: '/become-supplier' },
  ]

  const customerLinks = [
    { label: t('nav_myRequests'), href: '/requests' },
    { label: t('nav_suppliers'),  href: '/suppliers' },
  ]

  const adminLinks = [
    { label: t('nav_suppliers'), href: '/suppliers' },
  ]

  const supplierNavLinks = [
    { label: t('nav_rfqInbox'),  href: '/supplier/dashboard' },
    { label: t('nav_myOffers'), href: '/supplier/dashboard' },
    { label: t('nav_myOrders'), href: '/supplier/dashboard' },
  ]

  const navLinks = auth
    ? auth.role === UserRole.Supplier
      ? supplierNavLinks
      : auth.role === UserRole.Admin
      ? adminLinks
      : customerLinks
    : publicLinks

  const isActive = (href: string) =>
    href !== '/' && location.pathname === href

  return (
    <>
      {/* ── Fixed wrapper ── */}
      <div className="fixed top-0 inset-x-0 z-50 flex flex-col">

        {/* ── Topbar — desktop only ── */}
        <div className="hidden md:flex items-center h-9 bg-[#E8F2EA] dark:bg-[#07110A] border-b border-[rgba(0,200,83,0.15)] dark:border-[rgba(0,200,83,0.1)] px-6">
          <div className="max-w-[1260px] w-full mx-auto flex items-center justify-between">

            {/* Left: phone + links */}
            <div className="flex items-center gap-5">
              <a
                href="tel:+254700225100"
                className="flex items-center gap-1.5 text-[#4A6B50] dark:text-[rgba(255,255,255,0.55)] hover:text-[#00C853] dark:hover:text-[#00C853] text-[11px] font-mono transition-colors"
              >
                <Phone className="w-3 h-3" />
                +25377577016
              </a>
              <span className="w-px h-3 bg-[rgba(0,0,0,0.12)] dark:bg-[rgba(255,255,255,0.12)]" />
              <Link to="/about" className="text-[#4A6B50] dark:text-[rgba(255,255,255,0.45)] hover:text-[#07110A] dark:hover:text-[rgba(255,255,255,0.8)] text-[11px] transition-colors">
                {t('topbar_about')}
              </Link>
              <Link to="/contact" className="text-[#4A6B50] dark:text-[rgba(255,255,255,0.45)] hover:text-[#07110A] dark:hover:text-[rgba(255,255,255,0.8)] text-[11px] transition-colors">
                {t('topbar_contact')}
              </Link>
              <Link to="/orders" className="flex items-center gap-1 text-[#4A6B50] dark:text-[rgba(255,255,255,0.45)] hover:text-[#00C853] dark:hover:text-[#00C853] text-[11px] transition-colors">
                <Truck className="w-3 h-3" />
                {t('topbar_trackOrder')}
              </Link>
            </div>

            {/* Right: language + theme */}
            <div className="flex items-center gap-3">
              <LanguageDropdown variant="topbar" />
              <span className="w-px h-3 bg-[rgba(0,0,0,0.12)] dark:bg-[rgba(255,255,255,0.12)]" />
              <button
                onClick={toggleTheme}
                className="w-6 h-6 flex items-center justify-center rounded text-[#4A6B50] dark:text-[rgba(255,255,255,0.55)] hover:text-[#07110A] dark:hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-3.5 h-3.5" />
                  : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Main nav bar ── */}
        <header className="h-[96px] bg-[rgba(247,253,248,0.95)] dark:bg-[rgba(7,17,10,0.95)] backdrop-blur-md border-b border-[rgba(0,200,83,0.12)] flex items-center">
          <div className="max-w-[1260px] w-full mx-auto px-6 flex items-center gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 mr-2">
              <img
                src="/images/logo.png"
                alt="Africa Autopart"
                className="w-52 h-auto"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-6 flex-1">
              {navLinks.map((l) => (
                <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
                  {l.label}
                </NavLink>
              ))}
              {auth?.role === UserRole.Admin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-[#00C853] hover:text-[#39FF88] transition-colors"
                >
                  {t('nav_adminPanel')}
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2">

              {/* Theme toggle — mobile only (desktop has it in topbar) */}
              <button
                onClick={toggleTheme}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {auth ? (
                <>
                  {/* New request CTA — customer only */}
                  {auth.role !== UserRole.Supplier && auth.role !== UserRole.Admin && (
                    <Link
                      to="/requests/new"
                      className={cn(
                        btnBase,
                        'bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] hidden sm:inline-flex text-xs px-3 py-1.5 gap-1.5',
                      )}
                    >
                      <Package className="w-3.5 h-3.5" />
                      {t('cta_newRequest')}
                    </Link>
                  )}

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 focus:outline-none ml-1">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#00C853]/20 text-[#00C853] text-xs font-bold">
                          {String(auth.userId).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-[rgba(0,0,0,0.4)] dark:text-[rgba(255,255,255,0.4)] hidden sm:block" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(0,200,83,0.2)] text-[#07110A] dark:text-white shadow-lg"
                    >
                      {/* User info */}
                      <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                        <p className="text-xs font-semibold text-[#07110A] dark:text-white">
                          {auth.role === UserRole.Supplier
                            ? t('dropdown_roleSupplier')
                            : auth.role === UserRole.Admin
                            ? t('dropdown_roleAdmin')
                            : t('dropdown_roleCustomer')}
                        </p>
                        <p className="text-[10px] text-[#4A6B50] dark:text-[#7A9A80] mt-0.5">
                          ID #{auth.userId}
                        </p>
                      </div>

                      {auth.role === UserRole.Admin && (
                        <>
                          <DropdownMenuItem>
                            <Link to="/admin" className="w-full flex items-center gap-2 text-[#00C853] font-semibold">
                              <LayoutDashboard className="w-3.5 h-3.5" />
                              {t('dropdown_adminPanel')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(0,200,83,0.12)]" />
                        </>
                      )}

                      {auth.role === UserRole.Supplier ? (
                        <>
                          <DropdownMenuItem>
                            <Link to="/supplier/dashboard" className="w-full flex items-center gap-2">
                              <LayoutDashboard className="w-3.5 h-3.5 text-[#00C853]" />
                              {t('dropdown_dashboard')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to="/supplier/dashboard" className="w-full flex items-center gap-2">
                              <Package className="w-3.5 h-3.5 text-[#4A6B50] dark:text-[#7A9A80]" />
                              {t('dropdown_myOffers')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to="/supplier/dashboard" className="w-full flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5 text-[#4A6B50] dark:text-[#7A9A80]" />
                              {t('dropdown_myOrders')}
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem>
                            <Link to="/dashboard" className="w-full flex items-center gap-2">
                              <LayoutDashboard className="w-3.5 h-3.5 text-[#00C853]" />
                              {t('dropdown_dashboard')}
                            </Link>
                          </DropdownMenuItem>
                          {auth.role !== UserRole.Admin && (
                            <DropdownMenuItem>
                              <Link to="/requests" className="w-full flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-[#4A6B50] dark:text-[#7A9A80]" />
                                {t('dropdown_myRequests')}
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}

                      <DropdownMenuSeparator className="bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)]" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        {t('dropdown_logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      btnBase,
                      'hidden sm:inline-flex border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] text-[rgba(0,0,0,0.65)] dark:text-[rgba(255,255,255,0.7)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)] hover:text-[#07110A] dark:hover:text-white text-xs px-3 py-1.5',
                    )}
                  >
                    {t('cta_login')}
                  </Link>
                  <Link
                    to="/requests/new"
                    className={cn(btnBase, 'bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] text-xs px-4 py-1.5 gap-1.5')}
                  >
                    <MapPin className="w-3.5 h-3.5 hidden sm:block" />
                    {t('cta_requestPart')}
                  </Link>
                </>
              )}

              {/* Hamburger — mobile */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(0,0,0,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors ml-1"
                aria-label="Open menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-[300px] z-[70] flex flex-col',
          'bg-white dark:bg-[#0F1F13]',
          'border-r border-[rgba(0,200,83,0.12)]',
          'transition-transform duration-300 ease-in-out lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-[68px] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => setDrawerOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
              AA
            </div>
            <span className="text-[#07110A] dark:text-white font-bold text-sm">Africa Autopart</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              active={isActive(l.href)}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="block px-3 py-2.5 rounded-lg hover:bg-[rgba(0,200,83,0.06)] transition-colors text-sm">
                {l.label}
              </span>
            </NavLink>
          ))}

          {auth?.role === UserRole.Admin && (
            <Link
              to="/admin"
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#00C853] hover:bg-[rgba(0,200,83,0.06)] transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              {t('nav_adminPanel')}
            </Link>
          )}

          <div className="pt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] mt-4 space-y-2">
            {auth ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-[rgba(0,200,83,0.06)] mb-3">
                  <p className="text-xs font-semibold text-[#07110A] dark:text-white">
                    {auth.role === UserRole.Supplier
                      ? t('dropdown_roleSupplier')
                      : auth.role === UserRole.Admin
                      ? t('dropdown_roleAdmin')
                      : t('dropdown_roleCustomer')}
                  </p>
                  <p className="text-[10px] text-[#4A6B50] dark:text-[#7A9A80]">ID #{auth.userId}</p>
                </div>
                {auth.role !== UserRole.Supplier && auth.role !== UserRole.Admin && (
                  <Link
                    to="/requests/new"
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#00C853] text-[#07110A] font-semibold text-sm hover:bg-[#39FF88] transition-colors"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    {t('cta_newRequest')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('dropdown_logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/requests/new"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#00C853] text-[#07110A] font-semibold text-sm hover:bg-[#39FF88] transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  <MapPin className="w-4 h-4" />
                  {t('cta_requestPart')}
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[rgba(0,0,0,0.7)] dark:text-[rgba(255,255,255,0.7)] text-sm hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  {t('cta_login')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[rgba(0,0,0,0.7)] dark:text-[rgba(255,255,255,0.7)] text-sm hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  {t('drawer_createAccount')}
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] shrink-0 space-y-3">
          <a
            href="tel:+254700225100"
            className="flex items-center gap-2 text-[#4A6B50] dark:text-[#7A9A80] text-xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#00C853]" />
            +25377577016
          </a>
          <div className="flex items-center gap-3">
            <LanguageDropdown variant="drawer" />
            <span className="w-px h-3 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.5)] text-xs hover:text-[#07110A] dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === 'dark' ? t('drawer_lightMode') : t('drawer_darkMode')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
