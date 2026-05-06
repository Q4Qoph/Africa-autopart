import axios from 'axios';
import type { CreateInventoryOrderDTO, InventoryOrderResponse } from '@/types/inventory';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const inventoryOrderApi = {
  /** POST /api/InventoryOrder/createOrder */
  create: (dto: CreateInventoryOrderDTO, token: string) =>
    api.post<number>('/api/InventoryOrder/createOrder', dto, authHeader(token)),

  /** GET /api/InventoryOrder */
  getAll: (token: string) =>
    api.get<InventoryOrderResponse[]>('/api/InventoryOrder', authHeader(token)),

  /** GET /api/InventoryOrder/order/{orderId} */
  getById: (orderId: number, token: string) =>
    api.get<InventoryOrderResponse>(`/api/InventoryOrder/order/${orderId}`, authHeader(token)),

  /** GET /api/InventoryOrder/orderByUsers/{userId} */
  getByUserId: (userId: number, token: string) =>
    api.get<InventoryOrderResponse[]>(`/api/InventoryOrder/orderByUsers/${userId}`, authHeader(token)),

  /** PUT /api/InventoryOrder/updateOrder/{orderId}?status=value */
  updateStatus: (orderId: number, status: number, token: string) =>
    api.put<InventoryOrderResponse[]>(`/api/InventoryOrder/updateOrder/${orderId}?status=${status}`, null, authHeader(token)),
};