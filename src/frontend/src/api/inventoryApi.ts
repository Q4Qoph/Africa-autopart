import axios from 'axios'
import type { InventoryItem, AddInventoryDTO } from '@/types/inventory'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const inventoryApi = {
  /** GET /api/Inventory/getAllAdverts — public */
  getAllAdverts: () =>
    api.get<InventoryItem[]>('/api/Inventory/getAllAdverts'),

  /** GET /api/Inventory/getInventory/{id} — public */
  getById: (id: number) =>
    api.get<InventoryItem>(`/api/Inventory/getInventory/${id}`),

  /** POST /api/Inventory/addAdvert */
  add: (dto: AddInventoryDTO) =>
    api.post<string>('/api/Inventory/addAdvert', dto),

  /** PUT /api/Inventory/updateInventory/{id} */
  update: (id: number, dto: AddInventoryDTO) =>
    api.put<string>(`/api/Inventory/updateInventory/${id}`, dto),

  /** DELETE /api/Inventory/deleteInventory/{id} */
  delete: (id: number) =>
    api.delete<boolean>(`/api/Inventory/deleteInventory/${id}`),
}

