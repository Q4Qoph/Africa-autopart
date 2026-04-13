import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { orderApi } from '@/api/orderApi'
import type { PartRequest } from '@/types/request'
import type { Order } from '@/types/order'
import { OrderStatus } from '@/types/order'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const roleLabel = ['Admin', 'Customer', 'Supplier']
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-5 py-2.5 text-sm hover:bg-[#39FF88] transition-colors'

export default function DashboardPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!auth) return
    requestApi.getAll(auth.token).then(({ data }) =>
      setRequests(data.filter((r) => r.userId === auth.userId)),
    ).catch(() => {})
    orderApi.getAll(auth.token).then(({ data }) => setOrders(data)).catch(() => {})
  }, [auth])

  const activeRequests = requests.filter((r) => !r.isSorted).length
  const inTransit = orders.filter((o) => o.status === OrderStatus.Shipped).length
  const delivered = orders.filter((o) => o.status === OrderStatus.Delivered).length

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07110A] text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[104px]">
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
                <span className="block w-6 h-px bg-[#00C853]" />
                Dashboard
              </p>
              <h1 className="text-3xl font-extrabold text-white font-display">Welcome back</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[#7A9A80] text-sm">User #{auth?.userId}</p>
                <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                  {auth?.role !== undefined ? roleLabel[auth.role] : '—'}
                </Badge>
              </div>
            </div>
            <Link to="/requests/new" className={btnPrimary}>
              + Request a Part
            </Link>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <KpiCard
              title="Active Requests"
              value={activeRequests}
              href="/requests"
              color="green"
            />
            <KpiCard
              title="Orders in Transit"
              value={inTransit}
              href="/orders"
              color="blue"
            />
            <KpiCard
              title="Delivered"
              value={delivered}
              href="/orders"
              color="green"
            />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <QuickLink
              title="My Part Requests"
              desc="View and manage all your spare part requests"
              href="/requests"
            />
            <QuickLink
              title="Browse Suppliers"
              desc="Search parts from verified suppliers across Africa and Saudi Arabia"
              href="/suppliers"
            />
            <QuickLink
              title="My Orders"
              desc="Track active shipments and order history"
              href="/orders"
            />
            <QuickLink
              title="Request a Part"
              desc="Submit a new spare part sourcing request"
              href="/requests/new"
              highlight
            />
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({ title, value, href, color }: { title: string; value: number; href: string; color: 'green' | 'blue' }) {
  return (
    <Link to={href}>
      <Card className="bg-[#111C14] border-[rgba(0,200,83,0.15)] text-white hover:border-[rgba(0,200,83,0.35)] transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-[#7A9A80]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className={`text-4xl font-extrabold font-display ${color === 'blue' ? 'text-blue-400' : 'text-[#00C853]'}`}>
            {value}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickLink({ title, desc, href, highlight }: { title: string; desc: string; href: string; highlight?: boolean }) {
  return (
    <Link
      to={href}
      className={`block p-5 rounded-2xl border transition-colors ${
        highlight
          ? 'bg-[rgba(0,200,83,0.06)] border-[rgba(0,200,83,0.25)] hover:border-[#00C853]'
          : 'bg-[#111C14] border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,200,83,0.2)]'
      }`}
    >
      <p className="text-white font-semibold text-sm mb-1">{title}</p>
      <p className="text-[#7A9A80] text-xs leading-relaxed">{desc}</p>
    </Link>
  )
}
