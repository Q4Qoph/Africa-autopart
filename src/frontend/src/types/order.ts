// ─── Enums & Constants ──────────────────────────────────────────────────────

export const OrderStatus = {
  Pending: 'Pending',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
} as const
export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus]

// Numeric status values from API
export const OrderStatusCode = {
  Pending: 0,
  Shipped: 1,
  Delivered: 2,
} as const


// ─── Raw API Types ──────────────────────────────────────────────────────────

/** Exact shape returned by GET /api/Order/* (except /myOrder) */
export interface Order {
  id: number
  supplierName: string
  partRequestId: number
  partName: string
  status: number               // 0,1,2
  price: number
  userId: number | null
  pickUpLocation: string
  pickUpLocationPhoneNumber: string
  trackingNumber: string
  partRequest: PartRequestRef | null
  payment: PaymentRef | null
}

interface PartRequestRef {
  id: number
  vehicleMake: string
  model: string
  year: string
  engineType: string
  chassisNumber: string
  partName: string
  partNumber: string
  conditionPreference: number
  urgency: number
  description: string
  country: string
  phone: string
  email: string
  dateCreated: string
  partImages: PartImageRef[]
  isSorted: boolean
  userId: number
  orders: string[]            // probably order reference IDs
}

interface PartImageRef {
  id: number
  partReequestId: number
  imageUrl: string
  partRequest: string
}

interface PaymentRef {
  id: number
  orderId: number
  stripeSessionId: string
  paymentIntentId: string
  amount: number
  status: number
  order: string
  checkoutRequestId: string
  mpesaReceiptNumber: string
  merchantRequestId: string
}

/** Shape returned by /api/Order/myOrder/{userId} (flat, different keys) */
export interface CustomerOrder {
  orderId: number
  trackingNumber: string
  status: string            // already a string like "Pending"
  price: number
  vehicleMake: string
  model: string
  requestedPartName: string
  requestDescription: string
  dateCreated: string
}

// ─── Display‑ready type for admin tables ────────────────────────────────────

export interface DisplayOrder {
  orderId: number
  trackingNumber: string
  statusString: string
  price: number
  vehicleMake: string
  model: string
  requestedPartName: string
  dateCreated: string
  // keep raw status number for edit logic
  statusCode: number
  raw: Order
}

/** Convert a raw Order to a DisplayOrder for admin pages */
export function mapOrderToDisplay(o: Order): DisplayOrder {
  return {
    orderId: o.id,
    trackingNumber: o.trackingNumber,
    statusString: statusCodeToString(o.status),
    price: o.price,
    vehicleMake: o.partRequest?.vehicleMake ?? '',
    model: o.partRequest?.model ?? '',
    requestedPartName: o.partRequest?.partName ?? o.partName,
    dateCreated: o.partRequest?.dateCreated ?? '',
    statusCode: o.status,
    raw: o,
  }
}

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface AddOrderDTO {
  supplierName: string
  partName: string
  partRequestId: number
  userId?: number
  price: number
  pickUpLocation: string
  pickUpLocationPhoneNumber: string
}

export interface AddOrderResponse {
  orderId: number
  trackingNumber: string
}

export interface UpdateOrderDTO {
  supplierName?: string
  partName?: string
  partRequestId?: number
  userId?: number
  price?: number
  pickUpLocation?: string
  pickUpLocationPhoneNumber?: string
  trackingNumber?: string
}

export interface UpdateOrderStatusDTO {
  status: number
}

// ─── Payment DTOs (unchanged) ───────────────────────────────────────────────

export interface AddPaymentDTO {
  orderId: number
}

export interface PaymentResponse {
  stripeSessionId: string
  url: string
}

export interface StkPushResponseDto {
  merchantRequestID: string
  checkoutRequestID: string
  responseCode: string
  responseDescription: string
  customerMessage: string
  isSuccessful: boolean
}
// After the existing types...

export function statusLabel(status: number): string {
  switch (status) {
    case 0: return 'Pending'
    case 1: return 'Shipped'
    case 2: return 'Delivered'
    default: return 'Unknown'
  }
}

export function statusCodeToString(code: number): string {
  return statusLabel(code) // alias
}
// /** Convert numeric status from API to our string constant */
// export function statusCodeToString(code: number): OrderStatusValue {
//   switch (code) {
//     case 0: return OrderStatus.Pending
//     case 1: return OrderStatus.Shipped
//     case 2: return OrderStatus.Delivered
//     default: return OrderStatus.Pending
//   }
// }


export interface OrderDisplayInfo {
  orderId: number
  trackingNumber: string
  status: number
  statusString: string
  price: number
  vehicleMake: string
  model: string
  requestedPartName: string
  dateCreated: string
  raw: Order
}

export function getOrderDisplay(order: Order): OrderDisplayInfo {
  const pr = order.partRequest
  return {
    orderId: order.id,
    trackingNumber: order.trackingNumber,
    status: order.status,
    statusString: statusLabel(order.status),
    price: order.price,
    vehicleMake: pr?.vehicleMake ?? '',
    model: pr?.model ?? '',
    requestedPartName: pr?.partName ?? order.partName,
    dateCreated: pr?.dateCreated ?? '',
    raw: order,
  }
}