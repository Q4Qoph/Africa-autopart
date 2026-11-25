// src/frontend/src/api/imageApi.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const imageApi = {
  upload: (file: File, token: string) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<string>('/api/Image/upload', form, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
