// src/frontend/src/pages/orders/MpesaStatusPage.tsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { paymentApi } from '@/api/paymentApi'
import Navbar from '@/components/layout/Navbar'

export default function MpesaStatusPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { auth } = useAuth()
  const [status, setStatus] = useState<'waiting' | 'success' | 'failed'>('waiting')

  useEffect(() => {
    if (!orderId || !auth) {
      setStatus('failed')
      return
    }

    const id = Number(orderId)
    let attempts = 0
    const maxAttempts = 30
    let timer: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      try {
        const { data } = await paymentApi.validateMpesa(id, auth.token)
        if (data) {
          setStatus('success')
          return
        }

        attempts += 1
        if (attempts >= maxAttempts) {
          setStatus('failed')
          return
        }

        timer = setTimeout(poll, 10000)
      } catch {
        setStatus('failed')
      }
    }

    poll()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [orderId, auth])

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
          {status === 'waiting' && (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-[#00C853] border-t-transparent animate-spin mx-auto mb-6" />
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                Waiting for M-Pesa confirmation...
              </p>
              <p className="text-xs text-[#7A9A80] mt-2">
                Check your phone and complete the STK prompt.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[rgba(0,200,83,0.12)] border border-[rgba(0,200,83,0.25)] grid place-items-center mx-auto mb-6">
                <span className="text-[#00C853] text-3xl">✓</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-4">
                Payment successful
              </h2>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-2.5 text-sm hover:bg-[#39FF88] transition-colors"
              >
                View orders
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 grid place-items-center mx-auto mb-6">
                <span className="text-red-400 text-3xl">✗</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-4">
                Payment failed
              </h2>
              <Link
                to="/requests"
                className="inline-flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] font-medium px-6 py-2.5 text-sm hover:text-[#07110A] dark:hover:text-white transition-colors"
              >
                Back to Requests
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}