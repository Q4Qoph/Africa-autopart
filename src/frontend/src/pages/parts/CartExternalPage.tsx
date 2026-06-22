// src/frontend/src/pages/parts/CartExternalPage.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExternalCart } from '@/context/ExternalCartContext';
import { requestApi } from '@/api/requestApi';
import { orderApi } from '@/api/orderApi';
import { paymentApi } from '@/api/paymentApi';
import type { AddOrderDTO, PaymentResponse, StkPushResponseDto } from '@/types/order';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function CartExternalPage() {
  const { t } = useTranslation('shop');
  const { auth } = useAuth();
  const { items, removeItem, updateQuantity, clearCart } = useExternalCart();
  const [delivery, setDelivery] = useState({ city: '', postalCode: '', county: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Payment dialog state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe');
  const [phone, setPhone] = useState('');
  const [mpesaMsg, setMpesaMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => {
    const priceNum = parseFloat(i.part.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + priceNum * i.quantity;
  }, 0);

  async function handlePlaceOrder() {
    if (!auth) return;
    if (!delivery.city.trim() || !delivery.county.trim() || !delivery.phone.trim()) {
      setError('City, county, and phone are required.');
      return;
    }
    setPlacing(true);
    setError('');

    try {
      const vehicleInfo = JSON.parse(sessionStorage.getItem('vinVehicleInfo') || '{}');
      if (!vehicleInfo.vin) {
        setError('Vehicle info missing. Please search again.');
        setPlacing(false);
        return;
      }

      const requestRes = await requestApi.create(
        {
          vehicleMake: vehicleInfo.make || '',
          model: vehicleInfo.model || '',
          year: String(vehicleInfo.year || ''),
          engineType: vehicleInfo.engine || '',
          chassisNumber: vehicleInfo.vin,
          partName: items.map(i => i.part.name).join(', '),
          partNumber: '',
          conditionPreference: 0,
          urgency: 0,
          description: `VIN search parts: ${items.map(i => i.part.name).join('; ')}`,
          country: 'Kenya',
          phone: delivery.phone,
          email: auth.email,
          dateCreated: new Date().toISOString(),
          userId: auth.userId,
          partImages: [],
          // isSorted: false,
          // orders: [],
        },
        auth.token,
      );

      const partRequestId: number = typeof requestRes.data === 'object'
        ? (requestRes.data as any).id
        : Number(requestRes.data);

      const orderPayload: AddOrderDTO = {
        partRequestId,
        userId: auth.userId,
        pickUpLocation: `${delivery.city}, ${delivery.county}`,
        pickUpLocationPhoneNumber: delivery.phone,
        orderItems: items.map(item => ({
          partName: item.part.name,
          supplierName: item.part.supplier,
          price: parseFloat(item.part.price.replace(/[^0-9.]/g, '')) || 0,
          quantity: item.quantity,
        })),
      };

      const orderRes = await orderApi.create(orderPayload, auth.token);
      const orderId = orderRes.data.orderId;

      clearCart();
      setCurrentOrderId(orderId);
      setPaymentOpen(true);        // open payment sidebar
    } catch (err) {
      console.error('Place order error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  // Payment handlers
  const handleStripe = async () => {
    if (!currentOrderId) return;
    setSubmitting(true);
    try {
      const { data } = await paymentApi.addPayment({ orderId: currentOrderId }, auth!.token) as unknown as { data: PaymentResponse };
      sessionStorage.setItem('pendingStripeSessionId', data.stripeSessionId);
      sessionStorage.setItem('pendingOrderId', String(currentOrderId));
      window.location.href = data.url;
    } catch (err) {
      console.error('Stripe error:', err);
      setError('Stripe payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMpesa = async () => {
    if (!currentOrderId) return;
    if (!phone.trim()) {
      setMpesaMsg('Phone number required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await paymentApi.initiateStkPush(currentOrderId, phone.trim(), auth!.token) as unknown as { data: StkPushResponseDto };
      if (data.isSuccessful) {
        setMpesaMsg('STK push sent. Check your phone to complete payment.');
      } else {
        setMpesaMsg(data.responseDescription || 'STK push failed');
      }
    } catch (err) {
      console.error('M‑Pesa error:', err);
      setMpesaMsg('M‑Pesa error');
    } finally {
      setSubmitting(false);
    }
  };

  // Empty cart view
  if (items.length === 0 && !paymentOpen) {
    return (
      <div className="flex-grow max-w-[900px] mx-auto px-6 py-12 text-center font-sans">
        <h1 className="text-2xl font-extrabold mb-4">{t('cart_empty')}</h1>
        <Link to="/" className="text-[#00C853] hover:underline">{t('continue_shopping')}</Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-[900px] mx-auto px-6 py-10 font-sans">
        <h1 className="text-2xl font-extrabold mb-6">Your External Parts Cart</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map((item, idx) => {
              return (
                <div key={idx} className="flex items-center gap-4 bg-white dark:bg-[#111C14] p-4 rounded-xl border border-[rgba(0,200,83,0.1)]">
                  {item.part.imageURL && (
                    <img src={item.part.imageURL} alt={item.part.name} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.part.name}</h3>
                    <p className="text-xs text-[#4A6B50]">{item.part.supplier}</p>
                    <p className="text-sm font-bold text-[#00C853]">${item.part.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min="1" value={item.quantity}
                      onChange={e => updateQuantity(item.part, parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center"
                    />
                    <button onClick={() => removeItem(item.part)} className="text-red-400 text-xs hover:underline">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-[#111C14] p-5 rounded-xl border border-[rgba(0,200,83,0.1)] h-fit">
            <h2 className="text-lg font-bold mb-4">Summary</h2>
            <div className="flex justify-between text-sm mb-4">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <Input placeholder="City" value={delivery.city} onChange={e => setDelivery(s => ({ ...s, city: e.target.value }))} />
              <Input placeholder="Postal Code" value={delivery.postalCode} onChange={e => setDelivery(s => ({ ...s, postalCode: e.target.value }))} />
              <Input placeholder="County" value={delivery.county} onChange={e => setDelivery(s => ({ ...s, county: e.target.value }))} />
              <Input placeholder="Phone Number (2547...)" value={delivery.phone} onChange={e => setDelivery(s => ({ ...s, phone: e.target.value }))} />
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <Button onClick={handlePlaceOrder} disabled={placing} className="w-full mt-4 bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-10">
              {placing ? 'Placing Order…' : 'Place Order'}
            </Button>
          </div>
        </div>

        {/* Payment Sidebar Dialog */}
        {paymentOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-[#111C14] shadow-2xl border-l border-[rgba(0,200,83,0.15)] p-6 transform transition-transform overflow-y-auto">
            <button onClick={() => setPaymentOpen(false)} className="absolute top-4 right-4 text-[#4A6B50] hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-extrabold mb-6">Checkout</h2>
            <p className="text-sm mb-4">Order # {currentOrderId}</p>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                  Stripe
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                  M‑Pesa
                </label>
              </div>
              {paymentMethod === 'mpesa' && (
                <Input placeholder="2547..." value={phone} onChange={e => setPhone(e.target.value)} className="w-full mb-2" />
              )}
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {mpesaMsg && <p className="text-blue-400 text-xs">{mpesaMsg}</p>}
              <Button
                onClick={paymentMethod === 'stripe' ? handleStripe : handleMpesa}
                disabled={submitting}
                className="w-full bg-[#00C853] hover:bg-[#39FF88] h-10 mt-2"
              >
                {submitting ? 'Processing…' : paymentMethod === 'stripe' ? 'Pay with Stripe' : 'Pay with M‑Pesa'}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}