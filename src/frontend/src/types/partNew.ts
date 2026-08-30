export interface PartNewItem {
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
}

export interface PartNewSearchRequest {
  model?: string
  searchTerm?: string
  pageNumber?: number
  pageSize?: number
}

export interface PartNewSearchResponse {
  data: PartNewItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
}
