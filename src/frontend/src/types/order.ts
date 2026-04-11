import type { Supplier, Part } from './supplier'
import type { PartRequest } from './request'

export const OrderStatus = {
  Pending: 0,
  Shipped: 1,
  Delivered: 2,
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

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

export interface Order {
  id: number
  supplierId: number
  partId: number
  partRequestId: number
  status: OrderStatus
  price: number
  trackingNumber: string
  supplier: Supplier
  part: Part
  partRequest: PartRequest
}
