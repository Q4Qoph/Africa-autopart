// src/frontend/src/types/parts.ts

export interface PartSearchDTO {
  query: string
  make: string
  model: string
  year: string
}

export interface PartResult {
  id: number
  partName: string
  partNumber: string
  condition: string
  description: string
  imageURL: string
  price: number
  stock: number
  supplierId: number
  supplierName: string
}

// ─── VIN lookup ─────────────────────────────────────────────────────────────

export interface VinResult {
  vin: string
  country: string
  region: string
  wmi: string
  vds: string
  vis: string
  year: number
  manufacturer: string
  model: string
  class: string
  make: string
  trim: string
  engine: string
  fuelType: string
  transmission: string
  driveType: string
  doors: string
  plantCity: string
}

// ─── Parts search request (POST /api/Parts/search body) ─────────────────────

export interface PartSearchRequest {
  manufacturer: string
  year: string
  engine: string
  model: string
  class: string
  make: string
}

// ─── Grouped parts search response ──────────────────────────────────────────

export interface SearchPart {
  name: string
  partNumber: string
  price: string
  originalPrice: string
  supplier: string
  availability: boolean
  location: string
  imageURL: string
}

export interface CategoryGroup {
  category: string
  parts: SearchPart[]
}