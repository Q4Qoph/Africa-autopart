import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/api/userApi'
import { UserRole } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

const features = [
  { icon: '🌍', text: '18 countries across Africa & Saudi Arabia' },
  { icon: '🏭', text: '1,240+ verified parts suppliers' },
  { icon: '⚡', text: 'Get quotes in under 42 minutes' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      const { data } = await userApi.login(values)
      login(data)
      if (data.role === UserRole.Admin) navigate('/admin')
      else if (data.role === UserRole.Supplier) navigate('/supplier/dashboard')
      else navigate('/dashboard')
    } catch {
      setApiError('Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen bg-[#07110A] flex flex-col md:flex-row">
      {/* Left — brand panel */}
      <div className="hidden md:flex md:w-[45%] lg:w-[42%] relative flex-col justify-between p-10 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(0,200,83,0.18),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,200,83,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.6) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-sm shadow-lg shadow-[#00C853]/20">
            AA
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Africa Autopart</span>
        </Link>

        {/* Main content */}
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            <span className="block w-5 h-px bg-[#00C853]" />
            Cross-border sourcing
          </p>
          <h2 className="text-4xl font-extrabold text-white font-display leading-tight mb-4">
            Source any part,<br />
            <span className="text-[#00C853]">anywhere in Africa</span>
          </h2>
          <p className="text-[#7A9A80] text-sm leading-relaxed mb-8 max-w-[320px]">
            Connect with verified suppliers across the continent and get competitive quotes fast.
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-[#C5DEC8] text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.18)] rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-[#00C853] text-xs font-mono">96.8% delivery success rate</span>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
            AA
          </div>
          <span className="text-white font-bold text-base">Africa Autopart</span>
        </Link>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white font-display mb-2">Welcome back</h1>
            <p className="text-[#7A9A80] text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#E8F0E9] text-sm">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#E8F0E9] text-sm">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[#7A9A80] hover:text-[#00C853] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-[#111C14] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
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
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center">
            <p className="text-sm text-[#7A9A80]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#00C853] hover:text-[#39FF88] font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
