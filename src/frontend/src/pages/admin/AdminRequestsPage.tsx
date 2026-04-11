import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { supplierApi } from '@/api/supplierApi'
import { orderApi } from '@/api/orderApi'
import type { PartRequest } from '@/types/request'
import type { Supplier } from '@/types/supplier'
import { Urgency } from '@/types/request'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const urgencyLabel: Record<number, string> = {
  [Urgency.Standard]: 'Standard',
  [Urgency.Express]: 'Express',
  [Urgency.Urgent]: 'Urgent',
}

const urgencyClass: Record<number, string> = {
  [Urgency.Standard]: 'bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
  [Urgency.Express]: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  [Urgency.Urgent]: 'bg-red-900/30 text-red-400 border-red-700/30',
}

interface CreateOrderPanel {
  requestId: number
  partName: string
}

interface FlatPart {
  id: number
  partName: string
  partNumber: string
  condition: string
  price: number
  stock: number
  supplierId: number
  supplierName: string
}

export default function AdminRequestsPage() {
  const { auth } = useAuth()
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'sorted'>('all')

  // Create-order panel state
  const [panel, setPanel] = useState<CreateOrderPanel | null>(null)
  const [allParts, setAllParts] = useState<FlatPart[]>([])
  const [loadingAll, setLoadingAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<FlatPart[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedPart, setSelectedPart] = useState<FlatPart | null>(null)
  const [price, setPrice] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!auth) return
    requestApi
      .getAll(auth.token)
      .then(({ data }) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  async function handleMarkSorted(id: number) {
    if (!auth) return
    try {
      await requestApi.markAsSorted(id, auth.token)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, isSorted: true } : r)))
    } catch {
      alert('Failed to mark request as sorted.')
    }
  }

  async function handleDelete(id: number, partName: string) {
    if (!window.confirm(`Delete request for "${partName}"? This cannot be undone.`)) return
    if (!auth) return
    try {
      await requestApi.delete(id, auth.token)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert('Failed to delete request.')
    }
  }

  function flattenSuppliers(suppliers: Supplier[]): FlatPart[] {
    return suppliers.flatMap((s) =>
      (s.parts ?? []).map((p) => ({
        id: p.id,
        partName: p.partName,
        partNumber: p.partNumber,
        condition: p.condition,
        price: p.price,
        stock: p.stock,
        supplierId: s.id,
        supplierName: s.businessName,
      })),
    )
  }

  async function openPanel(req: PartRequest) {
    setPanel({ requestId: req.id, partName: req.partName })
    setSearchTerm('')
    setSearchResults([])
    setHasSearched(false)
    setSelectedPart(null)
    setPrice('')
    setCreateError('')
    setOrderRef('')
    setLoadingAll(true)
    try {
      const { data } = await supplierApi.getAll()
      setAllParts(flattenSuppliers(data))
    } catch {
      setAllParts([])
    } finally {
      setLoadingAll(false)
    }
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function closePanel() {
    setPanel(null)
    setOrderRef('')
    setAllParts([])
  }

  async function handleSearch() {
    if (!auth || !searchTerm.trim()) return
    setSearching(true)
    setSearchResults([])
    setSelectedPart(null)
    setHasSearched(true)
    try {
      const { data } = await supplierApi.search(searchTerm.trim(), auth.token)
      // Convert PartResponse → FlatPart (search doesn't return supplier name, use supplierId)
      const flat: FlatPart[] = data.map((p) => ({
        id: p.id,
        partName: p.partName,
        partNumber: p.partNumber,
        condition: p.condition,
        price: p.price,
        stock: p.stock,
        supplierId: p.supplierId,
        supplierName: allParts.find((ap) => ap.supplierId === p.supplierId)?.supplierName ?? `Supplier #${p.supplierId}`,
      }))
      setSearchResults(flat)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchTerm('')
    setSearchResults([])
    setHasSearched(false)
    setSelectedPart(null)
  }

  function selectPart(part: FlatPart) {
    setSelectedPart(part)
    setPrice(String(part.price))
  }

  async function handleCreateOrder() {
    if (!auth || !panel || !selectedPart) return
    setCreateError('')
    setCreating(true)
    try {
      const { data: ref } = await orderApi.create(
        {
          supplierId: selectedPart.supplierId,
          partId: selectedPart.id,
          partRequestId: panel.requestId,
          price: Number(price),
        },
        auth.token,
      )
      setOrderRef(ref)
      setSelectedPart(null)
      setSearchResults([])
      setSearchTerm('')
      setHasSearched(false)
      const { data } = await requestApi.getAll(auth.token)
      setRequests(data)
    } catch {
      setCreateError('Failed to create order. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Which parts to show in the parts list
  const displayParts = hasSearched ? searchResults : allParts

  const filtered = requests.filter((r) => {
    if (filter === 'open') return !r.isSorted
    if (filter === 'sorted') return r.isSorted
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          Admin
        </p>
        <h1 className="text-2xl font-extrabold text-white">Part Requests</h1>
        <p className="text-[#7A9A80] text-sm mt-1">{requests.length} total requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'open', 'sorted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853] border border-[rgba(0,200,83,0.3)]'
                : 'text-[#7A9A80] border border-transparent hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#7A9A80] text-sm">Loading requests…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#0D1810]">
                <Th>ID</Th>
                <Th>Part</Th>
                <Th>Vehicle</Th>
                <Th>Urgency</Th>
                <Th>Orders</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <Td className="text-[#7A9A80] font-mono">#{r.id}</Td>
                    <Td className="text-white font-medium">{r.partName}</Td>
                    <Td className="text-[#7A9A80]">
                      {r.vehicleMake} {r.model} {r.year}
                    </Td>
                    <Td>
                      <Badge className={`text-[10px] border ${urgencyClass[r.urgency] ?? ''}`}>
                        {urgencyLabel[r.urgency] ?? r.urgency}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="text-[#7A9A80] text-xs font-mono">
                        {r.orders?.length ?? 0}
                      </span>
                    </Td>
                    <Td>
                      {r.isSorted ? (
                        <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                          Sorted
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-900/30 text-amber-300 border-amber-700/30 text-[10px]">
                          Open
                        </Badge>
                      )}
                    </Td>
                    <Td className="text-[#7A9A80] text-xs">
                      {new Date(r.dateCreated).toLocaleDateString()}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!r.isSorted && (
                          <Button
                            size="sm"
                            onClick={() => panel?.requestId === r.id ? closePanel() : openPanel(r)}
                            className="bg-blue-600 text-white hover:bg-blue-500 h-7 text-xs px-3"
                          >
                            {panel?.requestId === r.id ? 'Close' : 'Create Order'}
                          </Button>
                        )}
                        {!r.isSorted && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkSorted(r.id)}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
                          >
                            Mark Sorted
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(r.id, r.partName)}
                          className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                        >
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </tr>

                  {/* Inline create-order panel */}
                  {panel?.requestId === r.id && (
                    <tr key={`panel-${r.id}`}>
                      <td colSpan={8} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-6 py-5">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">
                          Create Order — {panel.partName}
                        </p>

                        {/* Search bar */}
                        <div className="flex gap-2 mb-1">
                          <Input
                            ref={searchRef}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); if (!e.target.value) clearSearch() }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search parts by name or number…"
                            className="bg-[#111C14] border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-9 max-w-sm"
                          />
                          <Button
                            onClick={handleSearch}
                            disabled={searching || !searchTerm.trim()}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-4 text-xs font-semibold"
                          >
                            {searching ? 'Searching…' : 'Search'}
                          </Button>
                          {hasSearched && (
                            <Button
                              onClick={clearSearch}
                              variant="outline"
                              className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-3 text-xs"
                            >
                              Clear
                            </Button>
                          )}
                        </div>

                        {/* List label */}
                        <p className="text-[10px] font-mono text-[#3D5942] mb-3 mt-3">
                          {hasSearched
                            ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchTerm}"`
                            : loadingAll
                            ? 'Loading parts…'
                            : `All parts — ${allParts.length} available`}
                        </p>

                        {/* Parts list */}
                        {!loadingAll && displayParts.length > 0 && (
                          <div className="mb-4 rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden max-h-64 overflow-y-auto">
                            {/* Mini table header */}
                            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-4 py-2 bg-[#0D1810] border-b border-[rgba(255,255,255,0.06)] text-[10px] font-mono uppercase tracking-widest text-[#3D5942]">
                              <span>Part</span>
                              <span>Supplier</span>
                              <span>Condition</span>
                              <span>Stock</span>
                              <span>Price</span>
                            </div>
                            {displayParts.map((part) => (
                              <button
                                key={part.id}
                                onClick={() => selectPart(part)}
                                className={`w-full text-left grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 transition-colors border-b border-[rgba(255,255,255,0.04)] last:border-0 ${
                                  selectedPart?.id === part.id
                                    ? 'bg-[rgba(0,200,83,0.1)] border-l-2 border-l-[#00C853]'
                                    : 'hover:bg-[rgba(255,255,255,0.04)]'
                                }`}
                              >
                                <div>
                                  <p className="text-white text-sm font-medium leading-tight">{part.partName}</p>
                                  {part.partNumber && (
                                    <p className="text-[#3D5942] text-[10px] font-mono">{part.partNumber}</p>
                                  )}
                                </div>
                                <p className="text-[#7A9A80] text-xs">{part.supplierName}</p>
                                <Badge className="bg-[rgba(0,200,83,0.06)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px] whitespace-nowrap">
                                  {part.condition}
                                </Badge>
                                <span className="text-[#7A9A80] text-xs font-mono">{part.stock}</span>
                                <span className="text-[#00C853] font-semibold text-sm whitespace-nowrap">
                                  ${part.price.toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {hasSearched && searchResults.length === 0 && !searching && (
                          <p className="text-[#7A9A80] text-xs mb-4">No parts matched "{searchTerm}"</p>
                        )}

                        {/* Confirm order */}
                        {selectedPart && (
                          <div className="flex items-end gap-3 flex-wrap mt-2">
                            <div className="bg-[rgba(0,200,83,0.06)] border border-[rgba(0,200,83,0.2)] rounded-lg px-4 py-2">
                              <p className="text-[#00C853] text-[10px] font-mono mb-0.5">Selected</p>
                              <p className="text-white text-sm font-semibold">{selectedPart.partName}</p>
                              <p className="text-[#7A9A80] text-xs">{selectedPart.supplierName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">Price (USD)</p>
                              <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="bg-[#111C14] border-[rgba(255,255,255,0.1)] text-white focus:border-[#00C853] h-9 w-32"
                              />
                            </div>
                            <Button
                              onClick={handleCreateOrder}
                              disabled={creating || !price}
                              className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                            >
                              {creating ? 'Creating…' : 'Confirm Order'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPart(null)}
                              className="border-[rgba(255,255,255,0.1)] text-[#7A9A80] bg-transparent hover:text-white h-9 px-4 text-sm"
                            >
                              Deselect
                            </Button>
                          </div>
                        )}

                        {/* Success */}
                        {orderRef && (
                          <div className="mt-4 flex items-center gap-3 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.25)] rounded-lg px-4 py-3">
                            <span className="text-[#00C853] text-lg">✓</span>
                            <div>
                              <p className="text-[#00C853] text-sm font-semibold">Order created successfully</p>
                              <p className="text-[#7A9A80] text-xs font-mono mt-0.5">
                                Order ref: <span className="text-white">{orderRef}</span>
                              </p>
                            </div>
                            <button
                              onClick={closePanel}
                              className="ml-auto text-[#7A9A80] hover:text-white text-xs transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        )}

                        {createError && (
                          <p className="text-red-400 text-xs mt-3">{createError}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7A9A80] text-sm">
                    No requests found.
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
