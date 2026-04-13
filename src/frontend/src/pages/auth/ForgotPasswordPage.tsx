import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userApi } from '@/api/userApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      await userApi.forgotPassword(values)
      setSent(true)
    } catch {
      setApiError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] flex flex-col items-center justify-center px-6 py-12">
      <Link to="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C853] to-[#00933C] grid place-items-center font-extrabold text-[#07110A] text-xs">
          AA
        </div>
        <span className="text-[#07110A] dark:text-white font-bold text-base">Africa Autopart</span>
      </Link>

      <div className="w-full max-w-[400px]">
        {sent ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-[#00C853]/15 border border-[#00C853]/30 grid place-items-center mx-auto mb-5">
              <span className="text-[#00C853] text-3xl">✓</span>
            </div>
            <h2 className="text-[#07110A] dark:text-white text-2xl font-extrabold font-display mb-2">Check your inbox</h2>
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm max-w-[280px] mx-auto leading-relaxed">
              We've sent a password reset link to your email. Follow the link to set your password.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-sm text-[#00C853] hover:text-[#39FF88] font-medium transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display mb-2">Forgot password?</h1>
              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#07110A] dark:text-[#E8F0E9] text-sm">Email address</Label>
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
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.06)] text-center">
              <Link to="/login" className="text-sm text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#00C853] transition-colors">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
