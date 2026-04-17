import axios from 'axios'
import type { Order, AddOrderDTO, UpdateOrderDTO } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const orderApi = {
  create: (dto: AddOrderDTO, token: string) =>
    api.post<number>('/api/Order/addOrder', dto, authHeader(token)),

  getAll: (token: string) =>
    api.get<Order[]>('/api/Order/getAllOrders', authHeader(token)),

  getById: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderById/${id}`, authHeader(token)),

  getByRequestId: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderByRequestId/${id}`, authHeader(token)),

  getBySupplierId: (id: number, token: string) =>
    api.get<Order[]>(`/api/Order/getOrderBySupplierId/${id}`, authHeader(token)),

  update: (id: number, dto: UpdateOrderDTO, token: string) =>
    api.put<string>(`/api/Order/updateOrder/${id}`, dto, authHeader(token)),

  delete: (id: number, token: string) =>
    api.delete<string>(`/api/Order/deleteOrder/${id}`, authHeader(token)),
}
