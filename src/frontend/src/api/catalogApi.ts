// src/frontend/src/api/catalogApi.ts
import axios from 'axios'
import type {
  PartSearchRequestDto,
  PartNewSearchResponse,
  PaginatedPartsResponse,
  VehicleVinResponse,
  GroupedByModelResponse,
  GroupedByGroupResponse,
  NhtsaVinDecodeResponse,
} from '@/types/catalog'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

export const catalogApi = {
  /**
   * GET /api/vehicles/vin/{vin}
   * Look up a VIN directly against the ingested vehicle catalog table.
   */
  getVehicleByVin: async (vin: string, page = 1, pageSize = 48): Promise<VehicleVinResponse> => {
    const response = await api.get<VehicleVinResponse>(`/api/vehicles/vin/${encodeURIComponent(vin)}`, {
      params: { page, pageSize },
    })
    return response.data
  },

  /**
   * POST /api/parts/search
   * Unified multi-filter search across catalog parts.
   */
  searchParts: async (dto: PartSearchRequestDto): Promise<PaginatedPartsResponse> => {
    const payload: PartSearchRequestDto = {
      vin: dto.vin || null,
      partNumber: dto.partNumber || null,
      searchTerm: dto.searchTerm || null,
      groupName: dto.groupName || null,
      subGroupName: dto.subGroupName || null,
      pageNumber: dto.pageNumber || 1,
      pageSize: dto.pageSize || 48,
      sortBy: dto.sortBy || 'partName',
      sortDirection: dto.sortDirection || 'asc',
    }
    const response = await api.post<PaginatedPartsResponse>('/api/parts/search', payload)
    return response.data
  },

  /**
   * POST /api/PartNew/search
   * Fast model & keyword search for decoded VINs and general catalog lookup.
   */
  searchPartNew: async (dto: {
    model?: string
    searchTerm?: string
    pageNumber?: number
    pageSize?: number
  }): Promise<PaginatedPartsResponse> => {
    const payload = {
      model: dto.model || '',
      searchTerm: dto.searchTerm || '',
      pageNumber: dto.pageNumber || 1,
      pageSize: dto.pageSize || 48,
    }
    const response = await api.post<PartNewSearchResponse>('/api/PartNew/search', payload)
    return {
      items: response.data.data || [],
      pageNumber: response.data.pageNumber || payload.pageNumber,
      pageSize: response.data.pageSize || payload.pageSize,
      totalCount: response.data.totalCount || 0,
      totalPages: response.data.totalPages || 0,
    }
  },

  /**
   * GET /api/vehicles/models
   * Fetch all distinct models available in the catalog.
   */
  getVehicleModels: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/api/vehicles/models')
    return response.data
  },

  /**
   * GET /api/parts/groups
   * Fetch all distinct top-level groups available in the catalog.
   */
  getPartGroups: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/api/parts/groups')
    return response.data
  },

  /**
   * GET /api/parts/grouped/by-model
   * Fetch parts grouped by vehicle model.
   */
  getPartsByModel: async (model: string, page = 1, pageSize = 48): Promise<GroupedByModelResponse> => {
    const response = await api.get<GroupedByModelResponse>('/api/parts/grouped/by-model', {
      params: { model, page, pageSize },
    })
    return response.data
  },

  /**
   * GET /api/parts/grouped/by-group
   * Fetch parts grouped by category group.
   */
  getPartsByGroup: async (groupName?: string, page = 1, pageSize = 20): Promise<GroupedByGroupResponse> => {
    const response = await api.get<GroupedByGroupResponse>('/api/parts/grouped/by-group', {
      params: {
        page,
        pageSize,
        ...(groupName ? { groupName } : {}),
      },
    })
    return response.data
  },

  /**
   * POST /api/vehicles/vin/{vin}/decode
   * Fallback 3rd-party NHTSA decoder for unknown / grey-import VINs.
   */
  decodeVinFallback: async (vin: string): Promise<NhtsaVinDecodeResponse> => {
    const response = await api.post<NhtsaVinDecodeResponse>(`/api/vehicles/vin/${encodeURIComponent(vin)}/decode`, '')
    return response.data
  },
}
