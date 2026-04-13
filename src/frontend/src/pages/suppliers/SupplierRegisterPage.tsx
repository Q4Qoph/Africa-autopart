import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supplierApi } from '@/api/supplierApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
})

type FormValues = z.infer<typeof schema>

const categoryOptions = [
  'Brakes & Suspension',
  'Engine & Drivetrain',
  'Electrical & Lighting',
  'Body & Exterior',
  'Interior & Accessories',
  'Tyres & Wheels',
  'Cooling & Exhaust',
  'Transmission',
  'General / Multi-category',
]

const benefits = [
  { icon: '📦', title: 'List unlimited parts', desc: 'Add your entire inventory — no listing fees' },
  { icon: '🌍', title: 'Reach buyers in 18 countries', desc: 'Access demand across Africa & Saudi Arabia' },
  { icon: '⚡', title: 'Get matched to live RFQs', desc: 'Respond to buyer requests in real time' },
  { icon: '🔒', title: 'Verified supplier badge', desc: 'Build trust with verified status' },
]

export default function SupplierRegisterPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      await supplierApi.add({ ...values, parts: [] })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setApiError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col md:flex-row">
      {/* Left — brand panel */}
      <div className="hidden md:flex md:w-[45%] lg:w-[42%] relative flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_15%_50%,rgba(0,200,83,0.2),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,200,83,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.6) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-sm shadow-lg shadow-[#00C853]/20">
            AA
          </div>
          <span className="text-[#07110A] dark:text-white font-bold text-lg tracking-tight">Africa Autopart</span>
        </Link>

        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            <span className="block w-5 h-px bg-[#00C853]" />
            Supplier Network
          </p>
          <h2 className="text-4xl font-extrabold text-[#07110A] dark:text-white font-display leading-tight mb-4">
            Grow your business<br />
            <span className="text-[#00C853]">across borders</span>
          </h2>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed mb-8 max-w-[320px]">
            Join 1,240+ verified suppliers already fulfilling orders for buyers across Africa and Saudi Arabia.
          </p>

          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center text-base flex-shrink-0 mt-0.5">
                  {b.icon}
                </div>
                <div>
                  <p className="text-[#4A6B50] dark:text-[#C5DEC8] text-sm font-medium">{b.title}</p>
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.18)] rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-[#00C853] text-xs font-mono">Reviewed within 24–48 hours</span>
          </div>
          <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
            Looking to buy parts?{' '}
            <Link to="/register" className="text-[#00C853] hover:underline">
              Create a buyer account →
            </Link>
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-8 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
            AA
          </div>
          <span className="text-[#07110A] dark:text-white font-bold text-base">Africa Autopart</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[#00C853]/15 border border-[#00C853]/30 grid place-items-center mx-auto mb-5">
                <span className="text-[#00C853] text-3xl">✓</span>
              </div>
              <h2 className="text-[#07110A] dark:text-white text-2xl font-extrabold font-display mb-2">Application submitted!</h2>
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm max-w-[300px] mx-auto leading-relaxed">
                Our team will review your business within 24–48 hours. Once approved, you'll receive an email with a link to set your password and access your dashboard.
              </p>
              <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-4">Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">Register as Supplier</h1>
                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                  Tell us about your business. Our team reviews every application.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Business name *</Label>
                  <Input
                    id="businessName"
                    placeholder="Precision Auto Parts Ltd"
                    {...register('businessName')}
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                  />
                  {errors.businessName && (
                    <p className="text-red-400 text-xs">{errors.businessName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Parts category *</Label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full h-11 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm"
                  >
                    <option value="">Select a category…</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-400 text-xs">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">
                    About your business <span className="text-[#7A9A80] dark:text-[#3D5942]">(optional)</span>
                  </Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Describe what you supply, regions you cover, years in business…"
                    {...register('description')}
                    className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:outline-none focus:border-[#00C853] text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Business email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@yourbusiness.com"
                    {...register('email')}
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Business phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    {...register('phone')}
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs">{errors.phone.message}</p>
                  )}
                </div>

                <div className="bg-amber-400/05 border border-amber-400/20 rounded-lg px-4 py-3">
                  <p className="text-amber-400 text-xs leading-relaxed">
                    <span className="font-semibold">Review process:</span> Supplier accounts are manually reviewed before activation. You can add your parts inventory after your account is approved.
                  </p>
                </div>

                {apiError && (
                  <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                    {apiError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-11 text-sm"
                >
                  {isSubmitting ? 'Submitting application…' : 'Submit Application'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] space-y-3 text-center">
                <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#00C853] hover:text-[#39FF88] font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-[#7A9A80] dark:text-[#3D5942]">
                  Looking to buy parts?{' '}
                  <Link to="/register" className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#00C853] transition-colors">
                    Create a buyer account →
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
