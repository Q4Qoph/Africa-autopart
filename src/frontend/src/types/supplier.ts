export interface Part {
  id: number
  partName: string
  partNumber: string
  condition: string
  description: string
  imageURL: string
  price: number
  stock: number
  supplierId: number
}

export interface PartResponse extends Part {
  supplier: string
  orders: string[]
}

export interface Supplier {
  id: number
  businessName: string
  description: string
  category: string
  email: string
  phone: string
  parts: Part[]
}

export interface PartDTO {
  partName: string
  partNumber: string
  condition: string
  description: string
  imageURL: string
  price: number
  stock: number
}

export interface AddPartDTO extends PartDTO {
  supplierId: number
}

export type UpdatePartDTO = PartDTO

export interface AddSupplierDTO {
  businessName: string
  description: string
  category: string
  email: string
  phone: string
  parts: PartDTO[]
}

export interface UpdateSupplierDTO {
  businessName: string
  description: string
  category: string
  email: string
  phone: string
}
