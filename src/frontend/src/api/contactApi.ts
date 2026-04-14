import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export interface ContactDTO {
  id?: number
  name: string
  email: string
  phone: string
  message: string
}

export const contactApi = {
  submit: (dto: ContactDTO) =>
    api.post<string>('/api/Contact', dto),

  getAll: (token: string) =>
    api.get<ContactDTO[]>('/api/Contact', authHeader(token)),
}
