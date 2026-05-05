import axios from 'axios'
import type { Order, AddOrderDTO, AddOrderResponse, UpdateOrderDTO, UpdateOrderStatusDTO, CustomerOrder } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const orderApi = {
  create: (dto: AddOrderDTO, token: string) =>
    api.post<AddOrderResponse>('/api/Order/addOrder', dto, authHeader(token)),

   getAll: (token: string) =>
    api.get<CustomerOrder[]>('/api/Order/getAllOrders', authHeader(token)),

  getById: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderById/${id}`, authHeader(token)),

  getByRequestId: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderByRequestId/${id}`, authHeader(token)),

  getBySupplierId: (id: number, token: string) =>
    api.get<Order[]>(`/api/Order/getOrderBySupplierId/${id}`, authHeader(token)),

  // Full update (used by admin to change multiple fields)
  update: (id: number, dto: UpdateOrderDTO, token: string) =>
    api.put<string>(`/api/Order/updateOrder/${id}`, dto, authHeader(token)),

  // Only status update (dedicated endpoint)
  updateStatus: (id: number, dto: UpdateOrderStatusDTO, token: string) =>
    api.put<string>(`/api/Order/updateOrderStatus/${id}`, dto, authHeader(token)),

  delete: (id: number, token: string) =>
    api.delete<string>(`/api/Order/deleteOrder/${id}`, authHeader(token)),

  // Customer order history (flat shape)
  getByUserId: (userId: number, token: string) =>
    api.get<CustomerOrder[]>(`/api/Order/myOrder/${userId}`, authHeader(token)),

  // Public tracking (raw Order shape)
  getByTrackingNumber: (trackingNumber: string) =>
    api.get<Order>(`/api/Order/orderbyTackingId/${trackingNumber}`),
}