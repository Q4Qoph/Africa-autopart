import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { paymentApi } from '@/api/paymentApi'
import Navbar from '@/components/layout/Navbar'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const { auth } = useAuth()
  const { t } = useTranslation('orders')

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')

  useEffect(() => {
    const sessionId = searchParams.get('stripeSessionId')
    const validate = sessionId && auth
      ? paymentApi.validatePayment(sessionId, auth.token).then(() => setStatus('success'))
      : Promise.resolve(setStatus('failed'))
    validate.catch(() => setStatus('failed'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
          {status === 'verifying' && (
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('payment_verifying')}</p>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[rgba(0,200,83,0.12)] border border-[rgba(0,200,83,0.25)] grid place-items-center mx-auto mb-6">
                <span className="text-[#00C853] text-3xl">✓</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-4">
                {t('payment_success')}
              </h2>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-2.5 text-sm hover:bg-[#39FF88] transition-colors"
              >
                {t('page_heading')}
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 grid place-items-center mx-auto mb-6">
                <span className="text-red-400 text-3xl">✗</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-4">
                {t('payment_failed')}
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
