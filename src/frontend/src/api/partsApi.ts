//src/frontend/src/api/partsApi.ts
import axios from 'axios'
import type { PartSearchDTO, PartResult, VinResult, PartSearchRequest, CategoryGroup } from '@/types/parts'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

interface RawPartResult {
  name: string
  partNumber: string
  price: string
  originalPrice: string
  supplier: string
  availability: boolean
  imageURL: string
}

function mapPart(raw: RawPartResult, index: number): PartResult {
  const priceNum = parseFloat(raw.price.replace(/[^0-9.]/g, '')) || 0
  return {
    id: index,
    partName: raw.name,
    partNumber: '',
    condition: 'New',
    description: '',
    imageURL: raw.imageURL,
    price: priceNum,
    stock: raw.availability ? 1 : 0,
    supplierId: 0,
    supplierName: raw.supplier,
  }
}

export interface PartSeed {
  id: string
  sourceFile: string
  supplier: string
  rowNo: number
  partCode: string
  partName: string
  applicableModel: string
  price: number | null
  imageUrl: string
  createdAtUtc: string
}

export interface PaginatedPartsResponse {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  items: PartSeed[]
}

export const partsApi = {
  // existing method — untouched
  search: async (dto: PartSearchDTO): Promise<{ data: PartResult[] }> => {
    const response = await api.post<RawPartResult[]>('/api/Parts/search', dto)
    return { data: response.data.map(mapPart) }
  },

  // ─── New methods ───────────────────────────────────────────────────────────

  /** GET /api/Parts/search/free?vin=… */
  searchByVin: (vin: string) =>
    api.get<VinResult>(`/api/Parts/search/free?vin=${encodeURIComponent(vin)}`),

  /** POST /api/Parts/search (with PartSearchRequest body) */
  searchParts: (dto: PartSearchRequest) =>
    api.post<CategoryGroup[]>('/api/Parts/search', dto),

  /** Fetch the paginated catalog with server-side filters */
  fetchCatalogParts: async (
    page: number = 1,
    pageSize: number = 24,
    supplier?: string,
    search?: string,
    model?: string,
    sortBy?: string,
    sortDirection?: string
  ): Promise<PaginatedPartsResponse> => {
    const response = await api.get<PaginatedPartsResponse>('/api/PartsSeed', {
      params: {
        page,
        pageSize,
        ...(supplier && { supplier }),
        ...(search && { search }),
        ...(model && { model }),
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection }),
      },
    })
    return response.data
  },

  /** Fetch all available compatibility models in the catalog database */
  fetchCatalogModels: async (): Promise<{ models: string[] }> => {
    const response = await api.get<{ models: string[] }>('/api/PartsSeed/Models')
    return response.data
  },

  /** Fetch a single catalog part by ID */
  fetchCatalogPartById: async (id: string): Promise<PartSeed> => {
    const response = await api.get<PartSeed>(`/api/PartsSeed/${id}`)
    return response.data
  },

  /** Upload parts seed spreadsheet file */
  uploadPartsSeed: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/PartsSeed/seed', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}