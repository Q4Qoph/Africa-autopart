// src/frontend/src/types/catalog.ts

export interface CatalogPartItem {
  id: number
  vin: string | null
  oem: string | null
  make?: string | null
  model: string | null
  modelYear: string | null
  vehicleSeries?: string | null
  vehicle?: string | null
  series?: string | null
  groupName: string | null
  subgroupName: string | null
  pnc: string | null
  partNumber: string
  partName: string
  quantity: number
  replacePart: string | null
  steering?: string | null
  compatibilityStartYear?: number | null
  compatibilityEndYear?: number | null
  fuel?: string | null
  displacementCC?: string | null
  engineFamily?: string | null
  engineType?: string | null
  transmission?: string | null
  body?: string | null
  marketSpec?: string | null
  picId?: string | null
  imageUrl: string | null
  source?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  pageNumber?: number
}

export interface VinNhtsaData {
  success?: boolean
  make?: string | null
  model?: string | null
  modelYear?: string | null
  manufacturer?: string | null
  vehicleType?: string | null
  bodyClass?: string | null
  engineCylinders?: string | null
  displacementCC?: string | null
  fuelTypePrimary?: string | null
  driveType?: string | null
  trim?: string | null
  errorText?: string | null
}

export interface DecodedVinData {
  vin: string
  isValidFormat: boolean
  checkDigitValid?: boolean
  wmi?: string | null
  vds?: string | null
  checkDigitChar?: string | null
  modelYearCode?: string | null
  modelYear?: number | null
  plantCode?: string | null
  serialNumber?: string | null
  make?: string | null
  model?: string | null
  nhtsa?: VinNhtsaData | null
  errors?: string[]
  alternateModelYear?: number | null
}

export interface VehicleVinResponse {
  vin?: string
  model?: string | null
  modelYear?: string | null
  vehicle?: string | null
  series?: string | null
  partCount?: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  parts?: CatalogPartItem[] | PaginatedResponse<CatalogPartItem>
  decoded?: DecodedVinData
  matchedInCatalog?: boolean
}

export interface VehicleSearchParams {
  keyword?: string
  vin?: string
  oem?: string
  make?: string
  model?: string
  modelYear?: string
  year?: number
  vehicleSeries?: string
  groupName?: string
  subgroupName?: string
  pnc?: string
  partNumber?: string
  partName?: string
  steering?: string
  fuel?: string
  displacementCC?: string
  engineFamily?: string
  engineType?: string
  transmission?: string
  body?: string
  marketSpec?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
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

export interface PartNewSearchRequestDto {
  model?: string
  searchTerm?: string
  pageNumber: number
  pageSize: number
}

export interface PartNewSearchResponse {
  data: CatalogPartItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
}

export interface PaginatedPartsResponse {
  items: CatalogPartItem[]
  page?: number
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
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
