import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { orderApi } from '@/api/orderApi'
import type { Order } from '@/types/order'
import { OrderStatus } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusLabel: Record<number, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
}

const statusClass: Record<number, string> = {
  [OrderStatus.Pending]: 'bg-amber-900/30 text-amber-300 border-amber-700/30',
  [OrderStatus.Shipped]: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  [OrderStatus.Delivered]: 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
}

export default function AdminOrdersPage() {
  const { auth } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) return
    orderApi
      .getAll(auth.token)
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  async function handleDelete(id: number, tracking: string) {
    if (!window.confirm(`Delete order "${tracking}"? This cannot be undone.`)) return
    if (!auth) return
    try {
      await orderApi.delete(id, auth.token)
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch {
      alert('Failed to delete order.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          Admin
        </p>
        <h1 className="text-2xl font-extrabold text-white">Orders</h1>
        <p className="text-[#7A9A80] text-sm mt-1">{orders.length} total orders</p>
      </div>

      {loading ? (
        <p className="text-[#7A9A80] text-sm">Loading orders…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#0D1810]">
                <Th>Tracking #</Th>
                <Th>Part</Th>
                <Th>Supplier</Th>
                <Th>Status</Th>
                <Th>Price (KES)</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <Td className="font-mono text-[#00C853] text-xs">{o.trackingNumber}</Td>
                  <Td className="text-white font-medium">
                    {o.part?.partName ?? `Part #${o.partId}`}
                  </Td>
                  <Td className="text-[#7A9A80]">
                    {o.supplier?.businessName ?? `Supplier #${o.supplierId}`}
                  </Td>
                  <Td>
                    <Badge className={`text-[10px] border ${statusClass[o.status] ?? ''}`}>
                      {statusLabel[o.status] ?? o.status}
                    </Badge>
                  </Td>
                  <Td className="text-white">{o.price.toLocaleString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(o.id, o.trackingNumber)}
                      className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                    >
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A9A80] text-sm">
                    No orders found.
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
    <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#7A9A80]">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>
}
