//src/frontend/src/api/userApi.ts
import axios from 'axios'
import type { AddUserDTO, LoginUserDTO, LoginResponseDTO, UpdateUserDTO, User, ForgotPasswordDTO, ResetPasswordDTO, PaginatedUsersResponse, StatsResponse } from '@/types/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const userApi = {
  register: (dto: AddUserDTO) =>
    api.post<string>('/api/User/addUser', dto),

  login: (dto: LoginUserDTO) =>
    api.post<LoginResponseDTO>('/api/User/login', dto),

  getAllUsers: (token: string, pageSize?: number, pageNumber?: number) => {
    const params: Record<string, number> = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageNumber !== undefined) params.pageNumber = pageNumber;
    return api.get<PaginatedUsersResponse>('/api/User/getAllUsers', {
      ...authHeader(token),
      params,
    });
  },

  getUserById: (id: number, token: string) =>
    api.get<User>(`/api/User/getUserById/${id}`, authHeader(token)),

  updateUser: (id: number, dto: UpdateUserDTO, token: string) =>
    api.put<string>(`/api/User/updateUser/${id}`, dto, authHeader(token)),

  deleteUser: (id: number, token: string) =>
    api.delete<string>(`/api/User/deleteUser/${id}`, authHeader(token)),

  approveUser: (id: number, token: string) =>
    api.put<boolean>(`/api/User/user/approveUser/${id}`, {}, authHeader(token)),

  forgotPassword: (dto: ForgotPasswordDTO) =>
    api.post<boolean>('/api/User/forgotPassword', dto),

  resetPassword: (dto: ResetPasswordDTO) =>
    api.post<boolean>('/api/User/user/resetPassword', dto),
}

// start for admin
export const statsApi = {
  getStats: (token: string) =>
    api.get<StatsResponse>('/api/Stats/Stats', authHeader(token)),
};