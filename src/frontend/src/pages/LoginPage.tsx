import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
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

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const [apiError, setApiError] = useState('')

  const features = [
    { icon: '🌍', text: t('login_feat1') },
    { icon: '🏭', text: t('login_feat2') },
    { icon: '⚡', text: t('login_feat3') },
  ]

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
      setApiError(t('login_error'))
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col md:flex-row">
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
        <Link to="/" className="relative">
          <img src="/images/logo.png" alt="Africa Autopart" className="w-44 h-auto" />
        </Link>

        {/* Main content */}
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            <span className="block w-5 h-px bg-[#00C853]" />
            {t('login_eyebrow')}
          </p>
          <h2 className="text-4xl font-extrabold text-[#07110A] dark:text-white font-display leading-tight mb-4">
            {t('login_headline')}<br />
            <span className="text-[#00C853]">{t('login_headline_accent')}</span>
          </h2>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed mb-8 max-w-[320px]">
            {t('login_subtext')}
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-[#4A6B50] dark:text-[#C5DEC8] text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.18)] rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-[#00C853] text-xs font-mono">{t('login_badge')}</span>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12">
        {/* Mobile logo */}
        <Link to="/" className="mb-10 md:hidden">
          <img src="/images/logo.png" alt="Africa Autopart" className="w-36 h-auto" />
        </Link>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">{t('login_heading')}</h1>
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('login_subheading')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('login_email_label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login_email_placeholder')}
                {...register('email')}
                className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('login_password_label')}</Label>
                <Link to="/forgot-password" className="text-xs text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#00C853] transition-colors">
                  {t('login_forgot_password')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
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
              {isSubmitting ? t('login_submitting') : t('login_submit')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] text-center">
            <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">
              {t('login_no_account')}{' '}
              <Link to="/register" className="text-[#00C853] hover:text-[#39FF88] font-medium transition-colors">
                {t('login_create_free')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
