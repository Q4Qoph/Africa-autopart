import axios from 'axios'
import type { PartRequest, AddPartRequestDTO } from '@/types/request'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const requestApi = {
  create: (dto: AddPartRequestDTO, token: string) =>
    api.post<string>('/api/Request', dto, authHeader(token)),

  getAll: (token: string) =>
    api.get<PartRequest[]>('/api/Request', authHeader(token)),

  // Note: server uses POST for this lookup
  getById: (id: number, token: string) =>
    api.post<PartRequest>(`/api/Request/getRequestById/${id}`, {}, authHeader(token)),

  update: (id: number, dto: AddPartRequestDTO, token: string) =>
    api.put<string>(`/api/Request/updateRequest/${id}`, dto, authHeader(token)),

  delete: (id: number, token: string) =>
    api.delete<string>(`/api/Request/delete/${id}`, authHeader(token)),

  markAsSorted: (id: number, token: string) =>
    api.put<string>(`/api/Request/markAsSorted/${id}`, {}, authHeader(token)),
}
