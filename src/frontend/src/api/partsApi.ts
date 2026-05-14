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
}