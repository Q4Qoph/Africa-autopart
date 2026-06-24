import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { orderApi } from '@/api/orderApi'
import type { CustomerOrder } from '@/types/order'
import { mapNewOrderToCustomerOrder } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown } from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  'Pending': 'bg-amber-900/30 text-amber-300 border-amber-700/30',
  'Shipped': 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  'Delivered': 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
  'Unknown': 'bg-gray-400/20 text-gray-400 border-gray-400/30',
}

const statusOptions = [
  { code: 0, string: 'Pending', key: 'orders_status_pending' },
  { code: 1, string: 'Shipped', key: 'orders_status_shipped' },
  { code: 2, string: 'Delivered', key: 'orders_status_delivered' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function refreshOrders() {
    if (!auth) return
    try {
      const [newRes, legacyRes] = await Promise.all([
        orderApi.getAllNewOrders(auth.token),
        orderApi.getAll(auth.token)
      ])
      const newMapped = newRes.data.map(o => ({ ...mapNewOrderToCustomerOrder(o), isNew: true }))
      const legacyMapped = legacyRes.data.map(o => ({ ...o, isNew: false }))
      const merged = [...newMapped, ...legacyMapped].sort((a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      )
      setOrders(merged)
    } catch {}
  }

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    refreshOrders().finally(() => setLoading(false))
  }, [auth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null)
      }
    }
    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  async function handleStatusChange(orderId: number, newStatusNumber: number) {
    if (!auth) return
    setSavingId(orderId)
    try {
      const orderToUpdate = orders.find(o => o.orderId === orderId)
      if (orderToUpdate?.isNew) {
        await orderApi.updateNewOrderStatus(orderId, newStatusNumber, auth.token)
      } else {
        await orderApi.updateStatus(orderId, { status: newStatusNumber }, auth.token)
      }
      await refreshOrders()
      setOpenDropdownId(null)
    } catch {
      alert(t('orders_save_error'))
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(orderId: number) {
    if (!window.confirm(t('orders_delete_confirm'))) return
    if (!auth) return
    try {
      await orderApi.delete(orderId, auth.token)
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId))
    } catch {
      alert(t('orders_delete_error'))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('orders_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
          {t('orders_count', { count: orders.length })}
        </p>
      </div>

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#E8F2EA] dark:bg-[#0D1810]">
                <Th>{t('orders_col_id')}</Th>
                <Th>{t('orders_col_part')}</Th>
                <Th>{t('orders_col_vehicle')}</Th>
                <Th>{t('orders_col_price')}</Th>
                <Th>{t('orders_col_tracking')}</Th>
                <Th>{t('orders_col_status')}</Th>
                <Th>{t('orders_col_actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isOpen = openDropdownId === order.orderId
                const isStatusOpen = openDropdownId === `status-${order.orderId}`
                const isSaving = savingId === order.orderId
                const hasItems = order.orderItems && order.orderItems.length > 0

                return (
                  <React.Fragment key={order.orderId}>
                    <tr
                      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                      onClick={() => hasItems && setOpenDropdownId(isOpen ? null : order.orderId)}
                    >
                      <Td className="text-[#4A6B50] dark:text-[#7A9A80] font-mono text-xs">#{order.orderId}</Td>
                      <Td>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[#07110A] dark:text-white font-medium">{order.requestedPartName || '—'}</p>
                          {order.isNew && (
                            <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 text-[9px] px-1.5 py-0.5 border border-sky-500/20 font-normal">
                              VIN Catalog
                            </Badge>
                          )}
                        </div>
                        {hasItems && (
                          <span className="text-[10px] text-[#7A9A80] mt-0.5 block">
                            {order.orderItems!.length} item{order.orderItems!.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </Td>
                      <Td className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                        {order.vehicleMake} {order.model}
                      </Td>
                      <Td className="text-[#07110A] dark:text-white">
                        ${order.total?.toLocaleString() ?? '0'}
                      </Td>
                      <Td className="font-mono text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                        {order.trackingNumber || <span className="text-[#7A9A80] dark:text-[#3D5942]">—</span>}
                      </Td>
                      <Td>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenDropdownId(isStatusOpen ? null : `status-${order.orderId}`)
                            }}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 group"
                          >
                            <Badge className={`text-[10px] border ${statusColor[order.status] ?? statusColor['Unknown']}`}>
                              {order.status}
                            </Badge>
                            <ChevronDown className={`w-3 h-3 text-[#4A6B50] dark:text-[#7A9A80] transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                            {isSaving && (
                              <span className="w-3 h-3 border-2 border-[#00C853]/30 border-t-[#00C853] rounded-full animate-spin ml-1" />
                            )}
                          </button>

                          {isStatusOpen && (
                            <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1A2A1E] border border-[rgba(0,200,83,0.2)] rounded-lg shadow-lg py-1 min-w-[140px]">
                              {statusOptions.map((opt) => {
                                const isCurrent = order.status === opt.string
                                return (
                                  <button
                                    key={opt.code}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(order.orderId, opt.code)
                                    }}
                                    disabled={isSaving}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${isCurrent
                                        ? 'text-[#00C853] bg-[rgba(0,200,83,0.08)]'
                                        : 'text-[#07110A] dark:text-white hover:bg-[rgba(0,200,83,0.04)]'
                                      }`}
                                  >
                                    {t(opt.key)}
                                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#00C853]" />}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(order.orderId)
                          }}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors"
                        >
                          {t('orders_delete')}
                        </button>
                      </Td>
                    </tr>

                    {/* Expanded order items */}
                    {isOpen && hasItems && (
                      <tr key={`items-${order.orderId}`}>
                        <td colSpan={7} className="bg-[rgba(0,200,83,0.02)] dark:bg-[rgba(0,200,83,0.02)] border-b border-[rgba(0,200,83,0.12)] px-6 py-4">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                            {t('orders_items') ?? 'Order Items'}
                          </p>
                          <div className="space-y-2">
                            {order.orderItems!.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div>
                                  <p className="font-medium text-[#07110A] dark:text-white">{item.partName}</p>
                                  <p className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">{item.supplierName}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[#07110A] dark:text-white">${item.price.toLocaleString()}</p>
                                  <p className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center border-t border-[rgba(0,200,83,0.08)] pt-3 mt-3">
                            <span className="text-sm font-semibold text-[#07110A] dark:text-white">{t('orders_total') ?? 'Total'}</span>
                            <span className="text-lg font-bold text-[#00C853]">${order.total?.toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t('orders_no_orders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>
}