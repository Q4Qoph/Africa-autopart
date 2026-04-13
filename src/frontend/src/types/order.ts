export interface Order {
  id: number
  supplierId: number
  partId: number
  partRequestId: number
  status: number  // 0=Pending, 1=Shipped, 2=Delivered
  price: number
  trackingNumber: string | null
  supplier: {
    id: number
    businessName: string
    description: string
    category: string
    email: string
    phone: string
  } | null
  part: {
    id: number
    partName: string
    partNumber: string
    condition: string
    description: string
    imageURL: string
    price: number
    stock: number
  } | null
  partRequest: {
    id: number
    vehicleMake: string
    model: string
    year: string
    partName: string
    description: string
    dateCreated: string
    isSorted: boolean
  } | null
}

export const OrderStatus = {
  Pending: 0,
  Shipped: 1,
  Delivered: 2,
} as const
export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus]

export function statusLabel(status: number): string {
  if (status === OrderStatus.Shipped) return 'Shipped'
  if (status === OrderStatus.Delivered) return 'Delivered'
  return 'Pending'
}

// kept for update calls — backend still accepts numeric status
export function statusToNumber(status: number): number {
  return status
}

export interface AddOrderDTO {
  supplierId: number
  partId: number
  partRequestId: number
  price: number
}

export interface UpdateOrderDTO {
  supplierId: number
  partId: number
  partRequestId: number
  price: number
  status?: number
  trackingNumber?: string
}
