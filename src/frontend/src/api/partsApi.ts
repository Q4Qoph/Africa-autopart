import axios from 'axios'
import type { PartSearchDTO, PartResult } from '@/types/parts'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const partsApi = {
  search: (dto: PartSearchDTO) =>
    api.post<PartResult[]>('/api/Parts/search', dto),
}
