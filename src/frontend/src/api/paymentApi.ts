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
  // ─── Legacy/Admin/Request payment endpoints ────────────────────────────
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

  // ─── New/Cart/VIN-related payment endpoints ────────────────────────────
  addNewPayment: (dto: AddPaymentDTO, token: string) =>
    api.post<PaymentResponse>('/new/addPayment', dto, authHeader(token)),

  validateNewPayment: (stripeSessionId: string, token: string) =>
    api.put<string>('/api/Payment/new/validatePayment', null, {
      params: { StripeSessionId: stripeSessionId },
      ...authHeader(token),
    }),

  initiateNewStkPush: (orderId: number, phoneNumber: string, token: string) =>
    api.post<StkPushResponseDto>('/api/Mpesa/new/initiateStkPush', null, {
      params: { phoneNumber, Id: orderId },
      ...authHeader(token),
    }),

  validateNewMpesa: (orderId: number, token: string) =>
    api.get<boolean>(`/api/Mpesa/new/validate/${orderId}`, authHeader(token)),
}