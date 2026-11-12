import { useQuery } from '@tanstack/react-query'
import { catalogConfigurations } from '@/data/catalogConfigurations'
import { catalogApi } from '@/api/catalogApi'
import { resolveVin } from '@/lib/resolveVin'
import { identifyInput, searchCatalog, validVin, writeSearch } from '@/lib/catalogSearch'
import type { CatalogSearchState } from '@/lib/catalogSearch'

export function useCatalogSearch(state: CatalogSearchState, browseAll = false) {
  const categories = useQuery({ queryKey: ['vehicle-categories'], queryFn: catalogApi.getCategories, staleTime: 300_000, retry: false })
  const exact = state.scope === 'vin'
  const vinQuery = useQuery({
    queryKey: ['vin-catalog', state.vin],
    queryFn: () => resolveVin(state.vin, catalogApi),
    enabled: !!state.vin && validVin(state.vin), staleTime: 300_000, retry: false,
  })
  const identityPending = !!state.vin && validVin(state.vin) && vinQuery.isPending
  const conflict = state.scope === 'catalog' && !!state.make && !!vinQuery.data?.meta.make && state.make.toUpperCase() !== vinQuery.data.meta.make.toUpperCase()
  const hasInput = browseAll || !!(state.q || state.filter || state.vin || state.make || state.model)
  const resultQuery = useQuery({
    queryKey: ['catalog-search', browseAll, writeSearch(state), categories.data?.map(c => c.make).filter((m, i, all) => all.indexOf(m) === i).sort().join(',') || 'HYUNDAI,TOYOTA'],
    queryFn: ({ signal }) => {
      if (exact && !state.filter && !state.group && !state.sort && state.page === 1 && (!state.q || identifyInput(state.q, state.mode) === 'vin') && vinQuery.data) return vinQuery.data.catalog
      return searchCatalog(state, { browseAll, makes: categories.data?.length ? categories.data.map(c => c.make) : undefined, vinMake: exact ? vinQuery.data?.meta.make : undefined, searchVehicles: params => {
        // Search's model filter is substring-based: keep Land Cruiser 70 separate from Prado.
        const overlaps = catalogConfigurations.some(c => c.model !== state.model && c.model.includes(state.model))
        const contexts = catalogConfigurations.filter(c => (!state.make || c.make === state.make) && c.model === state.model)
        if (state.model && overlaps && !params.vehicleSeries && contexts.length === 1) params.vehicleSeries = contexts[0].vehicleSeries
        return catalogApi.searchVehicles(params, signal)
      } })
    },
    enabled: hasInput && !identityPending && !conflict && (!exact || !!vinQuery.data?.matched),
    staleTime: 60_000, retry: false,
  })
  const error = conflict ? 'conflict' : exact && !validVin(state.vin) ? 'invalidVin' : (exact ? vinQuery.error : null) || resultQuery.error
  return {
    data: resultQuery.data, vin: vinQuery.data,
    loading: vinQuery.isFetching || resultQuery.isFetching,
    error: error instanceof Error ? error.message : error,
    retry: () => { if (exact) void vinQuery.refetch(); void resultQuery.refetch() },
  }
}
