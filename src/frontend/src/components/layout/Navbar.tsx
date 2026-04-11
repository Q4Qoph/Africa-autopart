import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types/user'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const publicLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Become a Supplier', href: '/become-supplier' },
]

const authLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Requests', href: '/requests' },
  { label: 'Orders', href: '/orders' },
  { label: 'Suppliers', href: '/suppliers' },
]

const supplierLinks = [
  { label: 'Dashboard', href: '/supplier/dashboard' },
  { label: 'My Parts', href: '/supplier/dashboard' },
  { label: 'My Orders', href: '/supplier/dashboard' },
]

const btnBase =
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2 transition-all'

export default function Navbar() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const links = auth
    ? auth.role === UserRole.Supplier
      ? supplierLinks
      : authLinks
    : publicLinks

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[68px] bg-[rgba(7,17,10,0.92)] backdrop-blur-md border-b border-[rgba(0,200,83,0.15)] flex items-center">
      <div className="max-w-[1260px] w-full mx-auto px-6 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-sm">
            AA
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-[10px] text-[rgba(255,255,255,0.55)] uppercase tracking-widest font-mono">
              Cross-Border Sourcing
            </p>
            <p className="text-white font-bold text-sm">Africa Autopart</p>
          </div>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-5 flex-1">
          {links.map((l) =>
            l.href.startsWith('/') && !l.href.includes('#') ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ),
          )}
          {auth?.role === UserRole.Admin && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-[#00C853] hover:text-[#39FF88] transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Auth actions */}
        <div className="ml-auto flex items-center gap-2">
          {auth ? (
            <>
              {auth.role !== UserRole.Supplier && (
                <Link
                  to="/requests/new"
                  className={cn(btnBase, 'bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] hidden sm:inline-flex')}
                >
                  + Request Part
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none ml-1">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#00C853]/20 text-[#00C853] text-xs font-bold">
                      {String(auth.userId).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#111C14] border-[rgba(0,200,83,0.2)] text-white">
                  {auth?.role === UserRole.Admin && (
                    <>
                      <DropdownMenuItem>
                        <Link to="/admin" className="w-full text-[#00C853] font-semibold">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[rgba(0,200,83,0.12)]" />
                    </>
                  )}
                  {auth?.role === UserRole.Supplier ? (
                    <>
                      <DropdownMenuItem>
                        <Link to="/supplier/dashboard" className="w-full">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/supplier/dashboard" className="w-full">My Parts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/supplier/dashboard" className="w-full">My Orders</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link to="/dashboard" className="w-full">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/requests" className="w-full">My Requests</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/orders" className="w-full">My Orders</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
                    Logout
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
                  'border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white',
                )}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={cn(btnBase, 'bg-[#00C853] text-[#07110A] hover:bg-[#39FF88]')}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
