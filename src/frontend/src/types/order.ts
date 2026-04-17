export interface Order {
  orderId: number
  trackingNumber: string | null
  status: string
  price: number
  vehicleMake: string
  model: string
  requestedPartName: string
  requestDescription: string
  dateCreated: string
}

export const OrderStatus = {
  Pending: 'Pending',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
} as const
export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus]

export function statusLabel(status: string): string {
  return status ?? 'Pending'
}

export interface AddOrderDTO {
  supplierName: string
  partName: string
  partRequestId: number
  price: number
}

export interface UpdateOrderDTO {
  supplierName?: string
  partName?: string
  partRequestId?: number
  price: number
  status?: string
  trackingNumber?: string
}

export interface AddPaymentDTO {
  orderId: number
}

export interface PaymentResponse {
  stripeSessionId: string
  url: string
}
