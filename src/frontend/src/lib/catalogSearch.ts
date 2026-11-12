import type { VehicleSearchParams, PaginatedResponse, CatalogPartItem } from '@/types/catalog'

export type SearchMode = 'auto' | 'vin' | 'number' | 'name' | 'pnc'
export interface CatalogSearchState {
  q: string
  mode: SearchMode
  vin: string
  scope: 'vin' | 'catalog' | 'global'
  make: string
  model: string
  year: string
  steering: string
  engineFamily: string
  vehicleSeries: string
  transmission: string
  marketSpec: string
  group: string
  filter: string
  sort: string
  page: number
}
export interface SearchCategory {
  make: string
  model: string
  variants: { year: string; steering: string }[]
  partCount: number
}
export const validVin = (value: string) => /^[A-HJ-NPR-Z0-9]{17}$/.test(value)
const modes = ['auto', 'vin', 'number', 'name', 'pnc']
export function readSearch(params: URLSearchParams, route: { make?: string; model?: string } = {}): CatalogSearchState {
  const q = (params.get('q') || params.get('searchTerm') || params.get('search') || params.get('keyword') || '').trim()
  const mode = (modes.includes(params.get('mode') || '') ? params.get('mode') : params.has('partNumber') ? 'number' : 'auto') as SearchMode
  const vin = (params.get('vin') || (mode === 'vin' || (mode === 'auto' && validVin(q.toUpperCase())) ? q : '')).trim().toUpperCase()
  const make = params.get('make') || route.make || ''
  const model = params.get('model') || route.model || ''
  return {
    q: params.get('partNumber') || q, mode, vin,
    scope: params.get('scope') === 'catalog' ? 'catalog' : vin ? 'vin' : make || model ? 'catalog' : 'global',
    make, model, year: params.get('year') || '', steering: params.get('steering') || '',
    engineFamily: params.get('engineFamily') || '', vehicleSeries: params.get('vehicleSeries') || '',
    transmission: params.get('transmission') || '', marketSpec: params.get('marketSpec') || '',
    group: params.get('groupName') || '', filter: params.get('filter') || '', sort: params.get('sort') || '',
    page: Number.isFinite(Number(params.get('page'))) ? Math.max(1, Math.floor(Number(params.get('page')) || 1)) : 1,
  }
}
export function writeSearch(state: CatalogSearchState): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(state)) {
    if (!value || (key === 'page' && value === 1) || (key === 'mode' && value === 'auto')) continue
    params.set(key === 'group' ? 'groupName' : key, String(value))
  }
  return params.toString()
}
export function identifyInput(q: string, mode: SearchMode): 'vin' | 'number' | 'name' | 'pnc' {
  if (mode !== 'auto') return mode
  if (validVin(q.trim().toUpperCase())) return 'vin'
  return /\d/.test(q) && /^[A-Za-z0-9-]+$/.test(q) ? 'number' : 'name'
}
export function prepareSearch(q: string, mode: SearchMode, previous: CatalogSearchState, categories: SearchCategory[]): CatalogSearchState {
  let term = q.trim()
  let make = previous.make
  let model = previous.model
  if (mode === 'auto') {
    const makes = [...new Set(categories.map(c => c.make))]
    const makeOnly = makes.find(m => m.toUpperCase() === term.toUpperCase())
    if (makeOnly) { make = makeOnly; model = ''; term = '' }
    const prefix = makes.find(m => term.toUpperCase().startsWith(`${m.toUpperCase()} `))
    if (prefix) { make = prefix; model = ''; term = term.slice(prefix.length).trim() }
    const candidates = categories.filter(c => (!make || c.make === make) && c.model.toUpperCase() === term.toUpperCase())
    if (candidates.length === 1) { make = candidates[0].make; model = candidates[0].model; term = '' }
  }
  const kind = identifyInput(term, mode)
  const vinInput = kind === 'vin'
  const vin = vinInput ? term.toUpperCase() : previous.vin
  return { ...previous, q: term, mode, vin, make: vinInput ? '' : make, model: vinInput ? '' : model,
    scope: vinInput || (vin && previous.scope === 'vin') ? 'vin' : make || model ? 'catalog' : 'global',
    year: vinInput ? '' : previous.year, steering: vinInput ? '' : previous.steering,
    engineFamily: vinInput ? '' : previous.engineFamily, vehicleSeries: vinInput ? '' : previous.vehicleSeries,
    transmission: vinInput ? '' : previous.transmission, marketSpec: vinInput ? '' : previous.marketSpec,
    filter: '', group: '', page: 1 }
}
export function buildSearchQuery(state: CatalogSearchState, allowBrowseAll = false): VehicleSearchParams {
  const text = state.q && identifyInput(state.q, state.mode) !== 'vin' ? state.q : ''
  if (state.scope === 'vin' && !validVin(state.vin)) throw new Error('invalidVin')
  if (state.scope === 'catalog' && !state.make && !state.model) throw new Error('chooseVehicle')
  if (state.scope === 'global' && state.vin) throw new Error('chooseVehicle')
  if (!allowBrowseAll && !text && !state.filter.trim() && state.scope !== 'vin' && !state.make && !state.model) throw new Error('enterSearch')
  if (state.year && (!/^\d{4}$/.test(state.year) || Number(state.year) < 1900 || Number(state.year) > new Date().getFullYear() + 1)) throw new Error('invalidYear')
  const query: VehicleSearchParams = { page: state.page, pageSize: 48 }
  if (state.scope === 'vin') query.vin = state.vin
  else Object.assign(query, {
    make: state.make || undefined, model: state.model || undefined,
    year: state.year ? Number(state.year) : undefined, steering: state.steering || undefined,
    engineFamily: state.engineFamily || undefined, vehicleSeries: state.vehicleSeries || undefined,
    transmission: state.transmission || undefined, marketSpec: state.marketSpec || undefined,
  })
  if (text) {
    const kind = identifyInput(text, state.mode)
    if (kind === 'number') query.partNumber = text.toUpperCase()
    else if (kind === 'pnc') query.pnc = text.toUpperCase()
    else query.keyword = text
  }
  if (state.filter.trim()) {
    const kind = identifyInput(state.filter.trim(), 'auto')
    if (kind === 'number' && !query.partNumber) query.partNumber = state.filter.trim().toUpperCase()
    else query.keyword = [query.keyword, state.filter.trim()].filter(Boolean).join(' ')
  }
  if (state.group) query.groupName = state.group
  if (state.sort) { query.sortBy = 'partNumber'; query.sortDescending = state.sort === 'desc' }
  return query
}
interface SearchClient {
  searchVehicles: (params: VehicleSearchParams) => Promise<PaginatedResponse<CatalogPartItem>>
  makes?: string[]
  vinMake?: string | null
  browseAll?: boolean
}
export function catalogKeyword(value: string, make: string) {
  if (make.toUpperCase() === 'TOYOTA') return value.toUpperCase()
  if (make.toUpperCase() === 'HYUNDAI') return value.replace(/[A-Za-z]+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  return value
}
export async function searchCatalog(state: CatalogSearchState, client: SearchClient) {
  const query = buildSearchQuery(state, client.browseAll)
  let result: PaginatedResponse<CatalogPartItem>
  const make = query.make || client.vinMake || ''
  if (query.keyword && !make && state.scope !== 'vin') {
    // The current API is case-sensitive and the two published makes use different casing.
    // Count each disjoint make partition, then fetch only pages needed for this result window.
    const makes = [...new Set(client.makes || ['HYUNDAI', 'TOYOTA'])].sort()
    const partitions = await Promise.all(makes.map(async make => {
      const scoped = { ...query, make, keyword: catalogKeyword(query.keyword!, make) }
      const count = await client.searchVehicles({ ...scoped, page: 1, pageSize: 1 })
      return { scoped, count: count.totalCount }
    }))
    const totalCount = partitions.reduce((sum, p) => sum + p.count, 0)
    let offset = (state.page - 1) * 48, remaining = 48
    const windows: Promise<CatalogPartItem[]>[] = []
    for (const partition of partitions) {
      if (offset >= partition.count) { offset -= partition.count; continue }
      const take = Math.min(remaining, partition.count - offset)
      if (!take) break
      const start = offset, firstPage = Math.floor(start / 48) + 1
      const lastPage = Math.floor((start + take - 1) / 48) + 1
      windows.push(Promise.all(Array.from({ length: lastPage - firstPage + 1 }, (_, i) => client.searchVehicles({ ...partition.scoped, page: firstPage + i, pageSize: 48 }))).then(pages => pages.flatMap(p => p.items).slice(start % 48, start % 48 + take)))
      remaining -= take
      offset = 0
      if (!remaining) break
    }
    result = { items: (await Promise.all(windows)).flat(), page: state.page, pageSize: 48, totalCount, totalPages: Math.ceil(totalCount / 48) }
  } else {
    if (query.keyword) query.keyword = catalogKeyword(query.keyword, make)
    result = await client.searchVehicles(query)
  }
  if (query.vin && result.items.some(p => p.vin?.trim().toUpperCase() !== query.vin)) throw new Error('inconsistentVin')
  return result
}
