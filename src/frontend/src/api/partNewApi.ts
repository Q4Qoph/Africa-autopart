import axios from 'axios'
import type { PartNewSearchRequest, PartNewSearchResponse } from '@/types/partNew'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const partNewApi = {
  /** POST /api/PartNew/search — search parts by model or searchTerm (part name / part number) */
  search: async (params: PartNewSearchRequest = {}): Promise<PartNewSearchResponse> => {
    const payload = {
      model: params.model ?? '',
      searchTerm: params.searchTerm ?? '',
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 42,
    }
    const response = await api.post<PartNewSearchResponse>('/api/PartNew/search', payload)
    return response.data
  },
}
