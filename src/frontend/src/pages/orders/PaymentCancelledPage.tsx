// src/frontend/src/pages/orders/PaymentCancelledPage.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/layout/Navbar'

export default function PaymentCancelledPage() {
  const { t } = useTranslation('orders')

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 grid place-items-center mx-auto mb-6">
            <span className="text-amber-400 text-3xl">⚠</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-4">
            {t('payment_cancelled')}
          </h2>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] mb-8">
            {t('payment_cancelled_desc')}
          </p>
          <Link
            to="/requests"
            className="inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-2.5 text-sm hover:bg-[#39FF88] transition-colors"
          >
            {t('back_to_requests')}
          </Link>
        </div>
      </main>
    </div>
  )
}