import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/api/userApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation('auth')
  const token = searchParams.get('token')

  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    if (!token) return
    setApiError('')
    try {
      await userApi.resetPassword({ token, password: values.password, confirmPassword: values.confirmPassword })
      navigate('/login', { state: { passwordReset: true } })
    } catch {
      setApiError(t('reset_error'))
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 grid place-items-center mx-auto mb-5">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <h2 className="text-[#07110A] dark:text-white text-2xl font-extrabold font-display mb-2">{t('reset_invalid_title')}</h2>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-6">
          {t('reset_invalid_text')}
        </p>
        <Link to="/forgot-password" className="text-[#00C853] hover:text-[#39FF88] text-sm font-medium transition-colors">
          {t('reset_request_new')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col items-center justify-center px-6 py-12">
      <Link to="/" className="mb-10">
        <img src="/images/logo.png" alt="Africa Autopart" className="w-40 h-auto" />
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">{t('reset_heading')}</h1>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
            {t('reset_subheading')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('reset_password_label')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('reset_password_placeholder')}
              {...register('password')}
              className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{t('reset_confirm_label')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('reset_confirm_placeholder')}
              {...register('confirmPassword')}
              className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
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
            {isSubmitting ? t('reset_submitting') : t('reset_submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
