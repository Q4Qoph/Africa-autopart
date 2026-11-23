import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CreditCard, Loader2, Trash2 } from 'lucide-react'
import { orderApi } from '@/api/orderApi'
import { paymentApi } from '@/api/paymentApi'
import { userApi } from '@/api/userApi'
import { PartImage } from '@/components/catalog/PartImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useExternalCart } from '@/context/ExternalCartContext'
import { parseCheckoutPrice } from '@/lib/checkoutPrice'
import type { AddNewOrderDTO } from '@/types/order'

const deliveryFields = [
  { name: 'city', label: 'City or region', autoComplete: 'shipping address-level2' },
  { name: 'county', label: 'County or state', autoComplete: 'shipping address-level1' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'shipping postal-code' },
] as const

const panelClass = 'rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6'

function formatMpesaPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return /^[071]/.test(digits) ? `254${digits.replace(/^0/, '')}` : digits
}

export default function CartExternalPage() {
  const { auth, login } = useAuth()
  const { t } = useTranslation('search')
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useExternalCart()
  const [delivery, setDelivery] = useState({ city: '', county: '', postalCode: '' })
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [placing, setPlacing] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [error, setError] = useState('')
  const pendingOrder = useRef<{ payload: string; id: number } | null>(null)

  const lines = items.map(item => {
    const price = parseCheckoutPrice(item.part.price)
    return { ...item, price: Number.isFinite(price) && price > 0 ? price : null }
  })
  const hasInvalidPrice = lines.some(line => line.price === null)
  const hasEstimatedPrice = lines.some(line => line.part.isEstimated)
  const subtotal = lines.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0)
  const isStripe = paymentMethod === 'stripe'

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!lines.length || hasInvalidPrice || placing) return

    const fields = new FormData(event.currentTarget)

    const phone = isStripe ? '' : formatMpesaPhone(mpesaPhone)
    if (!isStripe && !/^254[17]\d{8}$/.test(phone)) {
      setError('Enter a valid Kenyan mobile number for M-Pesa.')
      return
    }

    setPlacing(true)
    setError('')
    setSignInError('')

    let customer = auth
    if (!customer) {
      try {
        const { data } = await userApi.login({
          email: String(fields.get('email') ?? '').trim(),
          password: String(fields.get('password') ?? ''),
        })
        customer = data
        login(data)
      } catch {
        setSignInError('We couldn’t sign you in. Check your email and password and try again.')
        setPlacing(false)
        return
      }
    }

    const order: AddNewOrderDTO = {
      userId: customer.userId,
      items: lines.flatMap(({ part, price, quantity }) => price === null ? [] : [{
        partNumber: part.partNumber,
        name: part.name,
        description: part.supplier || 'Genuine OEM Part',
        price,
        quantity,
      }]),
      shipping: {
        city: delivery.city.trim(),
        county: delivery.county.trim(),
        postalCode: delivery.postalCode.trim(),
      },
    }

    try {
      const payload = JSON.stringify(order)
      if (pendingOrder.current?.payload !== payload) {
        const { data } = await orderApi.createNewOrder(order, customer.token)
        if (!data.orderId) throw new Error('Missing order ID')
        pendingOrder.current = { payload, id: data.orderId }
      }
      const orderId = pendingOrder.current.id

      if (isStripe) {
        const { data } = await paymentApi.addNewPayment({ orderId }, customer.token)
        if (!data.stripeSessionId || !data.url) throw new Error('Missing Stripe checkout session')

        sessionStorage.setItem('pendingStripeSessionId', data.stripeSessionId)
        sessionStorage.setItem('pendingOrderId', String(orderId))
        sessionStorage.setItem('isNewOrder', 'true')
        clearCart()
        window.location.assign(data.url)
      } else {
        const { data } = await paymentApi.initiateNewStkPush(orderId, phone, customer.token)
        if (!data.isSuccessful) {
          setError(data.customerMessage || 'M-Pesa could not send a payment prompt. Please try again.')
          setPlacing(false)
          return
        }

        sessionStorage.setItem('isNewOrder', 'true')
        clearCart()
        navigate(`/orders/mpesa-status/${orderId}`)
      }
    } catch {
      setError(`We couldn’t start ${isStripe ? 'Stripe' : 'M-Pesa'} checkout. Your items are still in your cart. Please try again.`)
      setPlacing(false)
    }
  }

  if (!items.length) {
    return (
      <section className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button nativeButton={false} render={<Link to="/shop" />} className="mt-5">Browse parts</Button>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 lg:pt-12">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        Continue shopping
      </Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={handleCheckout} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className={panelClass} aria-labelledby="checkout-items">
            <h2 id="checkout-items" className="text-lg font-semibold">Your items</h2>
            <ul className="mt-2 divide-y divide-border">
              {lines.map(({ part, price, quantity }) => (
                <li key={JSON.stringify([part.partNumber, part.supplier, part.price, Boolean(part.isEstimated)])}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 py-4 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] sm:items-center">
                  <PartImage src={part.imageURL} alt="" className="size-12 rounded-md border border-border bg-white object-contain sm:size-14" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{part.name}</p>
                    <p className="break-words text-xs text-muted-foreground">{[part.supplier, part.partNumber].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="text-end text-sm sm:col-start-4 sm:row-start-1">
                    <span className="font-semibold">{price === null ? 'Unavailable' : `$${(price * quantity).toFixed(2)}`}</span>
                    {quantity > 1 && price !== null && <p className="text-xs text-muted-foreground">${price.toFixed(2)} each</p>}
                  </div>
                  <div className="col-span-2 col-start-2 flex items-center gap-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Qty
                      <Input type="number" min="1" step="1" value={quantity} disabled={placing}
                        aria-label={`Quantity for ${part.name} (${part.partNumber})`}
                        onChange={event => updateQuantity(part, Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                        className="h-9 w-14 px-2 text-sm" />
                    </label>
                    <Button type="button" variant="ghost" size="icon" disabled={placing}
                      aria-label={`Remove ${part.name} (${part.partNumber})`} onClick={() => removeItem(part)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {!auth && (
            <fieldset disabled={placing} className={panelClass} aria-labelledby="checkout-account">
              <h2 id="checkout-account" className="text-lg font-semibold">Sign in to check out</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Email (required)
                  <Input type="email" name="email" autoComplete="username" required className="h-11" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Password (required)
                  <Input type="password" name="password" autoComplete="current-password" required className="h-11" />
                </label>
              </div>
              {signInError && <p role="alert" className="mt-3 text-sm text-destructive">{signInError}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link to="/forgot-password" className="underline underline-offset-2">Forgot password?</Link>
                <Link to="/register?returnTo=/cart" className="underline underline-offset-2">Create an account</Link>
              </div>
            </fieldset>
          )}

          <fieldset disabled={placing} className={panelClass} aria-labelledby="checkout-delivery">
            <h2 id="checkout-delivery" className="text-lg font-semibold">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {deliveryFields.map(({ name, label, autoComplete }) => (
                <label key={name} className="grid gap-1.5 text-sm font-medium">
                  {label} (required)
                  <Input name={name} autoComplete={autoComplete} required pattern={'.*\\S.*'}
                    value={delivery[name]} className="h-11"
                    onChange={event => setDelivery(current => ({ ...current, [name]: event.target.value }))} />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={placing} className={panelClass} aria-labelledby="checkout-payment">
            <h2 id="checkout-payment" className="text-lg font-semibold">Payment method</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(['stripe', 'mpesa'] as const).map(method => (
                <label key={method} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-muted">
                  <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method}
                    onChange={() => { setPaymentMethod(method); setError('') }} className="accent-primary" />
                  {method === 'stripe' ? 'Card via Stripe' : 'M-Pesa'}
                </label>
              ))}
            </div>
            {isStripe ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="size-4 shrink-0" aria-hidden="true" />
                Review the final amount and enter your card details on Stripe.
              </p>
            ) : (
              <label className="mt-4 grid max-w-xs gap-1.5 text-sm font-medium">
                M-Pesa phone number (required)
                <Input type="tel" name="mpesaPhone" autoComplete="tel" placeholder="0712 345 678" required
                  value={mpesaPhone} onChange={event => { setMpesaPhone(event.target.value); setError('') }} className="h-11" />
              </label>
            )}
          </fieldset>
        </div>

        <section className={`${panelClass} lg:sticky lg:top-24`} aria-labelledby="checkout-summary">
          <h2 id="checkout-summary" className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <dt className="text-sm font-medium">{hasEstimatedPrice ? 'Estimated items subtotal' : 'Items subtotal'}</dt>
            <dd className="text-xl font-semibold tabular-nums">{hasInvalidPrice ? 'Unavailable' : `$${subtotal.toFixed(2)}`}</dd>
          </dl>
          {hasEstimatedPrice && <p className="mt-1 text-xs italic text-muted-foreground">{t('estimateNote')}</p>}
          {hasInvalidPrice && <p role="alert" className="mt-3 text-sm text-destructive">Remove items with unavailable prices to continue.</p>}
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={placing || hasInvalidPrice} size="lg" className="mt-5 h-11 w-full">
            {placing && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {placing
              ? (!auth ? 'Signing in…' : isStripe ? 'Opening Stripe…' : 'Sending M-Pesa prompt…')
              : isStripe
                ? (auth ? 'Continue to Stripe' : 'Sign in and continue to Stripe')
                : (auth ? 'Pay with M-Pesa' : 'Sign in and pay with M-Pesa')}
          </Button>
        </section>
      </form>
    </section>
  )
}
