import axios from 'axios'
import type { VehicleSummary, VinPartsResponse, PartDetailResponse, VinSearchResponse, VinSearchPart } from '@/types/vin'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const vinApi = {
  /** GET /api/Vin/allVehicles — public */
  getAllVehicles: () =>
    api.get<VehicleSummary[]>('/api/Vin/allVehicles'),

  /** GET /api/Vin/getPartsByVin/{vin} — public */
  getPartsByVin: (vin: string) =>
    api.get<VinPartsResponse>(`/api/Vin/getPartsByVin/${encodeURIComponent(vin)}`),

  /** GET /api/Vin/getPartByPartId/{partId} — public */
  getPartDetail: (partId: string) =>
    api.get<PartDetailResponse>(`/api/Vin/getPartByPartId/${encodeURIComponent(partId)}`),

  /** POST /api/Vin/search/{vin} — public */
  searchVin: (vin: string) =>
    api.post<VinSearchResponse>(`/api/Vin/search/${encodeURIComponent(vin)}`),

  /** POST /api/Vin/search/parts/{category} — public */
  searchPartsByCategory: (category: string, vinDetails: VinSearchResponse) =>
    api.post<VinSearchPart[]>(`/api/Vin/search/parts/${encodeURIComponent(category)}`, vinDetails),
}