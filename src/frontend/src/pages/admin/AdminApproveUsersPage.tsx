// src/frontend/src/pages/admin/AdminApproveUsersPage.tsx

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/api/userApi'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10 // you can later make this configurable

export default function AdminApproveUsersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')

  // --- Paginated user list state ---
  const [users, setUsers] = useState<User[]>([])          // full User objects returned by API
  const [loadingList, setLoadingList] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  // --- Detail panel state ---
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<User | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [approving, setApproving] = useState(false)

  // --- Manual ID input ---
  const [manualId, setManualId] = useState('')

  const roleLabel: Record<number, string> = {
    [UserRole.Admin]: t('users_role_admin'),
    [UserRole.Customer]: t('users_role_customer'),
    [UserRole.Supplier]: t('users_role_supplier'),
  }

  // Fetch one page of users
  useEffect(() => {
    if (!auth) return
    setLoadingList(true)
    userApi
      .getAllUsers(auth.token, PAGE_SIZE, page)   // pageSize, pageNumber
      .then(({ data }) => {
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setTotalUsers(data.totalUsers)
      })
      .catch(() => {})
      .finally(() => setLoadingList(false))
  }, [auth, page])

  // Load full detail for selected user
  function selectUser(id: number) {
    if (!auth) return
    setSelectedId(id)
    setDetail(null)
    setLoadingDetail(true)
    userApi
      .getUserById(id, auth.token)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }

  // Fetch user by manually typed ID
  function fetchById() {
    const id = parseInt(manualId, 10)
    if (isNaN(id)) return
    selectUser(id)
  }

  async function handleApprove() {
    if (!auth || !detail) return
    setApproving(true)
    try {
      await userApi.approveUser(detail.id, auth.token)
      // Update detail panel
      setDetail((prev) => (prev ? { ...prev, isApproved: true } : prev))
      // Also update the user in the current page list (if visible)
      setUsers((prev) =>
        prev.map((u) => (u.id === detail.id ? { ...u, isApproved: true } : u))
      )
    } catch {
      alert(t('approvals_approve_error'))
    } finally {
      setApproving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('approvals_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
          {t('approvals_select_notice')}
        </p>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* ========== LEFT SIDEBAR ========== */}
        <div className="lg:w-80 shrink-0 rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden flex flex-col">
          {/* Header with manual ID input */}
          <div className="bg-[#E8F2EA] dark:bg-[#0D1810] px-4 py-3 border-b border-[rgba(0,200,83,0.12)]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
              {t('approvals_all_users', { count: totalUsers })}
            </p>
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                placeholder="User ID"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchById() }}
                className="flex-1 bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded px-2 py-1 text-xs text-[#07110A] dark:text-white placeholder-[#7A9A80] focus:outline-none focus:border-[#00C853]"
              />
              <Button
                size="sm"
                onClick={fetchById}
                className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
              >
                Go
              </Button>
            </div>
          </div>

          {/* Loading / list */}
          {loadingList ? (
            <p className="px-4 py-6 text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('approvals_loading_list')}</p>
          ) : (
            <>
              <ul className="divide-y divide-[rgba(255,255,255,0.04)] flex-1 overflow-y-auto max-h-[60vh]">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => selectUser(u.id)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)] ${
                        selectedId === u.id
                          ? 'bg-[rgba(0,200,83,0.06)] border-l-2 border-[#00C853]'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <p className="text-[#07110A] dark:text-white text-sm font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs mt-0.5">{u.email}</p>
                    </button>
                  </li>
                ))}
                {users.length === 0 && (
                  <li className="px-4 py-6 text-[#4A6B50] dark:text-[#7A9A80] text-sm text-center">
                    {t('users_no_users')}
                  </li>
                )}
              </ul>

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[rgba(0,200,83,0.12)]">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="border-[rgba(0,200,83,0.2)] text-xs h-7 px-2"
                >
                  Prev
                </Button>
                <span className="text-[10px] font-mono text-[#4A6B50] dark:text-[#7A9A80]">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border-[rgba(0,200,83,0.2)] text-xs h-7 px-2"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ========== RIGHT DETAIL PANEL (unchanged) ========== */}
        <div className="flex-1 rounded-xl border border-[rgba(0,200,83,0.15)] bg-white dark:bg-[#111C14]">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                {t('approvals_select_prompt')}
              </p>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('approvals_loading_detail')}</p>
            </div>
          ) : !detail ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-400 text-sm">{t('approvals_detail_error')}</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#07110A] dark:text-white">
                    {detail.firstName} {detail.lastName}
                  </h2>
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-0.5">
                    {t('approvals_user_id', { id: detail.id })}
                  </p>
                </div>
                <Badge
                  className={
                    detail.role === UserRole.Admin
                      ? 'bg-purple-900/40 text-purple-300 border-purple-700/30'
                      : detail.role === UserRole.Supplier
                      ? 'bg-amber-900/40 text-amber-300 border-amber-700/30'
                      : 'bg-blue-900/40 text-blue-300 border-blue-700/30'
                  }
                >
                  {roleLabel[detail.role] ?? t('users_role_admin')}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <InfoRow label={t('approvals_info_email')} value={detail.email} />
                <InfoRow label={t('approvals_info_phone')} value={detail.phone} />
                <InfoRow
                  label={t('approvals_info_role')}
                  value={roleLabel[detail.role] ?? String(detail.role)}
                />
                {detail.role === UserRole.Supplier && (
                  <InfoRow
                    label={t('approvals_info_status')}
                    value={
                      <Badge
                        className={
                          detail.isApproved
                            ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]'
                            : 'bg-amber-900/30 text-amber-300 border-amber-700/30 text-[10px]'
                        }
                      >
                        {detail.isApproved
                          ? t('approvals_badge_approved')
                          : t('approvals_badge_pending')}
                      </Badge>
                    }
                  />
                )}
              </div>

              {/* Action */}
              {detail.role === UserRole.Supplier && !detail.isApproved && (
                <div className="border-t border-[rgba(0,200,83,0.1)] pt-5">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-3">
                    {t('approvals_approve_notice')}
                  </p>
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold px-6"
                  >
                    {approving ? t('approvals_approving') : t('approvals_approve_btn')}
                  </Button>
                </div>
              )}

              {detail.role === UserRole.Supplier && detail.isApproved && (
                <div className="border-t border-[rgba(0,200,83,0.1)] pt-5">
                  <p className="text-[#00C853] text-sm">
                    {t('approvals_already_approved')}
                  </p>
                </div>
              )}

              {detail.role !== UserRole.Supplier && (
                <div className="border-t border-[rgba(0,200,83,0.1)] pt-5">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t('approvals_not_applicable')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="bg-[#E8F2EA] dark:bg-[#0D1810] rounded-lg px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-1">
        {label}
      </p>
      <div className="text-[#07110A] dark:text-white text-sm">{value}</div>
    </div>
  )
}