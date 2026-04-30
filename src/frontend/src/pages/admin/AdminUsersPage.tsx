// src/frontend/src/pages/admin/AdminUsersPage.tsx

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/api/userApi';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const roleBadgeClass: Record<number, string> = {
  [UserRole.Admin]: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
  [UserRole.Customer]: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
  [UserRole.Supplier]: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
};

const PAGE_SIZES = [10, 20, 30];

export default function AdminUsersPage() {
  const { auth } = useAuth();
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const roleLabel: Record<number, string> = {
    [UserRole.Admin]: t('users_role_admin'),
    [UserRole.Customer]: t('users_role_customer'),
    [UserRole.Supplier]: t('users_role_supplier'),
  };

  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    userApi
      .getAllUsers(auth.token, pageSize, page)
      .then(({ data }) => {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1); // reset to first page
  };

  // Approve / Delete handlers remain the same, but after approve we might want to refresh current page
  async function handleApprove(id: number) {
    if (!auth) return;
    try {
      await userApi.approveUser(id, auth.token);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
    } catch {
      alert('Failed to approve user.');
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    if (!auth) return;
    try {
      await userApi.deleteUser(id, auth.token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert('Failed to delete user.');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('users_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
          {totalUsers} registered accounts
        </p>
      </div>

      {/* Controls: page size, page navigation */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">Show</label>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded px-2 py-1 text-sm text-[#07110A] dark:text-white"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="border-[rgba(0,200,83,0.2)] text-xs px-2"
          >
            Prev
          </Button>
          <span className="text-xs text-[#07110A] dark:text-white px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="border-[rgba(0,200,83,0.2)] text-xs px-2"
          >
            Next
          </Button>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="Page #"
            className="w-20 bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded px-2 py-1 text-xs text-[#07110A] dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(val)) handlePageChange(val);
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
      ) : (
        <>
          {/* Table – same as before but without the search filter */}
          <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#E8F2EA] dark:bg-[#0D1810]">
                  <Th>{t('users_col_id')}</Th>
                  <Th>{t('users_col_name')}</Th>
                  <Th>{t('users_col_email')}</Th>
                  <Th>{t('users_col_phone')}</Th>
                  <Th>{t('users_col_role')}</Th>
                  <Th>{t('users_col_status')}</Th>
                  <Th>{t('users_col_actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80] font-mono">#{u.id}</Td>
                    <Td className="font-medium text-[#07110A] dark:text-white">{u.firstName} {u.lastName}</Td>
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80]">{u.email}</Td>
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80]">{u.phone}</Td>
                    <Td>
                      <Badge className={`text-[10px] border ${roleBadgeClass[u.role] ?? ''}`}>
                        {roleLabel[u.role] ?? u.role}
                      </Badge>
                    </Td>
                    <Td>
                      {u.role === UserRole.Supplier ? (
                        u.isApproved ? (
                          <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                            {t('users_approved')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-900/30 text-red-400 border-red-700/30 text-[10px]">
                            {tCommon('status_pending')}
                          </Badge>
                        )
                      ) : (
                        <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {u.role === UserRole.Supplier && !u.isApproved && (
                          <Button size="sm" onClick={() => handleApprove(u.id)}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
                          >
                            {t('users_approve')}
                          </Button>
                        )}
                        {u.role !== UserRole.Admin && (
                          <Button size="sm" variant="outline"
                            onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                            className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                      {t('users_no_users')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Page info at bottom (duplicate navigation optional) */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">
              Showing {users.length} of {totalUsers} users
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                Prev
              </Button>
              <span className="text-xs px-2">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Th / Td helpers (unchanged)
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>;
}