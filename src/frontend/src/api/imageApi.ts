import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const imageApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<string>('/api/Image/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
