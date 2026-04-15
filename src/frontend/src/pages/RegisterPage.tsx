import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/api/userApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const perks = [
    { icon: '🌍', text: t('register_perk1') },
    { icon: '⚡', text: t('register_perk2') },
    { icon: '✅', text: t('register_perk3') },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      await userApi.register(values)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setApiError(t('register_error'))
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col md:flex-row">
      {/* Left — brand panel */}
      <div className="hidden md:flex md:w-[40%] lg:w-[38%] relative flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(0,200,83,0.18),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,200,83,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.6) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link to="/" className="relative">
          <img src="/images/logo.png" alt="Africa Autopart" className="w-44 h-auto" />
        </Link>

        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-4">
            <span className="block w-5 h-px bg-[#00C853]" />
            {t('register_eyebrow')}
          </p>
          <h2 className="text-4xl font-extrabold text-[#07110A] dark:text-white font-display leading-tight mb-4">
            {t('register_headline')}<br />
            <span className="text-[#00C853]">{t('register_headline_accent')}</span>
          </h2>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm leading-relaxed mb-8 max-w-[300px]">
            {t('register_subtext')}
          </p>

          <div className="space-y-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] grid place-items-center text-base flex-shrink-0">
                  {p.icon}
                </div>
                <span className="text-[#4A6B50] dark:text-[#C5DEC8] text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.18)] rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-[#00C853] text-xs font-mono">{t('register_badge')}</span>
          </div>
          <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
            {t('register_are_supplier')}{' '}
            <Link to="/become-supplier" className="text-[#00C853] hover:underline">
              {t('register_supplier_link')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 md:hidden">
          <img src="/images/logo.png" alt="Africa Autopart" className="w-36 h-auto" />
        </Link>

        <div className="w-full max-w-[420px]">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[#00C853]/15 border border-[#00C853]/30 grid place-items-center mx-auto mb-5">
                <span className="text-[#00C853] text-3xl">✓</span>
              </div>
              <h2 className="text-[#07110A] dark:text-white text-2xl font-extrabold font-display mb-2">{t('register_success_heading')}</h2>
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('register_success_subtext')}</p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">{t('register_heading')}</h1>
                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                  {t('register_subheading')}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('register_firstname_label')}</Label>
                    <Input
                      id="firstName"
                      placeholder={t('register_firstname_placeholder')}
                      {...register('firstName')}
                      className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('register_lastname_label')}</Label>
                    <Input
                      id="lastName"
                      placeholder={t('register_lastname_placeholder')}
                      {...register('lastName')}
                      className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('register_email_label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('register_phone_label')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('register_phone_placeholder')}
                    {...register('phone')}
                    className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('register_password_label')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('register_password_placeholder')}
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
                  {isSubmitting ? t('register_submitting') : t('register_submit')}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] space-y-3 text-center">
                <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">
                  {t('register_already_have')}{' '}
                  <Link to="/login" className="text-[#00C853] hover:text-[#39FF88] font-medium transition-colors">
                    {t('register_sign_in')}
                  </Link>
                </p>
                <p className="text-xs text-[#7A9A80] dark:text-[#3D5942]">
                  {t('register_are_supplier')}{' '}
                  <Link to="/become-supplier" className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#00C853] transition-colors">
                    {t('register_supplier_link')}
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
