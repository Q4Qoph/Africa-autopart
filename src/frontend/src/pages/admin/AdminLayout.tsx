import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'

const sidebarLinks = [
  { label: 'Overview', href: '/admin', end: true },
  { label: 'Users', href: '/admin/users' },
  { label: 'Approve Users', href: '/admin/approve-users' },
  { label: 'Suppliers', href: '/admin/suppliers' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Requests', href: '/admin/requests' },
  { label: 'Contacts', href: '/admin/contacts' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <div className="pt-[68px] md:pt-[132px] flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 min-h-[calc(100vh-68px)] bg-[#E8F2EA] dark:bg-[#0D1810] border-r border-[rgba(0,200,83,0.12)] px-3 py-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4A6B50] dark:text-[#7A9A80] mb-4 px-3">
            Admin Panel
          </p>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((l) => (
              <NavLink
                key={l.href}
                to={l.href}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853]'
                      : 'text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#07110A] dark:hover:text-white hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile subnav */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#E8F2EA] dark:bg-[#0D1810] border-t border-[rgba(0,200,83,0.12)] flex">
          {sidebarLinks.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              end={l.end}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  isActive ? 'text-[#00C853]' : 'text-[rgba(0,0,0,0.45)] dark:text-[rgba(255,255,255,0.5)]'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-20 md:pb-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
