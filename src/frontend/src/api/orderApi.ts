import axios from 'axios'
import type { Order, AddOrderDTO } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const orderApi = {
  create: (dto: AddOrderDTO, token: string) =>
    api.post<string>('/api/Order/addOrder', dto, authHeader(token)),

  getAll: (token: string) =>
    api.get<Order[]>('/api/Order/getAllOrders', authHeader(token)),

  getById: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderById/${id}`, authHeader(token)),

  getByRequestId: (id: number, token: string) =>
    api.get<Order>(`/api/Order/getOrderBRequestId/${id}`, authHeader(token)),

  update: (id: number, dto: AddOrderDTO, token: string) =>
    api.put<string>(`/api/Order/updateOrder/${id}`, dto, authHeader(token)),

  delete: (id: number, token: string) =>
    api.delete<string>(`/api/Order/deleteOrder/${id}`, authHeader(token)),
}
