// src/frontend/src/pages/admin/AdminDashboardPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { statsApi } from '@/api/userApi'; // or import from new statsApi file
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatsResponse } from '@/types/user';

export default function AdminDashboardPage() {
  const { auth } = useAuth();
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    statsApi.getStats(auth.token)
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth]);

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
          <StatCard title={t('stat_totalUsers')} value={stats.total_User} href="/admin/users" />
          <StatCard title={t('stat_totalOrders')} value={stats.total_Order} href="/admin/orders" />
          <StatCard title={t('stat_pendingOrders')} value={stats.pending_Order} href="/admin/orders" highlight />
          <StatCard title={t('stat_completedOrders')} value={stats.completed_Order} href="/admin/orders" />
          <StatCard title={t('stat_inProgressOrders')} value={stats.inProgress_Order} href="/admin/orders" />
          <StatCard title={t('stat_totalRequests')} value={stats.total_Request} href="/admin/requests" />
        </div>
      ) : (
        <p className="text-red-400 text-sm">{t('failed_stats')}</p>
      )}
    </div>
  );
}

// StatCard remains identical – just re-use
function StatCard({ title, value, href, highlight }: { title: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Link to={href}>
      <Card
        className={`bg-white dark:bg-[#111C14] border transition-colors cursor-pointer hover:border-[rgba(0,200,83,0.35)] ${
          highlight ? 'border-[rgba(0,200,83,0.4)]' : 'border-[rgba(0,200,83,0.15)]'
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className={`text-4xl font-extrabold ${highlight ? 'text-amber-400' : 'text-[#00C853]'}`}>{value}</span>
        </CardContent>
      </Card>
    </Link>
  );
}