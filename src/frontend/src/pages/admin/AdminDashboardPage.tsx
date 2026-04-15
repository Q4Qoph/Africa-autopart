import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/api/userApi'
import { supplierApi } from '@/api/supplierApi'
import { orderApi } from '@/api/orderApi'
import { requestApi } from '@/api/requestApi'
import { UserRole } from '@/types/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalUsers: number
  pendingApprovals: number
  totalSuppliers: number
  totalOrders: number
  openRequests: number
  totalRequests: number
}

export default function AdminDashboardPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) return
    const token = auth.token
    Promise.all([
      userApi.getAllUsers(token),
      supplierApi.getAll(),
      orderApi.getAll(token),
      requestApi.getAll(token),
    ])
      .then(([usersRes, suppliersRes, ordersRes, requestsRes]) => {
        const users = usersRes.data
        setStats({
          totalUsers: users.length,
          pendingApprovals: users.filter(
            (u) => u.role === UserRole.Supplier && !u.isApproved,
          ).length,
          totalSuppliers: suppliersRes.data.length,
          totalOrders: ordersRes.data.length,
          openRequests: requestsRes.data.filter((r) => !r.isSorted).length,
          totalRequests: requestsRes.data.length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  return (
    <div>
      <div className="mb-8">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('dashboard_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">{t('dashboard_subtext')}</p>
      </div>

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title={t('stat_totalUsers')} value={stats.totalUsers} href="/admin/users" />
          <StatCard
            title={t('stat_pendingApprovals')}
            value={stats.pendingApprovals}
            href="/admin/users"
            highlight={stats.pendingApprovals > 0}
          />
          <StatCard title={t('stat_suppliers')} value={stats.totalSuppliers} href="/admin/suppliers" />
          <StatCard title={t('stat_totalOrders')} value={stats.totalOrders} href="/admin/orders" />
          <StatCard
            title={t('stat_openRequests')}
            value={stats.openRequests}
            href="/admin/requests"
            highlight={stats.openRequests > 0}
          />
          <StatCard title={t('stat_totalRequests')} value={stats.totalRequests} href="/admin/requests" />
        </div>
      ) : (
        <p className="text-red-400 text-sm">{t('failed_stats')}</p>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  href,
  highlight,
}: {
  title: string
  value: number
  href: string
  highlight?: boolean
}) {
  return (
    <Link to={href}>
      <Card
        className={`bg-white dark:bg-[#111C14] border transition-colors cursor-pointer hover:border-[rgba(0,200,83,0.35)] ${
          highlight
            ? 'border-[rgba(0,200,83,0.4)]'
            : 'border-[rgba(0,200,83,0.15)]'
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span
            className={`text-4xl font-extrabold ${
              highlight ? 'text-amber-400' : 'text-[#00C853]'
            }`}
          >
            {value}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
