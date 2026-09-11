// src/frontend/src/api/catalogApi.ts
import axios from 'axios'
import type {
  CatalogPartItem,
  VehicleSearchParams,
  PaginatedResponse,
  PaginatedPartsResponse,
  VehicleVinResponse,
  PartSearchRequestDto,
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
   * 1. GET /api/vehicles/vin/{vin}
   * Unified VIN lookup returning decoded vehicle attributes + matching catalog parts.
   */
  getVehicleByVin: async (vin: string, page = 1, pageSize = 48): Promise<VehicleVinResponse> => {
    const response = await api.get<VehicleVinResponse>(`/api/vehicles/vin/${encodeURIComponent(vin)}`, {
      params: { page, pageSize },
    })
    return response.data
  },

  /**
   * 2. GET /api/vehicles/makes
   * Fetch all distinct manufacturers/makes available in the catalog database.
   */
  getMakes: async (page = 1, pageSize = 50): Promise<PaginatedResponse<string>> => {
    const response = await api.get<PaginatedResponse<string>>('/api/vehicles/makes', {
      params: { page, pageSize },
    })
    return response.data
  },

  /**
   * 3. GET /api/vehicles/{make}/models
   * Fetch all models associated with a specific vehicle manufacturer.
   */
  getModelsByMake: async (make: string, page = 1, pageSize = 50): Promise<PaginatedResponse<string>> => {
    const response = await api.get<PaginatedResponse<string>>(
      `/api/vehicles/${encodeURIComponent(make)}/models`,
      { params: { page, pageSize } }
    )
    return response.data
  },

  /**
   * 4. GET /api/vehicles/{make}/models/{model}/parts
   * Fetch parts catalog directly under a specific Make + Model hierarchy.
   */
  getPartsByMakeModel: async (
    make: string,
    model: string,
    page = 1,
    pageSize = 48
  ): Promise<PaginatedResponse<CatalogPartItem>> => {
    const response = await api.get<PaginatedResponse<CatalogPartItem>>(
      `/api/vehicles/${encodeURIComponent(make)}/models/${encodeURIComponent(model)}/parts`,
      { params: { page, pageSize } }
    )
    return response.data
  },

  /**
   * 5. GET /api/vehicles/search
   * High-power unified REST query endpoint across all automotive dimensions.
   */
  searchVehicles: async (params: VehicleSearchParams): Promise<PaginatedResponse<CatalogPartItem>> => {
    const cleanParams: Record<string, any> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value
      }
    }
    const response = await api.get<PaginatedResponse<CatalogPartItem>>('/api/vehicles/search', {
      params: cleanParams,
    })
    return response.data
  },

  // ─── Backward Compatibility & Helpers ─────────────────────────────────────

  /**
   * Search parts adapting to the unified GET /api/vehicles/search
   */
  searchParts: async (dto: PartSearchRequestDto): Promise<PaginatedPartsResponse> => {
    const res = await catalogApi.searchVehicles({
      vin: dto.vin || undefined,
      partNumber: dto.partNumber || undefined,
      keyword: dto.searchTerm || undefined,
      groupName: dto.groupName || undefined,
      subgroupName: dto.subGroupName || undefined,
      page: dto.pageNumber || 1,
      pageSize: dto.pageSize || 48,
      sortBy: dto.sortBy || 'partName',
      sortDescending: dto.sortDirection === 'desc',
    })
    return {
      items: res.items || [],
      pageNumber: res.page || dto.pageNumber || 1,
      page: res.page || 1,
      pageSize: res.pageSize || dto.pageSize || 48,
      totalCount: res.totalCount || 0,
      totalPages: res.totalPages || 0,
    }
  },

  /**
   * Search by model / keyword adapting to GET /api/vehicles/search
   */
  searchPartNew: async (dto: {
    model?: string
    searchTerm?: string
    pageNumber?: number
    pageSize?: number
  }): Promise<PaginatedPartsResponse> => {
    const res = await catalogApi.searchVehicles({
      model: dto.model || undefined,
      keyword: dto.searchTerm || undefined,
      page: dto.pageNumber || 1,
      pageSize: dto.pageSize || 48,
    })
    return {
      items: res.items || [],
      pageNumber: res.page || dto.pageNumber || 1,
      page: res.page || 1,
      pageSize: res.pageSize || dto.pageSize || 48,
      totalCount: res.totalCount || 0,
      totalPages: res.totalPages || 0,
    }
  },

  /**
   * GET /api/vehicles/models or derived from makes
   */
  getVehicleModels: async (): Promise<string[]> => {
    try {
      const makesRes = await catalogApi.getMakes(1, 100)
      if (makesRes.items && makesRes.items.length > 0) {
        const modelPromises = makesRes.items.map((m) =>
          catalogApi.getModelsByMake(m, 1, 100).then((r) => r.items || []).catch(() => [])
        )
        const nestedModels = await Promise.all(modelPromises)
        const allModels = Array.from(new Set(nestedModels.flat())).filter(Boolean)
        if (allModels.length > 0) return allModels
      }
    } catch {
      // fallback
    }
    return ['CRETA']
  },

  /**
   * GET /api/parts/groups
   */
  getPartGroups: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/api/parts/groups')
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data
      }
    } catch {
      // fallback
    }
    return ['发动机', '底盘', '电气', '车身']
  },

  /**
   * GET /api/parts/grouped/by-model
   */
  getPartsByModel: async (model: string, page = 1, pageSize = 48): Promise<GroupedByModelResponse> => {
    const res = await catalogApi.searchVehicles({ model, page, pageSize })
    return {
      items: [
        {
          model,
          partCount: res.totalCount || res.items.length,
          parts: res.items || [],
        },
      ],
      pageNumber: res.page || page,
      pageSize: res.pageSize || pageSize,
      totalCount: res.totalCount || 0,
      totalPages: res.totalPages || 0,
    }
  },

  /**
   * GET /api/parts/grouped/by-group
   */
  getPartsByGroup: async (groupName?: string, page = 1, pageSize = 20): Promise<GroupedByGroupResponse> => {
    const res = await catalogApi.searchVehicles({ groupName, page, pageSize })
    return {
      items: [
        {
          groupName: groupName || '',
          partCount: res.totalCount || res.items.length,
          parts: res.items || [],
        },
      ],
      pageNumber: res.page || page,
      pageSize: res.pageSize || pageSize,
      totalCount: res.totalCount || 0,
      totalPages: res.totalPages || 0,
    }
  },

  /**
   * Fallback VIN decode
   */
  decodeVinFallback: async (vin: string): Promise<NhtsaVinDecodeResponse> => {
    try {
      const response = await api.post<NhtsaVinDecodeResponse>(`/api/vehicles/vin/${encodeURIComponent(vin)}/decode`, '')
      return response.data
    } catch {
      return {
        vin,
        isValid: false,
        errorCode: '404',
        errorText: 'VIN decode service unreachable',
        make: null,
        model: null,
        modelYear: null,
        manufacturer: null,
        vehicleType: null,
        bodyClass: null,
        series: null,
        trim: null,
        driveType: null,
        transmissionStyle: null,
        engineCylinders: null,
        engineHP: null,
        displacementL: null,
        fuelTypePrimary: null,
        plantCity: null,
        plantState: null,
        plantCountry: null,
        gvwr: null,
        doors: null,
        rawAttributes: {},
      }
    }
  },
}
