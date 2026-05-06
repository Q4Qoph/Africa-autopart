import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { inventoryOrderApi } from '@/api/inventoryOrderApi';
import { invPaymentApi } from '@/api/invPaymentApi';
import type { InventoryOrderResponse } from '@/types/inventory';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const statusLabel: Record<number, string> = {
  0: 'Pending',
  1: 'Paid',
  2: 'In Transit',
  3: 'Delivered',
  4: 'Cancelled',
};

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { auth } = useAuth();
  const { t } = useTranslation('shop');
//   const navigate = useNavigate();

  const [order, setOrder] = useState<InventoryOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth || !orderId) return;
    inventoryOrderApi
      .getById(Number(orderId), auth.token)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Could not load order details'))
      .finally(() => setLoading(false));
  }, [auth, orderId]);

  async function handleStripePayment() {
    if (!auth || !order) return;
    setSubmitting(true);
    try {
      const { data } = await invPaymentApi.stripeAddPayment(order.id, auth.token);
      sessionStorage.setItem('pendingStripeSessionId', data.stripeSessionId);
      sessionStorage.setItem('pendingInvOrderId', String(order.id));
      window.location.href = data.url;
    } catch {
      setError('Failed to initiate Stripe payment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMpesaPayment() {
    if (!auth || !order) return;
    if (!phoneNumber.trim()) {
      setMpesaStatus('Phone number is required');
      return;
    }
    setSubmitting(true);
    setMpesaStatus('');
    try {
      const { data } = await invPaymentApi.mpesaInitiate(order.id, phoneNumber.trim(), auth.token);
      if (data.isSuccessful) {
        setMpesaStatus('STK push sent. Check your phone to complete payment.');
      } else {
        setMpesaStatus(data.responseDescription || 'STK push failed');
      }
    } catch {
      setMpesaStatus('Failed to initiate M‑Pesa payment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
        <Navbar />
        <main className="pt-[68px] md:pt-[132px] max-w-[700px] mx-auto px-6 py-12 text-center">
          <p>{t('loading')}</p>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
        <Navbar />
        <main className="pt-[68px] md:pt-[132px] max-w-[700px] mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-extrabold mb-4">{t('order_not_found') || 'Order not found'}</h1>
        </main>
      </div>
    );
  }

  const total = order.totalAmount.toLocaleString();

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px] max-w-[700px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold mb-6">{t('checkout_heading') || 'Checkout'}</h1>

        {/* Order summary */}
        <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">{t('order')} #{order.id}</h2>
            <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853]">{statusLabel[order.status]}</Badge>
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm mb-2">
              <span>{item.inventory.partName} x {item.quantity}</span>
              <span>KES {item.priceAtPurchase.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)] mt-3 pt-3 flex justify-between font-bold">
            <span>{t('total') || 'Total'}</span>
            <span className="text-[#00C853]">KES {total}</span>
          </div>
          {order.shipment.city && (
            <div className="mt-3 text-xs text-[#4A6B50] dark:text-[#7A9A80]">
              <p>{t('delivery_to') || 'Delivery to'}: {order.shipment.city}, {order.shipment.county}</p>
            </div>
          )}
        </div>

        {/* Payment method selection */}
        <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4">{t('payment_method') || 'Payment Method'}</h3>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="method" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
              {t('stripe') || 'Stripe'}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="method" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
              {t('mpesa') || 'M‑Pesa'}
            </label>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {mpesaStatus && <p className="text-blue-400 text-sm mb-3">{mpesaStatus}</p>}

          {paymentMethod === 'mpesa' && (
            <div className="mb-4">
              <Input
                placeholder="2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] h-9 w-48"
              />
            </div>
          )}

          <Button
            onClick={paymentMethod === 'stripe' ? handleStripePayment : handleMpesaPayment}
            disabled={submitting}
            className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-10 px-6"
          >
            {submitting ? (t('processing') || 'Processing…') : paymentMethod === 'stripe' ? (t('pay_with_stripe') || 'Pay with Stripe') : (t('pay_with_mpesa') || 'Pay with M‑Pesa')}
          </Button>
        </div>
      </main>
    </div>
  );
}