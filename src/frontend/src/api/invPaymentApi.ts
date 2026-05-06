import axios from 'axios';
import type { StkPushResponseDto } from '@/types/order';  // reuse existing STK type

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

interface StripePaymentResponse {
  stripeSessionId: string;
  url: string;
}

export const invPaymentApi = {
  /** Stripe */
  stripeAddPayment: (orderId: number, token: string) =>
    api.post<StripePaymentResponse>('/api/InvPayment/stripe/addPayment', { orderId }, authHeader(token)),

  stripeValidate: (stripeSessionId: string, token: string) =>
    api.put<boolean>(`/api/InvPayment/stripe/validatePayment?StripeSessionId=${stripeSessionId}`, null, authHeader(token)),

  /** M‑Pesa */
  mpesaInitiate: (orderId: number, phoneNumber: string, token: string) =>
    api.post<StkPushResponseDto>(`/api/InvPayment/mpesa/initiateStkPush?phoneNumber=${encodeURIComponent(phoneNumber)}&Id=${orderId}`, null, authHeader(token)),

  mpesaValidate: (orderId: number, token: string) =>
    api.put<string>(`/api/InvPayment/mpesa/validatePayment?orderId=${orderId}`, null, authHeader(token)),
};