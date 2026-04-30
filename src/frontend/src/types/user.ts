export const UserRole = {
  Admin: 0,
  Customer: 1,
  Supplier: 2,
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
  isApproved: boolean
  role: UserRole
}

export interface AddUserDTO {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface UpdateUserDTO {
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
}

export interface LoginUserDTO {
  email: string
  password: string
}

export interface LoginResponseDTO {
  id: number
  role: UserRole
  userId: number
  email: string
  token: string
}

export interface ForgotPasswordDTO {
  email: string
}

export interface ResetPasswordDTO {
  token: string
  password: string
  confirmPassword: string
}


export interface StatsResponse {
  total_Order: number;
  pending_Order: number;
  completed_Order: number;
  inProgress_Order: number;
  total_User: number;
  total_Request: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}