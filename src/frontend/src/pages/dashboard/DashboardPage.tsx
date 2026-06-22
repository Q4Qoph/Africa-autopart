import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { orderApi } from '@/api/orderApi'
import { userApi } from '@/api/userApi'
import type { PartRequest } from '@/types/request'
import type { CustomerOrder, } from '@/types/order'   
import type { User } from '@/types/user'

import { Button } from '@/components/ui/button'
import TrackOrderModal from '@/components/ui/TrackOrderModal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, PackageSearch, History, Settings,
  User2, Mail, Phone, Shield, ChevronRight, Clock, MapPin, Truck,
  Package,
} from 'lucide-react'

type DashboardSection = 'dashboard' | 'garage' | 'orders' | 'settings'


export default function DashboardPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const [section, setSection] = useState<DashboardSection>('dashboard')
  const [trackOpen, setTrackOpen] = useState(false)
  const [trackingToView, setTrackingToView] = useState('')



  // Data
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [userProfile, setUserProfile] = useState<User | null>(null)

  useEffect(() => {
    if (!auth) return
    requestApi.getByEmail(auth.email, auth.token).then(({ data }) => setRequests(data)).catch(() => { })
    orderApi.getByUserId(auth.userId, auth.token).then(({ data }) => setOrders(data)).catch(() => { })
    // Fetch full user profile (assuming getUserById exists)
    userApi.getUserById(auth.userId, auth.token).then(({ data }) => setUserProfile(data)).catch(() => { })
  }, [auth])

  const activeRequests = requests.filter((r) => !r.isSorted).length
  const recentOrders = orders.slice(0, 5)   // last 5 orders

  const sidebarLinks: { key: DashboardSection; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: t('nav_dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'garage', label: t('nav_garage'), icon: <PackageSearch className="w-4 h-4" /> },
    { key: 'orders', label: t('nav_order_history'), icon: <History className="w-4 h-4" /> },
    { key: 'settings', label: t('nav_settings'), icon: <Settings className="w-4 h-4" /> },
  ]

  const roleLabel = ['Admin', 'Customer', 'Supplier']

  // ── Logout ──
  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex-grow font-sans text-[#07110A] dark:text-[#E8F0E9]">
      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-[calc(100vh-68px)] bg-white dark:bg-[#111C14] border-r border-[rgba(0,200,83,0.12)] px-3 py-8">
          {/* User avatar + name at top */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-16 h-16 mb-3">
              <AvatarFallback className="bg-[#00C853]/20 text-[#00C853] text-xl font-bold">
                {auth?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-[#07110A] dark:text-white truncate max-w-full">
              {auth?.email}
            </p>
            <Badge className="mt-1 bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
              {auth?.role !== undefined ? roleLabel[auth.role] : '—'}
            </Badge>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => setSection(link.key)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  section === link.key
                    ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853]'
                    : 'text-[#4A6B50] dark:text-[#7A9A80] hover:bg-[rgba(0,200,83,0.04)]'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
                {section === link.key && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Logout at bottom */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="mt-auto border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 text-xs"
          >
            {t('logout_btn')}
          </Button>
        </aside>

        {/* Mobile nav tabs (top) */}
        <div className="md:hidden fixed top-[68px] inset-x-0 z-30 bg-[#F7FDF8] dark:bg-[#07110A] border-b border-[rgba(0,200,83,0.1)] flex overflow-x-auto">
          {sidebarLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => setSection(link.key)}
              className={cn(
                'flex-1 px-3 py-3 text-xs font-medium text-center whitespace-nowrap',
                section === link.key ? 'text-[#00C853] border-b-2 border-[#00C853]' : 'text-[#4A6B50] dark:text-[#7A9A80]'
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* ── Main Content ── */}
        <main className="flex-1 p-6 md:p-8 overflow-x-auto mt-10 md:mt-0">
          {section === 'dashboard' && (
            <div className="max-w-[900px] mx-auto space-y-6">
              {/* User Profile Card */}
              <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold">{t('profile_card_title') ?? 'Profile'}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-[rgba(0,200,83,0.2)] text-[#00C853] hover:bg-[rgba(0,200,83,0.08)]"
                    onClick={() => setSection('settings')}
                  >
                    {t('edit_profile_btn') ?? 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-[#00C853]/20 text-[#00C853] text-xl font-bold">
                          {auth?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="sm:hidden">
                        <p className="font-semibold">{auth?.email}</p>
                        <Badge className="mt-1 bg-[rgba(0,200,83,0.08)] text-[#00C853] text-[10px]">
                          {auth?.role !== undefined ? roleLabel[auth.role] : '—'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-[#4A6B50]" />
                        <span className="text-[#4A6B50] dark:text-[#7A9A80]">{auth?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#4A6B50]" />
                        <span className="text-[#4A6B50] dark:text-[#7A9A80]">{auth?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#4A6B50]" />
                        <span className="text-[#4A6B50] dark:text-[#7A9A80]">{userProfile?.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#4A6B50]" />
                        <span className="text-[#4A6B50] dark:text-[#7A9A80]">{auth?.role !== undefined ? roleLabel[auth.role] : '—'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats (optional) */}
              <div className="grid grid-cols-3 gap-3">
                <MiniStatCard label={t('kpi_active_requests')} value={activeRequests} color="green" />
                <MiniStatCard label={t('kpi_in_transit')} value={orders.filter(o => o.status === 'Shipped').length} color="blue" />
                <MiniStatCard label={t('kpi_delivered')} value={orders.filter(o => o.status === 'Delivered').length} color="green" />
              </div>

              {/* Recent Orders */}
              <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold">{t('recent_orders_title') ?? 'Recent Orders'}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-[rgba(0,200,83,0.2)] text-[#00C853] hover:bg-[rgba(0,200,83,0.08)]"
                    onClick={() => setSection('orders')}
                  >
                    {t('view_all') ?? 'View All'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm text-center py-6">{t('no_orders')}</p>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.orderId} className="flex items-center justify-between border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-medium">{order.requestedPartName}</p>
                            <div className="flex items-center gap-2 text-xs text-[#4A6B50] dark:text-[#7A9A80] mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.dateCreated).toLocaleDateString()}
                              <MapPin className="w-3 h-3 ml-1" />
                              {order.vehicleMake}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={cn(
                              'text-[10px]',
                              order.status === 'Delivered' ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853]' :
                                order.status === 'Shipped' ? 'bg-blue-400/10 text-blue-400' :
                                  'bg-amber-400/10 text-amber-400'
                            )}>{order.status}</Badge>
                            <p className="text-sm font-semibold mt-1">${order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {section === 'garage' && (
            <div className="max-w-[900px] mx-auto">
              <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{t('garage_title') ?? 'My Garage'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] mb-4">{t('garage_desc') ?? 'Save your vehicles for quick access when searching for parts.'}</p>
                  <div className="flex justify-center py-12">
                    <Link to="/" className="text-[#00C853] font-semibold text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      {t('garage_search_vin') ?? 'Search by VIN to add a vehicle'}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {section === 'orders' && (
            <div className="max-w-[900px] mx-auto space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{t('order_history_title') ?? 'Order History'}</h2>
                <span className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                  {orders.length} {t('orders') ?? 'orders'}
                </span>
              </div>

              {orders.length === 0 ? (
                <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)]">
                  <CardContent className="py-12 text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-[#7A9A80]" />
                    <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">{t('no_orders')}</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.orderId} order={order} t={t} onTrack={(tracking) => {
                    setTrackingToView(tracking)
                    setTrackOpen(true)
                  }} />
                ))
              )}
            </div>
          )}

          {section === 'settings' && (
            <div className="max-w-[900px] mx-auto">
              <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{t('settings_title') ?? 'Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">{t('settings_desc') ?? 'Manage your account settings.'}</p>
                  {/* Example placeholder for future */}
                  <div className="flex justify-center py-12">
                    <Button variant="outline" className="text-sm" onClick={handleLogout}>
                      {t('logout_btn')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

      </div>
      <TrackOrderModal
        open={trackOpen}
        onClose={() => { setTrackOpen(false); setTrackingToView('') }}
        initialTrackingNumber={trackingToView}
      />
    </div>
  )
}

function OrderCard({ order, t, onTrack }: { order: CustomerOrder; t: (key: string) => string; onTrack: (tracking: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  const statusColor =
    order.status === 'Delivered'
      ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853]'
      : order.status === 'Shipped'
        ? 'bg-blue-400/10 text-blue-400'
        : 'bg-amber-400/10 text-amber-400'

  return (
    <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.1)] overflow-hidden transition-all">
      {/* Header – always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[rgba(0,200,83,0.02)] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#7A9A80]">#{order.orderId}</span>
            <h3 className="text-sm font-semibold truncate">{order.requestedPartName}</h3>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#4A6B50] dark:text-[#7A9A80]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(order.dateCreated).toLocaleDateString()}
            </span>
            <span>{order.vehicleMake} {order.model}</span>
            <span className="font-mono">{order.trackingNumber || t('not_assigned')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Badge className={cn('text-[10px]', statusColor)}>{order.status}</Badge>
          <p className="text-sm font-bold text-[#00C853]">${order.total?.toLocaleString() ?? '0'}</p>
          <ChevronRight className={cn('w-4 h-4 text-[#4A6B50] transition-transform', expanded && 'rotate-90')} />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[rgba(0,200,83,0.12)] px-5 py-4 bg-[rgba(0,200,83,0.02)] dark:bg-[rgba(0,200,83,0.02)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('order_date') ?? 'Date'}</p>
              <p className="font-medium">{new Date(order.dateCreated).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('tracking') ?? 'Tracking'}</p>
              <p className="font-medium font-mono">{order.trackingNumber || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('vehicle') ?? 'Vehicle'}</p>
              <p className="font-medium">{order.vehicleMake} {order.model}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A9A80]">{t('description') ?? 'Description'}</p>
              <p className="font-medium text-xs leading-snug">{order.requestDescription || '—'}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-[rgba(0,200,83,0.08)] pt-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
              {t('order_items') ?? 'Order Items'}
            </p>
            <div className="space-y-2">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.partName}</p>
                    <p className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">{item.supplierName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.price.toLocaleString()}</p>
                    <p className="text-xs text-[#4A6B50]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-[rgba(0,200,83,0.08)] pt-3 mt-3">
              <span className="text-sm font-semibold">{t('total') ?? 'Total'}</span>
              <span className="text-lg font-bold text-[#00C853]">${order.total?.toLocaleString() ?? '0'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            {order.trackingNumber && (
              <button
                onClick={() => onTrack(order.trackingNumber!)}
                className="text-xs font-medium text-[#00C853] hover:underline flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" />
                {t('track_order') ?? 'Track Order'}
              </button>
            )}
            {/* Delete button only for pending orders */}
            {order.status === 'Pending' && (
              <button
                onClick={() => {
                  // We'll need to pass a delete handler or use a confirmation dialog
                  if (window.confirm(t('delete_confirm') ?? 'Delete this order?')) {
                    // Call delete API – requires auth and token from parent
                    // We'll handle this by lifting state or using context
                  }
                }}
                className="text-xs text-red-400 hover:underline"
              >
                {t('delete_order') ?? 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )

}

function MiniStatCard({ label, value, color }: { label: string; value: number; color: 'green' | 'blue' }) {
  return (
    <Card className="bg-white dark:bg-[#111C14] border-[rgba(0,200,83,0.15)] text-center">
      <CardContent className="py-4">
        <p className={`text-2xl font-extrabold font-display ${color === 'blue' ? 'text-blue-400' : 'text-[#00C853]'}`}>{value}</p>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A6B50] dark:text-[#7A9A80] mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
