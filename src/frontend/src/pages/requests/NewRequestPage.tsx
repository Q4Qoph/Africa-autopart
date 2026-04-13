import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { imageApi } from '@/api/imageApi'
import { ConditionPreference, Urgency } from '@/types/request'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  vehicleMake: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  year: z.string().min(4, 'Enter a valid year'),
  engineType: z.string(),
  chassisNumber: z.string(),
  partName: z.string().min(1, 'Part name is required'),
  partNumber: z.string(),
  description: z.string(),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(7, 'Phone is required'),
  email: z.string().email('Invalid email'),
})

type FormValues = z.infer<typeof schema>

const conditionOptions = [
  { value: ConditionPreference.AnyCondition, label: 'Any Condition' },
  { value: ConditionPreference.OEM, label: 'OEM' },
  { value: ConditionPreference.Aftermarket, label: 'Aftermarket' },
  { value: ConditionPreference.Second_Hand, label: 'Second Hand' },
  { value: ConditionPreference.Open_To_All, label: 'Open to All' },
]

const urgencyOptions = [
  { value: Urgency.Standard, label: 'Standard — flexible timeline' },
  { value: Urgency.Express, label: 'Express — within a few days' },
  { value: Urgency.Urgent, label: 'Urgent — as soon as possible' },
]

const fieldClass =
  'bg-[#EFF7F1] dark:bg-[#162019] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11'
const selectClass =
  'w-full h-11 px-3 rounded-lg bg-[#EFF7F1] dark:bg-[#162019] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm'

export default function NewRequestPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state as { year?: string; make?: string; partName?: string } | null

  const [condition, setCondition] = useState<number>(ConditionPreference.AnyCondition)
  const [urgency, setUrgency] = useState<number>(Urgency.Standard)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleMake: prefill?.make ?? '',
      year: prefill?.year ?? '',
      partName: prefill?.partName ?? '',
    },
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => imageApi.upload(f).then((r) => r.data)))
      setUploadedImages((prev) => [...prev, ...urls])
    } catch {
      setApiError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      await requestApi.create(
        {
          ...values,
          conditionPreference: condition as typeof ConditionPreference[keyof typeof ConditionPreference],
          urgency: urgency as typeof Urgency[keyof typeof Urgency],
          dateCreated: new Date().toISOString(),
          userId: auth?.userId ?? 0,
          partImages: uploadedImages.map((url) => ({ imageUrl: url })),
        },
        auth?.token,
      )
      navigate(auth ? '/requests' : '/')
    } catch {
      setApiError('Failed to submit request. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px]">
        <div className="max-w-[860px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link to={auth ? '/requests' : '/'} className="text-[#4A6B50] dark:text-[#7A9A80] text-xs hover:text-[#07110A] dark:hover:text-white mb-4 inline-block">
              ← {auth ? 'Back to Requests' : 'Back to Home'}
            </Link>
            <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
              <span className="block w-6 h-px bg-[#00C853]" />
              New Request
            </p>
            <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">Request a Part</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Vehicle */}
            <Section title="Vehicle Details" step="01">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Make *" error={errors.vehicleMake?.message}>
                  <Input {...register('vehicleMake')} placeholder="Toyota" className={fieldClass} />
                </Field>
                <Field label="Model *" error={errors.model?.message}>
                  <Input {...register('model')} placeholder="Hilux" className={fieldClass} />
                </Field>
                <Field label="Year *" error={errors.year?.message}>
                  <Input {...register('year')} placeholder="2021" className={fieldClass} />
                </Field>
                <Field label="Engine Type" error={errors.engineType?.message}>
                  <Input {...register('engineType')} placeholder="2.4L Diesel" className={fieldClass} />
                </Field>
                <Field label="Chassis / VIN Number" error={errors.chassisNumber?.message} className="sm:col-span-2">
                  <Input {...register('chassisNumber')} placeholder="JTFHX02P900XXXXX" className={fieldClass} />
                </Field>
              </div>
            </Section>

            {/* Section 2: Part */}
            <Section title="Part Details" step="02">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Part Name *" error={errors.partName?.message} className="sm:col-span-2">
                  <Input {...register('partName')} placeholder="Front brake pad set" className={fieldClass} />
                </Field>
                <Field label="Part Number" error={errors.partNumber?.message}>
                  <Input {...register('partNumber')} placeholder="04465-0K260" className={fieldClass} />
                </Field>
                <Field label="Condition Preference">
                  <select
                    value={condition}
                    onChange={(e) => setCondition(Number(e.target.value))}
                    className={selectClass}
                  >
                    {conditionOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Urgency" className="sm:col-span-2">
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className={selectClass}
                  >
                    {urgencyOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Additional details about the part or condition…"
                    className={cn(
                      fieldClass,
                      'h-auto px-3 py-2.5 rounded-lg border w-full resize-none',
                    )}
                  />
                </Field>
              </div>
            </Section>

            {/* Section 3: Contact & Delivery */}
            <Section title="Delivery & Contact" step="03">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Country *" error={errors.country?.message}>
                  <Input {...register('country')} placeholder="Kenya" className={fieldClass} />
                </Field>
                <Field label="Phone *" error={errors.phone?.message}>
                  <Input {...register('phone')} type="tel" placeholder="+254 700 000 000" className={fieldClass} />
                </Field>
                <Field label="Email *" error={errors.email?.message} className="sm:col-span-2">
                  <Input {...register('email')} type="email" placeholder="you@example.com" className={fieldClass} />
                </Field>
              </div>
            </Section>

            {/* Section 4: Images */}
            <Section title="Supporting Images" step="04">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
                <div className="border-2 border-dashed border-[rgba(0,200,83,0.25)] rounded-xl p-8 text-center hover:border-[#00C853] transition-colors">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {uploading ? 'Uploading…' : 'Click to upload images of the damaged or reference part'}
                  </p>
                  <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-1">PNG, JPG supported</p>
                </div>
              </label>
              {uploadedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-[rgba(0,200,83,0.2)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <span className="absolute top-1 right-1 bg-[#00C853] rounded-full w-4 h-4 grid place-items-center text-[#07110A] text-[10px] font-bold">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {apiError && (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                {apiError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
                className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold px-8"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Request'}
              </Button>
              <Link
                to={auth ? '/requests' : '/'}
                className="inline-flex items-center px-6 py-2 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] text-sm hover:text-[#07110A] dark:hover:text-white hover:border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)] transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-mono text-[#00C853] uppercase tracking-widest">Step {step}</span>
        <h2 className="text-[#07110A] dark:text-white font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{label}</Label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
