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
