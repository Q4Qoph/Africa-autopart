import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/api/userApi'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// getAllUsers only returns id/firstName/lastName/email/phone
interface UserSummary {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AdminApproveUsersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<User | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [approving, setApproving] = useState(false)

  const roleLabel: Record<number, string> = {
    [UserRole.Admin]: t('users_role_admin'),
    [UserRole.Customer]: t('users_role_customer'),
    [UserRole.Supplier]: t('users_role_supplier'),
  }

  // Load the user list once
  useEffect(() => {
    if (!auth) return
    userApi
      .getAllUsers(auth.token)
      .then(({ data }) => setUsers(data as UserSummary[]))
      .catch(() => {})
      .finally(() => setLoadingList(false))
  }, [auth])

  // When a user is selected, fetch full detail (includes role + isApproved)
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

  async function handleApprove() {
    if (!auth || !detail) return
    setApproving(true)
    try {
      await userApi.approveUser(detail.id, auth.token)
      setDetail((prev) => prev ? { ...prev, isApproved: true } : prev)
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
        {/* User list */}
        <div className="lg:w-80 shrink-0 rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
          <div className="bg-[#E8F2EA] dark:bg-[#0D1810] px-4 py-3 border-b border-[rgba(0,200,83,0.12)]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
              {t('approvals_all_users', { count: users.length })}
            </p>
          </div>
          {loadingList ? (
            <p className="px-4 py-6 text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('approvals_loading_list')}</p>
          ) : (
            <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
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
            </ul>
          )}
        </div>

        {/* Detail panel */}
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
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-0.5">{t('approvals_user_id', { id: detail.id })}</p>
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
                        {detail.isApproved ? t('approvals_badge_approved') : t('approvals_badge_pending')}
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
