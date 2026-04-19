import axios from 'axios'
import type { PartSearchDTO, PartResult } from '@/types/parts'

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
}

function mapPart(raw: RawPartResult, index: number): PartResult {
  const priceNum = parseFloat(raw.price.replace(/[^0-9.]/g, '')) || 0
  return {
    id: index,
    partName: raw.name,
    partNumber: '',
    condition: 'New',
    description: '',
    imageURL: '',
    price: priceNum,
    stock: raw.availability ? 1 : 0,
    supplierId: 0,
    supplierName: raw.supplier,
  }
}

export const partsApi = {
  search: async (dto: PartSearchDTO): Promise<{ data: PartResult[] }> => {
    const response = await api.post<RawPartResult[]>('/api/Parts/search', dto)
    return { data: response.data.map(mapPart) }
  },
}
