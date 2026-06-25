// src/frontend/src/pages/parts/CartExternalPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useExternalCart } from '@/context/ExternalCartContext'
import { orderApi } from '@/api/orderApi'
import { paymentApi } from '@/api/paymentApi'
import type { AddNewOrderDTO } from '@/types/order'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Home, Trash2, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export default function CartExternalPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useExternalCart()
  
  // Delivery address form
  const [delivery, setDelivery] = useState({
    city: '',
    postalCode: '',
    county: '',
    phone: '',
    fullName: auth ? 'Fredie Obiero' : '' // Default name from screenshot
  })
  
  // Shipping Method: 'ems' | 'dhl' | 'fedex'
  const [shippingMethod, setShippingMethod] = useState<'ems' | 'dhl' | 'fedex'>('ems')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  // Payment Method: 'stripe' | 'mpesa'
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [mpesaPhone, setMpesaPhone] = useState('')

  // Dummy credit card form details (for matching PartSouq card UI input look)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const subtotal = items.reduce((sum, i) => {
    const priceNum = parseFloat(i.part.price.replace(/[^0-9.]/g, '')) || 0
    return sum + priceNum * i.quantity
  }, 0)

  // Shipping costs from screenshot / custom rules
  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'ems': return 15.00
      case 'dhl': return 35.00
      case 'fedex': return 45.00
    }
  }

  const shippingCost = getShippingCost()
  const total = subtotal + shippingCost

  function formatMpesaPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1)
    }
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned
    }
    return cleaned
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) {
      setError('Please login to place an order.')
      return
    }
    if (!delivery.city.trim() || !delivery.postalCode.trim() || !delivery.county.trim() || !delivery.phone.trim()) {
      setError('City, Postal Code, County, and Phone Number are required.')
      return
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions to proceed.')
      return
    }

    const phoneToUse = (mpesaPhone || delivery.phone).trim()
    if (paymentMethod === 'mpesa' && !phoneToUse) {
      setError('M-Pesa Phone Number is required.')
      return
    }

    setPlacing(true)
    setError('')

    try {
      // 1. Map cart items into DTO items format
      const orderItems = items.map(item => {
        const itemPrice = parseFloat(item.part.price.replace(/[^0-9.]/g, '')) || 0
        return {
          partNumber: item.part.partNumber,
          name: item.part.name,
          description: item.part.supplier || 'Genuine OEM Part',
          price: itemPrice,
          quantity: item.quantity
        }
      })

      // 2. Submit New Order
      const newOrderPayload: AddNewOrderDTO = {
        userId: auth.userId,
        items: orderItems,
        shipping: {
          city: delivery.city,
          postalCode: delivery.postalCode,
          county: delivery.county
        }
      }

      const orderRes = await orderApi.createNewOrder(newOrderPayload, auth.token)
      // Extract created order ID returned from API
      const orderId = orderRes.data.orderId

      if (!orderId) {
        throw new Error('Failed to parse order ID.')
      }

      // 3. Clear local shopping cart
      clearCart()

      if (paymentMethod === 'stripe') {
        // 4. Initiate Stripe Checkout Payment
        const paymentRes = await paymentApi.addNewPayment({ orderId }, auth.token)
        const paymentData = paymentRes.data

        // Save Stripe session details for callback verification on /success page
        sessionStorage.setItem('pendingStripeSessionId', paymentData.stripeSessionId)
        sessionStorage.setItem('pendingOrderId', String(orderId))
        sessionStorage.setItem('isNewOrder', 'true')

        // 5. Redirect browser directly to Stripe hosted checkout page
        window.location.href = paymentData.url
      } else {
        // 4. Initiate M-Pesa STK Push
        const formattedPhone = formatMpesaPhone(phoneToUse)
        const mpesaRes = await paymentApi.initiateNewStkPush(orderId, formattedPhone, auth.token)
        if (mpesaRes.data.isSuccessful) {
          sessionStorage.setItem('isNewOrder', 'true')
          navigate(`/orders/mpesa-status/${orderId}`)
        } else {
          throw new Error(mpesaRes.data.customerMessage || 'Failed to initiate M-Pesa STK push.')
        }
      }
    } catch (err: any) {
      console.error('Checkout creation error:', err)
      setError(err?.message || 'Could not process checkout order creation. Please check inputs.')
      setPlacing(false)
    }
  }

  // Login Required block
  if (!auth) {
    return (
      <div className="flex-grow max-w-[800px] mx-auto px-6 py-16 text-center font-sans select-none">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <ShieldCheck className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 mb-2">Secure Checkout</h1>
        <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">Please login to review order details, complete shipping confirmation, and check out.</p>
        <Link to="/login">
          <Button className="bg-[#4bc0db] hover:bg-[#39a9c4] text-white font-extrabold px-8 py-2">
            SIGN IN TO PROCEED
          </Button>
        </Link>
      </div>
    )
  }

  // Placing order loader
  if (placing) {
    return (
      <div className="flex-grow max-w-[600px] mx-auto px-6 py-20 text-center font-sans select-none flex flex-col items-center justify-center animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-[#33b5e5] border-t-transparent animate-spin mb-6" />
        <h1 className="text-lg font-black text-[#07110A] uppercase tracking-wider mb-2">
          {paymentMethod === 'stripe' ? 'Redirecting to Stripe...' : 'Sending M-Pesa Prompt...'}
        </h1>
        <p className="text-slate-500 text-xs max-w-xs leading-relaxed font-semibold">
          {paymentMethod === 'stripe'
            ? 'Please wait while we establish a secure connection to the checkout gateway. Do not close this page.'
            : 'Please wait while we initiate the M-Pesa payment prompt on your phone. Enter your PIN to proceed.'}
        </p>
      </div>
    )
  }

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="flex-grow max-w-[800px] mx-auto px-6 py-16 text-center font-sans select-none">
        <h1 className="text-xl font-extrabold text-slate-800 mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-slate-500 text-xs mb-6">Explore the parts catalogs and add parts to get started.</p>
        <Link to="/">
          <Button className="bg-[#4bc0db] hover:bg-[#39a9c4] text-white font-extrabold px-8 py-2">
            BACK TO CATALOGS
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-grow font-sans bg-slate-50/50 pb-16">
      {/* Checkout Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium select-none">
        <Link to="/" className="hover:text-amber-600 flex items-center">
          <Home className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600" />
        </Link>
        <span>•</span>
        <span className="hover:text-amber-500 cursor-pointer">Cart</span>
        <span>•</span>
        <span>Shipping</span>
        <span>•</span>
        <span>Payment</span>
        <span>•</span>
        <span className="text-[#33b5e5] font-extrabold uppercase">Confirm</span>
        <span>•</span>
        <span className="text-slate-400">Success</span>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        
        {/* Step Title Header */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <CheckCircle2 className="w-6 h-6 text-[#5cb85c]" />
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">Confirmation</h1>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: Order Items, Address inputs, shipping types, Card form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. PRODUCT SUMMARY TABLE */}
            <div className="bg-white dark:bg-[#0A110C] border border-border/80 rounded shadow-sm overflow-hidden select-none">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-[#0D1810] text-slate-500 dark:text-[#7A9A80] font-bold uppercase">
                  <TableRow className="hover:bg-transparent border-b border-border/80 border-none">
                    <TableHead className="px-4 py-3 text-[11px] font-bold">Number</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold">Name</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold">Brand</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold">Processing, days</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold text-right">Price</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold text-center">Qty</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold text-right">Sum</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-slate-700 dark:text-[#C5DEC8] font-medium">
                  {items.map((item) => {
                    const priceNum = parseFloat(item.part.price.replace(/[^0-9.]/g, '')) || 0
                    const itemSum = priceNum * item.quantity
                    return (
                      <TableRow key={item.part.partNumber} className="border-b border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <TableCell className="px-4 py-3.5 font-mono text-[10px] font-bold text-slate-900 dark:text-white">
                          {item.part.partNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-xs text-slate-800 dark:text-white font-bold uppercase">
                          {item.part.name}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 font-semibold text-slate-500 dark:text-[#7A9A80]">
                          {item.part.supplier?.toUpperCase() || 'GENUINE'}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-slate-400 dark:text-[#4A6B50]">2-3</TableCell>
                        <TableCell className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-white">${priceNum.toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-3.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.part, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 bg-white dark:bg-[#111C14] border border-slate-300 dark:border-slate-800 rounded px-1.5 py-0.5 text-center text-xs text-slate-800 dark:text-white focus:outline-none focus:border-sky-500"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right font-black text-[#00C853] dark:text-[#39FF88]">${itemSum.toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.part)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* 2. SHIPPING METHODS SELECTOR */}
            <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Available Shipping Methods
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
                <label className={`border rounded p-4 flex flex-col justify-between cursor-pointer transition-colors ${shippingMethod === 'ems' ? 'border-[#33b5e5] bg-sky-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="flex items-start gap-2.5">
                    <input type="radio" name="shipping" checked={shippingMethod === 'ems'} onChange={() => setShippingMethod('ems')} className="mt-1" />
                    <div>
                      <span className="text-sm font-black text-slate-800 block">$15.00</span>
                      <span className="text-[10px] font-bold text-[#e65100] uppercase block mt-0.5">EMS SHIPPING</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">Delivery in 10-20 days</span>
                </label>

                <label className={`border rounded p-4 flex flex-col justify-between cursor-pointer transition-colors ${shippingMethod === 'dhl' ? 'border-[#33b5e5] bg-sky-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="flex items-start gap-2.5">
                    <input type="radio" name="shipping" checked={shippingMethod === 'dhl'} onChange={() => setShippingMethod('dhl')} className="mt-1" />
                    <div>
                      <span className="text-sm font-black text-slate-800 block">$35.00</span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase block mt-0.5">DHL EXPRESS</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">Delivery in 3-7 days</span>
                </label>

                <label className={`border rounded p-4 flex flex-col justify-between cursor-pointer transition-colors ${shippingMethod === 'fedex' ? 'border-[#33b5e5] bg-sky-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="flex items-start gap-2.5">
                    <input type="radio" name="shipping" checked={shippingMethod === 'fedex'} onChange={() => setShippingMethod('fedex')} className="mt-1" />
                    <div>
                      <span className="text-sm font-black text-slate-800 block">$45.00</span>
                      <span className="text-[10px] font-bold text-blue-700 uppercase block mt-0.5">FEDEX WORLDWIDE</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">Delivery in 3-7 days</span>
                </label>
              </div>
            </div>

            {/* 3. ADDRESS FORMS: SHIP TO & BILL TO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SHIP TO CARD */}
              <div className="bg-white border border-slate-200 rounded shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ship To</h3>
                  <button type="button" className="text-[10px] font-extrabold text-sky-600 hover:underline">Edit Profile</button>
                </div>
                <div className="p-5 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Receiver Name"
                      value={delivery.fullName}
                      onChange={(e) => setDelivery(d => ({ ...d, fullName: e.target.value }))}
                      className="h-9 text-xs text-slate-800 font-semibold border-slate-300 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">County / State</label>
                      <Input
                        type="text"
                        placeholder="Nairobi"
                        value={delivery.county}
                        onChange={(e) => setDelivery(d => ({ ...d, county: e.target.value }))}
                        className="h-9 text-xs text-slate-800 font-semibold border-slate-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">City / Region</label>
                      <Input
                        type="text"
                        placeholder="Nairobi City"
                        value={delivery.city}
                        onChange={(e) => setDelivery(d => ({ ...d, city: e.target.value }))}
                        className="h-9 text-xs text-slate-800 font-semibold border-slate-300 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Postal Code</label>
                      <Input
                        type="text"
                        placeholder="00100"
                        value={delivery.postalCode}
                        onChange={(e) => setDelivery(d => ({ ...d, postalCode: e.target.value }))}
                        className="h-9 text-xs text-slate-800 font-semibold border-slate-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                      <Input
                        type="text"
                        placeholder="254700000000"
                        value={delivery.phone}
                        onChange={(e) => setDelivery(d => ({ ...d, phone: e.target.value }))}
                        className="h-9 text-xs text-slate-800 font-semibold border-slate-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BILL TO CARD */}
              <div className="bg-white border border-slate-200 rounded shadow-sm opacity-90">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Bill To</h3>
                  <span className="text-[9px] font-extrabold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Same as shipping</span>
                </div>
                <div className="p-5 space-y-3.5 bg-slate-50/50 select-none">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing Name</label>
                    <Input disabled value={delivery.fullName || 'Fredie Obiero'} className="h-9 text-xs text-slate-500 bg-slate-100/50 border-slate-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing County</label>
                      <Input disabled value={delivery.county || 'Nairobi'} className="h-9 text-xs text-slate-500 bg-slate-100/50 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing City</label>
                      <Input disabled value={delivery.city || 'Nairobi City'} className="h-9 text-xs text-slate-500 bg-slate-100/50 border-slate-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Postal Code</label>
                      <Input disabled value={delivery.postalCode || '00100'} className="h-9 text-xs text-slate-500 bg-slate-100/50 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                      <Input disabled value={delivery.phone || '254700000000'} className="h-9 text-xs text-slate-500 bg-slate-100/50 border-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 4. TERMS AND CONDITIONS AND DUMMY CARD PAYMENT FORM */}
            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
              <label className="flex items-center gap-2 mb-6 cursor-pointer select-none text-xs font-bold text-slate-600 hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked)
                    setError('')
                  }}
                  className="rounded text-[#33b5e5] focus:ring-[#33b5e5] w-4 h-4"
                />
                I accept the <span className="text-[#33b5e5] underline hover:text-[#2892b9]">terms and conditions</span>
              </label>

              {/* PAYMENT METHOD SELECTOR */}
              <div className="border-t border-slate-100 pt-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div
                    onClick={() => setPaymentMethod('stripe')}
                    className={`border rounded p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'border-[#33b5e5] bg-sky-50/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-[#33b5e5]' : 'border-slate-300'}`}>
                      {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-[#33b5e5]" />}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Credit / Debit Card</span>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">Pay securely via Stripe</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`border rounded p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      paymentMethod === 'mpesa'
                        ? 'border-[#33b5e5] bg-sky-50/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'mpesa' ? 'border-[#33b5e5]' : 'border-slate-300'}`}>
                      {paymentMethod === 'mpesa' && <div className="w-2.5 h-2.5 rounded-full bg-[#33b5e5]" />}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">M-Pesa Mobile Money</span>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">Pay instantly via M-Pesa STK Push</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'stripe' ? (
                  <div className="space-y-4 max-w-md">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      Stripe Checkout Guarantee
                    </h3>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Card Number</label>
                      <Input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="1234 5678 1234 5678"
                        className="h-9 text-xs font-mono font-bold tracking-wider"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expiry Date</label>
                        <Input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="h-9 text-xs font-mono font-bold tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CVV / CVN</label>
                        <Input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          className="h-9 text-xs font-mono font-bold tracking-wider"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      * By clicking "PAY WITH STRIPE" below, you will be redirected to the secure Stripe Checkout gateway to complete your payment transaction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                      M-Pesa Express Checkout
                    </h3>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">M-Pesa Phone Number</label>
                      <Input
                        type="text"
                        placeholder="254700000000"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="h-9 text-xs font-bold tracking-wider border-slate-300 outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                        Format: Starting with 254 (e.g. 254712345678). If left blank, receiver phone number ({delivery.phone || 'not set'}) will be used.
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      * By clicking "PAY WITH M-PESA" below, an M-Pesa STK push prompt will be sent to your phone. Enter your MPESA PIN to authorize.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT 1 COL: Summary sidebar (sticky) */}
          <div>
            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm sticky top-[100px] space-y-5">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-xs font-semibold select-none">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Items ({items.length} parts)</span>
                  <span className="font-bold text-slate-700">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Shipping Cost ({shippingMethod.toUpperCase()})</span>
                  <span className="font-bold text-slate-700">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-100 pb-4">
                  <span>Mock Weight</span>
                  <span>{items.length * 1} kg</span>
                </div>
                
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-black text-slate-800">Total</span>
                  <span className="text-xl font-black text-sky-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

              <Button
                type="submit"
                disabled={placing || !termsAccepted}
                className="w-full bg-[#33b5e5] hover:bg-[#2892b9] text-white font-extrabold h-11 flex items-center justify-center gap-2 rounded border-0 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    PROCESSING ORDER...
                  </>
                ) : paymentMethod === 'stripe' ? (
                  'PAY WITH STRIPE'
                ) : (
                  'PAY WITH M-PESA'
                )}
              </Button>
            </div>
          </div>

        </form>

      </div>
    </div>
  )
}