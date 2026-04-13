import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { orderApi } from '@/api/orderApi'
import type { Order } from '@/types/order'
import { OrderStatus, statusLabel } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const statusClass: Record<number, string> = {
  [OrderStatus.Pending]: 'bg-amber-900/30 text-amber-300 border-amber-700/30',
  [OrderStatus.Shipped]: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  [OrderStatus.Delivered]: 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
}

interface EditState {
  status: number
  trackingNumber: string
  saving: boolean
  error: string
}

export default function AdminOrdersPage() {
  const { auth } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState>({ status: 0, trackingNumber: '', saving: false, error: '' })

  useEffect(() => {
    if (!auth) return
    orderApi
      .getAll(auth.token)
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  function startEdit(order: Order) {
    setEditingId(order.id)
    setEditState({ status: order.status, trackingNumber: order.trackingNumber ?? '', saving: false, error: '' })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(order: Order) {
    if (!auth) return
    setEditState((s) => ({ ...s, saving: true, error: '' }))
    try {
      await orderApi.update(
        order.id,
        {
          supplierId: 0,
          partId: 0,
          partRequestId: 0,
          price: order.price,
          status: editState.status,
          trackingNumber: editState.trackingNumber,
        },
        auth.token,
      )
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: editState.status, trackingNumber: editState.trackingNumber }
            : o,
        ),
      )
      setEditingId(null)
    } catch {
      setEditState((s) => ({ ...s, saving: false, error: 'Failed to save. Please try again.' }))
    }
  }

  async function handleDelete(orderId: number) {
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    if (!auth) return
    try {
      await orderApi.delete(orderId, auth.token)
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
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
                <Th>#</Th>
                <Th>Part</Th>
                <Th>Supplier</Th>
                <Th>Vehicle</Th>
                <Th>Price</Th>
                <Th>Tracking</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr
                    key={o.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <Td className="text-[#7A9A80] font-mono text-xs">#{o.id}</Td>
                    <Td>
                      <p className="text-white font-medium">{o.part?.partName ?? '—'}</p>
                      <p className="text-[#3D5942] text-xs font-mono">{o.part?.partNumber ?? ''}</p>
                    </Td>
                    <Td>
                      <p className="text-[#7A9A80]">{o.supplier?.businessName ?? '—'}</p>
                      <p className="text-[#3D5942] text-xs">{o.supplier?.email ?? ''}</p>
                    </Td>
                    <Td className="text-[#7A9A80] text-xs">{o.partRequest?.vehicleMake} {o.partRequest?.model}</Td>
                    <Td className="text-white">${o.price.toLocaleString()}</Td>
                    <Td className="font-mono text-xs text-[#7A9A80]">
                      {o.trackingNumber || <span className="text-[#3D5942]">—</span>}
                    </Td>
                    <Td>
                      <Badge className={`text-[10px] border ${statusClass[o.status] ?? ''}`}>
                        {statusLabel(o.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => editingId === o.id ? cancelEdit() : startEdit(o)}
                          className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                        >
                          {editingId === o.id ? 'Close' : 'Update'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(o.id)}
                          className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                        >
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </tr>

                  {/* Inline edit row */}
                  {editingId === o.id && (
                    <tr key={`edit-${o.id}`}>
                      <td colSpan={8} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-6 py-4">
                        <div className="flex items-end gap-4 flex-wrap">
                          <div className="space-y-1">
                            <p className="text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">Status</p>
                            <select
                              value={editState.status}
                              onChange={(e) => setEditState((s) => ({ ...s, status: Number(e.target.value) }))}
                              className="h-9 px-3 rounded-lg bg-[#111C14] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#00C853] text-sm"
                            >
                              <option value={0}>Pending</option>
                              <option value={1}>Shipped</option>
                              <option value={2}>Delivered</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">Tracking Number</p>
                            <Input
                              value={editState.trackingNumber}
                              onChange={(e) => setEditState((s) => ({ ...s, trackingNumber: e.target.value }))}
                              placeholder="e.g. TRK-00123"
                              className="bg-[#111C14] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 w-48"
                            />
                          </div>
                          <Button
                            onClick={() => saveEdit(o)}
                            disabled={editState.saving}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                          >
                            {editState.saving ? 'Saving…' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancelEdit}
                            className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                        {editState.error && (
                          <p className="text-red-400 text-xs mt-2">{editState.error}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7A9A80] text-sm">
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
