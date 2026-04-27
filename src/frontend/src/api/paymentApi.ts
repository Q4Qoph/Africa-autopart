// src/frontend/src/api/paymentApi.ts
import axios from 'axios'
import type { AddPaymentDTO, PaymentResponse, StkPushResponseDto } from '@/types/order'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const paymentApi = {
  addPayment: (dto: AddPaymentDTO, token: string) =>
    api.post<PaymentResponse>('/api/Payment/addPayment', dto, authHeader(token)),

  validatePayment: (stripeSessionId: string, token: string) =>
    api.put<string>('/api/Payment/validatePayment', null, {
      params: { StripeSessionId: stripeSessionId },
      ...authHeader(token),
    }),

  initiateStkPush: (orderId: number, phoneNumber: string, token: string) =>
    api.post<StkPushResponseDto>('/api/Mpesa/initiateStkPush', null, {
      params: { phoneNumber, Id: orderId },
      ...authHeader(token),
    }),

  validateMpesa: (orderId: number, token: string) =>
    api.get<boolean>(`/api/Mpesa/validate/${orderId}`, authHeader(token)),
}