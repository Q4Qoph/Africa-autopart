// src/frontend/src/types/catalog.ts

export interface CatalogPartItem {
  id: number
  vin: string | null
  oem: string | null
  model: string | null
  modelYear: string | null
  vehicle: string | null
  series: string | null
  groupName: string | null
  subgroupName: string | null
  pnc: string | null
  partName: string
  partNumber: string
  picId: string | null
  imageUrl: string | null
  quantity: number
  replacePart: string | null
  source: string | null
  createdAt: string
  updatedAt: string | null
}

export interface PartSearchRequestDto {
  vin?: string | null
  partNumber?: string | null
  searchTerm?: string | null
  groupName?: string | null
  subGroupName?: string | null
  pageNumber: number
  pageSize: number
  sortBy?: 'partName' | 'groupName' | 'relevance' | string
  sortDirection?: 'asc' | 'desc' | string
}

export interface PaginatedPartsResponse {
  items: CatalogPartItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface VehicleVinResponse {
  vin: string
  model: string | null
  modelYear: string | null
  vehicle: string | null
  series: string | null
  partCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  parts: CatalogPartItem[]
}

export interface GroupedByModelItem {
  model: string
  partCount: number
  parts: CatalogPartItem[]
}

export interface GroupedByModelResponse {
  items: GroupedByModelItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface GroupedByGroupItem {
  groupName: string
  partCount: number
  parts: CatalogPartItem[]
}

export interface GroupedByGroupResponse {
  items: GroupedByGroupItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface NhtsaVinDecodeResponse {
  vin: string
  isValid: boolean
  errorCode: string
  errorText: string
  make: string | null
  model: string | null
  modelYear: string | null
  manufacturer: string | null
  vehicleType: string | null
  bodyClass: string | null
  series: string | null
  trim: string | null
  driveType: string | null
  transmissionStyle: string | null
  engineCylinders: string | null
  engineHP: string | null
  displacementL: string | null
  fuelTypePrimary: string | null
  plantCity: string | null
  plantState: string | null
  plantCountry: string | null
  gvwr: string | null
  doors: string | null
  rawAttributes: Record<string, string>
}
