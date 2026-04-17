import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('admin')
  const { t: tReq } = useTranslation('requests')
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

  const urgencyLabel: Record<number, string> = {
    [Urgency.Standard]: tReq('urgency_standard_short'),
    [Urgency.Express]: tReq('urgency_express_short'),
    [Urgency.Urgent]: tReq('urgency_urgent_short'),
  }

  const filterLabel: Record<string, string> = {
    all: t('requests_filter_all'),
    open: t('requests_filter_open'),
    sorted: t('requests_filter_sorted'),
  }

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
      alert(t('requests_sorted_error'))
    }
  }

  async function handleDelete(id: number, partName: string) {
    if (!window.confirm(`${t('requests_delete')} "${partName}"? This cannot be undone.`)) return
    if (!auth) return
    try {
      await requestApi.delete(id, auth.token)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert(t('requests_delete_error'))
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
          supplierName: selectedPart.supplierName,
          partName: selectedPart.partName,
          partRequestId: panel.requestId,
          price: Number(price),
        },
        auth.token,
      )
      setOrderRef(String(ref))
      setSelectedPart(null)
      setSearchResults([])
      setSearchTerm('')
      setHasSearched(false)
      const { data } = await requestApi.getAll(auth.token)
      setRequests(data)
    } catch {
      setCreateError(t('requests_panel_create_error'))
    } finally {
      setCreating(false)
    }
  }

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
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('requests_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">{t('requests_count', { count: requests.length })}</p>
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
                : 'text-[#4A6B50] dark:text-[#7A9A80] border border-transparent hover:text-[#07110A] dark:hover:text-white'
            }`}
          >
            {filterLabel[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#E8F2EA] dark:bg-[#0D1810]">
                <Th>{t('requests_col_id')}</Th>
                <Th>{t('requests_col_part')}</Th>
                <Th>{t('requests_col_vehicle')}</Th>
                <Th>{t('requests_col_urgency')}</Th>
                <Th>{t('requests_col_orders')}</Th>
                <Th>{t('requests_col_status')}</Th>
                <Th>{t('requests_col_date')}</Th>
                <Th>{t('requests_col_actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80] font-mono">#{r.id}</Td>
                    <Td className="text-[#07110A] dark:text-white font-medium">{r.partName}</Td>
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80]">
                      {r.vehicleMake} {r.model} {r.year}
                    </Td>
                    <Td>
                      <Badge className={`text-[10px] border ${urgencyClass[r.urgency] ?? ''}`}>
                        {urgencyLabel[r.urgency] ?? r.urgency}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">
                        {r.orders?.length ?? 0}
                      </span>
                    </Td>
                    <Td>
                      {r.isSorted ? (
                        <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                          {t('requests_status_sorted')}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-900/30 text-amber-300 border-amber-700/30 text-[10px]">
                          {t('requests_status_open')}
                        </Badge>
                      )}
                    </Td>
                    <Td className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                      {new Date(r.dateCreated).toLocaleDateString()}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!r.isSorted && (
                          <Button
                            size="sm"
                            onClick={() => panel?.requestId === r.id ? closePanel() : openPanel(r)}
                            className="bg-blue-600 text-[#07110A] dark:text-white hover:bg-blue-500 h-7 text-xs px-3"
                          >
                            {panel?.requestId === r.id ? t('requests_close') : t('requests_create_order')}
                          </Button>
                        )}
                        {!r.isSorted && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkSorted(r.id)}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
                          >
                            {t('requests_mark_sorted')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(r.id, r.partName)}
                          className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                        >
                          {t('requests_delete')}
                        </Button>
                      </div>
                    </Td>
                  </tr>

                  {/* Inline create-order panel */}
                  {panel?.requestId === r.id && (
                    <tr key={`panel-${r.id}`}>
                      <td colSpan={8} className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-6 py-5">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">
                          {t('requests_panel_title', { partName: panel.partName })}
                        </p>

                        {/* Search bar */}
                        <div className="flex gap-2 mb-1">
                          <Input
                            ref={searchRef}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); if (!e.target.value) clearSearch() }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('requests_panel_search_placeholder')}
                            className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 max-w-sm"
                          />
                          <Button
                            onClick={handleSearch}
                            disabled={searching || !searchTerm.trim()}
                            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-4 text-xs font-semibold"
                          >
                            {searching ? t('requests_panel_searching') : t('requests_panel_search')}
                          </Button>
                          {hasSearched && (
                            <Button
                              onClick={clearSearch}
                              variant="outline"
                              className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-3 text-xs"
                            >
                              {t('requests_panel_clear')}
                            </Button>
                          )}
                        </div>

                        {/* List label */}
                        <p className="text-[10px] font-mono text-[#7A9A80] dark:text-[#3D5942] mb-3 mt-3">
                          {hasSearched
                            ? t(searchResults.length === 1 ? 'requests_panel_result_one' : 'requests_panel_results', { count: searchResults.length, term: searchTerm })
                            : loadingAll
                            ? t('requests_panel_loading')
                            : t('requests_panel_all_parts', { count: allParts.length })}
                        </p>

                        {/* Parts list */}
                        {!loadingAll && displayParts.length > 0 && (
                          <div className="mb-4 rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-hidden max-h-64 overflow-y-auto">
                            {/* Mini table header */}
                            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-4 py-2 bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] text-[10px] font-mono uppercase tracking-widest text-[#7A9A80] dark:text-[#3D5942]">
                              <span>{t('requests_panel_col_part')}</span>
                              <span>{t('requests_panel_col_supplier')}</span>
                              <span>{t('requests_panel_col_condition')}</span>
                              <span>{t('requests_panel_col_stock')}</span>
                              <span>{t('requests_panel_col_price')}</span>
                            </div>
                            {displayParts.map((part) => (
                              <button
                                key={part.id}
                                onClick={() => selectPart(part)}
                                className={`w-full text-left grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 transition-colors border-b border-[rgba(255,255,255,0.04)] last:border-0 ${
                                  selectedPart?.id === part.id
                                    ? 'bg-[rgba(0,200,83,0.1)] border-l-2 border-l-[#00C853]'
                                    : 'hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]'
                                }`}
                              >
                                <div>
                                  <p className="text-[#07110A] dark:text-white text-sm font-medium leading-tight">{part.partName}</p>
                                  {part.partNumber && (
                                    <p className="text-[#7A9A80] dark:text-[#3D5942] text-[10px] font-mono">{part.partNumber}</p>
                                  )}
                                </div>
                                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{part.supplierName}</p>
                                <Badge className="bg-[rgba(0,200,83,0.06)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px] whitespace-nowrap">
                                  {part.condition}
                                </Badge>
                                <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">{part.stock}</span>
                                <span className="text-[#00C853] font-semibold text-sm whitespace-nowrap">
                                  ${part.price.toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {hasSearched && searchResults.length === 0 && !searching && (
                          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs mb-4">{t('requests_panel_no_match', { term: searchTerm })}</p>
                        )}

                        {/* Confirm order */}
                        {selectedPart && (
                          <div className="flex items-end gap-3 flex-wrap mt-2">
                            <div className="bg-[rgba(0,200,83,0.06)] border border-[rgba(0,200,83,0.2)] rounded-lg px-4 py-2">
                              <p className="text-[#00C853] text-[10px] font-mono mb-0.5">{t('requests_panel_selected')}</p>
                              <p className="text-[#07110A] dark:text-white text-sm font-semibold">{selectedPart.partName}</p>
                              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{selectedPart.supplierName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">{t('requests_panel_price_label')}</p>
                              <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white focus:border-[#00C853] h-9 w-32"
                              />
                            </div>
                            <Button
                              onClick={handleCreateOrder}
                              disabled={creating || !price}
                              className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                            >
                              {creating ? t('requests_panel_confirming') : t('requests_panel_confirm')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPart(null)}
                              className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                            >
                              {t('requests_panel_deselect')}
                            </Button>
                          </div>
                        )}

                        {/* Success */}
                        {orderRef && (
                          <div className="mt-4 flex items-center gap-3 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.25)] rounded-lg px-4 py-3">
                            <span className="text-[#00C853] text-lg">✓</span>
                            <div>
                              <p className="text-[#00C853] text-sm font-semibold">{t('requests_panel_success')}</p>
                              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono mt-0.5">
                                {t('requests_panel_order_ref')} <span className="text-[#07110A] dark:text-white">{orderRef}</span>
                              </p>
                            </div>
                            <button
                              onClick={closePanel}
                              className="ml-auto text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#07110A] dark:hover:text-white text-xs transition-colors"
                            >
                              {t('requests_panel_close')}
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
                  <td colSpan={8} className="py-8 text-center text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t('requests_no_requests')}
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
