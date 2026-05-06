// src/frontend/src/api/supplierApi.ts
import axios from 'axios'
import type { Supplier, AddSupplierDTO, UpdateSupplierDTO, AddPartDTO, UpdatePartDTO, PartResponse } from '@/types/supplier'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const supplierApi = {
  getAll: () =>
    api.get<Supplier[]>('/api/Suppliers/suppliers'),

  getById: (id: number) =>
    api.get<Supplier>(`/api/Suppliers/supplier/${id}`),

  search: (term: string, token?: string) =>
    token
      ? api.get<PartResponse[]>(`/api/Suppliers/searchTerm/${encodeURIComponent(term)}`, authHeader(token))
      : api.get<PartResponse[]>(`/api/Suppliers/searchTerm/${encodeURIComponent(term)}`),

  add: (dto: AddSupplierDTO, token?: string) =>
    token
      ? api.post<string>('/api/Suppliers/addSupplier', dto, authHeader(token))
      : api.post<string>('/api/Suppliers/addSupplier', dto),

  update: (id: number, dto: UpdateSupplierDTO, token: string) =>
    api.put<string>(`/api/Suppliers/update/${id}`, dto, authHeader(token)),

  delete: (id: number, token: string) =>
    api.delete<string>(`/api/Suppliers/delete/${id}`, authHeader(token)),

  addPart: (dto: AddPartDTO, token: string) =>
    api.post<string>('/api/Suppliers/addPart', dto, authHeader(token)),

  updatePart: (id: number, dto: UpdatePartDTO, token: string) =>
    api.put<string>(`/api/Suppliers/updatePart/${id}`, dto, authHeader(token)),

  myProducts: (id: number, token: string) =>
    api.get<Supplier[]>(`/api/Suppliers/myProducts/${id}`, authHeader(token)),
}
