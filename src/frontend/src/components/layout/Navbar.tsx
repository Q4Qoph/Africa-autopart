// src/frontend/src/components/layout/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  User,
  UserPlus,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import { useExternalCart } from "@/context/ExternalCartContext";
import TrackOrderModal from "@/components/ui/TrackOrderModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "text-sm font-semibold transition-colors",
    active
      ? "text-[#00C853]"
      : "text-slate-200 hover:text-[#00C853]",
  );

  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("nav");
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const { itemCount: externalItemCount } = useExternalCart();
  const [trackOpen, setTrackOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setDrawerOpen(false);
  }

  // Nav link sets — defined inside component so labels react to language changes
  const publicLinks = [
    { label: t("nav_howItWorks"), href: "/#how-it-works" },
    { label: t("nav_suppliers"), href: "/suppliers" },
    { label: t("nav_becomeSupplier"), href: "/become-supplier" },
    { label: t("nav_shop"), href: "/shop" },
  ];

  const customerLinks = [
    { label: t("nav_myRequests"), href: "/requests" },
    { label: t("nav_suppliers"), href: "/suppliers" },
    { label: t("nav_shop"), href: "/shop" },
  ];

  const adminLinks = [{ label: t("nav_suppliers"), href: "/suppliers" }];

  const supplierNavLinks = [
    { label: t("nav_rfqInbox"), href: "/supplier/dashboard" },
    { label: t("nav_myOffers"), href: "/supplier/dashboard" },
    { label: t("nav_myOrders"), href: "/supplier/dashboard" },
  ];

  const navLinks = auth
    ? auth.role === UserRole.Supplier
      ? supplierNavLinks
      : auth.role === UserRole.Admin
        ? adminLinks
        : customerLinks
    : publicLinks;

  const isActive = (href: string) => href !== "/" && location.pathname === href;

  return (
    <>
      {/* ── Fixed wrapper ── */}
      <div className="fixed top-0 inset-x-0 z-50 flex flex-col shadow-md">
        
        {/* ── Main nav bar (PartSouq UI & Africa Autopart Brand) ── */}
        <header className="h-[80px] bg-[#003020] border-b border-slate-800 text-white flex items-center select-none">
          <div className="w-full px-4 flex items-center justify-between">
            
            {/* Left: Brand Logo (Africa Autopart Branding) */}
            <Link to="/" className="flex items-center group font-sans shrink-0 mr-4">
              {/* AA Badge in Green branding colors */}
              <svg viewBox="0 0 100 100" className="w-9 h-9 mr-2.5 transition-transform duration-500 group-hover:rotate-180" fill="none">
                <circle cx="50" cy="50" r="45" fill="#00933C" />
                <circle cx="50" cy="50" r="35" stroke="#00C853" strokeWidth="6" strokeDasharray="12 6" />
                <circle cx="50" cy="50" r="20" fill="#00C853" />
                <text x="50" y="58" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#07110A" textAnchor="middle">AA</text>
              </svg>
              {/* Text logo */}
              <span className="font-extrabold text-xl tracking-tight italic">
                <span className="text-white">Africa</span>
                <span className="text-[#00C853] ml-1">Autopart</span>
              </span>
            </Link>

            {/* Middle: Language & Currency Selectors + Navlinks */}
            <div className="hidden lg:flex items-center gap-5 flex-1 font-sans ml-4">
              {/* Language Selection */}
              <div className="relative shrink-0">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none bg-[#002514] border border-slate-700 text-slate-100 font-bold text-xs rounded px-3 py-1.5 pr-8 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <option value="en">🇬🇧 ENGLISH</option>
                  <option value="fr">🇫🇷 FRANÇAIS</option>
                  <option value="am">🇪🇹 አማርኛ</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Currency Selection */}
              <div className="relative shrink-0">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="appearance-none bg-[#002514] border border-slate-700 text-slate-100 font-bold text-xs rounded px-3 py-1.5 pr-8 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <option value="USD">USD</option>
                  <option value="KES">KES</option>
                  <option value="SAR">SAR</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <span className="w-px h-5 bg-slate-800 mx-2" />

              {/* Desktop Nav Links */}
              <nav className="flex items-center gap-5">
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
                    {t("nav_adminPanel")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setTrackOpen(true)}
                  className="text-sm font-semibold text-slate-200 hover:text-[#00C853] transition-colors"
                >
                  Track Order
                </button>
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3 font-sans shrink-0">
              
              {auth ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to={
                      auth.role === UserRole.Supplier
                        ? "/supplier/dashboard"
                        : auth.role === UserRole.Admin
                          ? "/admin"
                          : "/dashboard"
                    }
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Shopping Cart Pill */}
              <Link
                to="/cart"
                className="bg-black border border-slate-700 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-2 transition-all shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{externalItemCount}</span>
              </Link>

              {/* Hamburger menu trigger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          
          {/* Content */}
          <div className="relative w-80 max-w-full bg-[#0c1524] h-full shadow-2xl p-6 flex flex-col gap-6 text-white z-[80] font-sans">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center">
                {/* Logo badge (Africa Autopart Branding) */}
                <svg viewBox="0 0 100 100" className="w-8 h-8 mr-2" fill="none">
                  <circle cx="50" cy="50" r="45" fill="#00933C" />
                  <circle cx="50" cy="50" r="35" stroke="#00C853" strokeWidth="6" strokeDasharray="12 6" />
                  <circle cx="50" cy="50" r="20" fill="#00C853" />
                  <text x="50" y="58" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#07110A" textAnchor="middle">AA</text>
                </svg>
                <span className="font-extrabold text-lg italic text-white">
                  <span>Africa</span>
                  <span className="text-[#00C853] ml-1">Autopart</span>
                </span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm font-semibold">
              <Link to="/" onClick={() => setDrawerOpen(false)} className="hover:text-amber-500 py-2 border-b border-slate-800">Home</Link>
              <Link to="/shop" onClick={() => setDrawerOpen(false)} className="hover:text-amber-500 py-2 border-b border-slate-800">Catalog / Shop</Link>
              <Link to="/suppliers" onClick={() => setDrawerOpen(false)} className="hover:text-amber-500 py-2 border-b border-slate-800">Suppliers</Link>
              <Link to="/become-supplier" onClick={() => setDrawerOpen(false)} className="hover:text-amber-500 py-2 border-b border-slate-800">Become a Supplier</Link>
              <button
                onClick={() => { setDrawerOpen(false); setTrackOpen(true); }}
                className="text-left hover:text-amber-500 py-2 border-b border-slate-800 flex items-center gap-1.5"
              >
                Track Order
              </button>
            </div>

            {/* Language & Currency in mobile drawer */}
            <div className="flex flex-col gap-3 py-4 border-t border-slate-800 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-slate-900 border border-slate-800 text-slate-100 font-bold text-xs rounded px-3 py-2 outline-none w-full"
                >
                  <option value="en">🇬🇧 ENGLISH</option>
                  <option value="fr">🇫🇷 FRANÇAIS</option>
                  <option value="am">🇪🇹 አማርኛ</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Currency</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-100 font-bold text-xs rounded px-3 py-2 outline-none w-full"
                >
                  <option value="USD">USD</option>
                  <option value="KES">KES</option>
                  <option value="SAR">SAR</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              {auth ? (
                <>
                  <div className="bg-slate-800/50 p-3 rounded text-xs">
                    Logged in as: <strong className="text-white block mt-0.5">{auth.email}</strong>
                  </div>
                  <Link
                    to={auth.role === UserRole.Supplier ? "/supplier/dashboard" : auth.role === UserRole.Admin ? "/admin" : "/dashboard"}
                    className="bg-blue-600 text-center text-white py-2.5 rounded font-bold hover:bg-blue-700"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setDrawerOpen(false); }}
                    className="bg-red-600 text-white py-2.5 rounded font-bold hover:bg-red-700"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 text-center text-white py-2.5 rounded font-bold hover:bg-blue-700"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-slate-700 text-center text-white py-2.5 rounded font-bold hover:bg-slate-600"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      <TrackOrderModal open={trackOpen} onClose={() => setTrackOpen(false)} />
    </>
  );
}
