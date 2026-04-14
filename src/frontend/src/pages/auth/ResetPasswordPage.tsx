import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
      setApiError('Failed to reset password. Your link may have expired.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 grid place-items-center mx-auto mb-5">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <h2 className="text-[#07110A] dark:text-white text-2xl font-extrabold font-display mb-2">Invalid reset link</h2>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password" className="text-[#00C853] hover:text-[#39FF88] text-sm font-medium transition-colors">
          Request a new link
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
          <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">Set your password</h1>
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
            Choose a secure password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              {...register('password')}
              className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
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
            {isSubmitting ? 'Setting password…' : 'Set Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
