// src/frontend/src/api/advertisementApi.ts

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export interface Advertisement {
  id: number
  partName: string
  description: string
  vehicleMake: string
  vehicleModel: string
  price: number
  supplierName: string
  imageURL: string
}

export interface AddAdvertisementDTO {
  partName: string
  description: string
  vehicleMake: string
  vehicleModel: string
  price: number
  supplierName: string
  imageURL: string
}

export const advertisementApi = {
  getAllAdverts: () =>
    api.get<Advertisement[]>('/api/Advertisement/getAllAdverts'),

  addAdvert: (dto: AddAdvertisementDTO) =>
    api.post<string>('/api/Advertisement/addAdvert', dto),
}