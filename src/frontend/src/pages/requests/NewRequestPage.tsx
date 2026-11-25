// src/frontend/src/pages/requests/NewRequestPage.tsx
import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import { partsApi } from '@/api/partsApi'
import { imageApi } from '@/api/imageApi'
import { ConditionPreference, Urgency } from '@/types/request'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  vehicleMake: z.string().trim().min(1, 'Required'),
  model: z.string().trim().min(1, 'Required'),
  year: z.string().trim().regex(/^\d{4}$/, 'Enter a four-digit year'),
  engineType: z.string().trim(),
  chassisNumber: z.string().trim(),
  partName: z.string().trim().min(1, 'Part name is required'),
  partNumber: z.string().trim(),
  description: z.string().trim(),
  country: z.string().trim().min(1, 'Country is required'),
  phone: z.string().trim().min(7, 'Phone is required'),
  email: z.string().trim().email('Invalid email'),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'bg-[#EFF7F1] dark:bg-[#162019] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-11'
const selectClass =
  'w-full h-11 px-3 rounded-lg bg-[#EFF7F1] dark:bg-[#162019] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm'

export default function NewRequestPage() {
  const { auth } = useAuth()
  const location = useLocation()
  const { t } = useTranslation('requests')
  const prefill = location.state as { year?: string; make?: string; partName?: string } | null
  const search = new URLSearchParams(location.search)

  const conditionOptions = [
    { value: ConditionPreference.AnyCondition, label: t('condition_any') },
    { value: ConditionPreference.OEM, label: t('condition_oem') },
    { value: ConditionPreference.Aftermarket, label: t('condition_aftermarket') },
    { value: ConditionPreference.Second_Hand, label: t('condition_secondHand') },
    { value: ConditionPreference.Open_To_All, label: t('condition_openToAll') },
  ]

  const urgencyOptions = [
    { value: Urgency.Standard, label: t('urgency_standard') },
    { value: Urgency.Express, label: t('urgency_express') },
    { value: Urgency.Urgent, label: t('urgency_urgent') },
  ]

  const [condition, setCondition] = useState<number>(ConditionPreference.AnyCondition)
  const [urgency, setUrgency] = useState<number>(Urgency.Standard)
  const [photos, setPhotos] = useState<{ id: string; file: File; url?: string; failed?: boolean }[]>([])
  const [uploading, setUploading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submission, setSubmission] = useState<{ id: string; email: string; hasMatches: boolean }>()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleMake: search.get('make') || prefill?.make || '',
      model: search.get('model') || '',
      chassisNumber: search.get('vin') || '',
      partNumber: search.get('partNumber') || '',
      year: search.get('year') || prefill?.year || '',
      partName: search.get('partName') || prefill?.partName || '',
      email: auth?.email ?? '',
      engineType: '',
      description: '',
    },
  })

  async function uploadPhotos(items: typeof photos) {
    const token = auth?.token
    if (!token || !items.length) return
    setUploading(true)
    try {
      await Promise.all(items.map(async ({ id, file }) => {
        try {
          const { data: url } = await imageApi.upload(file, token)
          if (typeof url !== 'string' || !url) throw new Error('Missing image URL')
          setPhotos((previous) => previous.map((photo) => photo.id === id ? { ...photo, url, failed: false } : photo))
        } catch {
          setPhotos((previous) => previous.map((photo) => photo.id === id ? { ...photo, failed: true } : photo))
        }
      }))
    } finally {
      setUploading(false)
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const items = Array.from(event.currentTarget.files ?? [], (file) => ({ id: crypto.randomUUID(), file }))
    event.currentTarget.value = ''
    setPhotos((previous) => [...previous, ...items])
    void uploadPhotos(items)
  }

  async function onSubmit(values: FormValues) {
    setApiError('')
    if (uploading || photos.some((photo) => !photo.url)) return
    try {
      const { data: requestId } = await requestApi.create(
        {
          ...values,
          conditionPreference: condition as typeof ConditionPreference[keyof typeof ConditionPreference],
          urgency: urgency as typeof Urgency[keyof typeof Urgency],
          dateCreated: new Date().toISOString(),
          userId: auth?.userId ?? 0,
          partImages: photos.flatMap(({ url }) => url ? [{ imageUrl: url }] : []),
        },
        auth?.token,
      )
      let hasMatches = false
      if (auth) {
        try {
          const { data: parts } = await partsApi.search({
            query: values.partName,
            make: values.vehicleMake,
            model: values.model,
            year: values.year,
          })
          hasMatches = parts.length > 0
        } catch {
          // The request is already saved. Customers can still open its details.
        }
      }
      setSubmission({ id: String(requestId), email: values.email, hasMatches })
    } catch (error) {
      const validation = isAxiosError<{ errors?: Record<string, string[]> }>(error)
        ? error.response?.data?.errors
        : undefined
      let hasFieldErrors = false
      for (const [key, messages] of Object.entries(validation ?? {})) {
        const field = (Object.keys(schema.shape) as (keyof FormValues)[])
          .find((name) => name.toLowerCase() === key.toLowerCase())
        if (field && Array.isArray(messages) && messages[0]) {
          setError(field, { type: 'server', message: messages[0] })
          if (['engineType', 'chassisNumber', 'partNumber', 'description'].includes(field)) setDetailsOpen(true)
          hasFieldErrors = true
        }
      }
      setApiError(t(hasFieldErrors ? 'error_review' : 'error_submit'))
    }
  }

  return (
    <div className="flex-grow font-sans text-[#07110A] dark:text-[#E8F0E9]">
        {/* Guest success screen */}
        {submission && (
          <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,200,83,0.12)] border border-[rgba(0,200,83,0.25)] grid place-items-center mx-auto mb-6">
              <span className="text-[#00C853] text-3xl">✓</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#07110A] dark:text-white mb-3">
              {t('success_heading')}
            </h1>
            <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] mb-2 leading-relaxed">
              {t('success_text')}{' '}
              <span className="font-medium text-[#07110A] dark:text-white">{submission.email}</span>.
            </p>
            <p className="mt-4 font-semibold" role="status">{t('success_reference', { id: submission.id })}</p>
            {auth ? (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link className={buttonVariants()} to={`/requests/${submission.id}`}>{t('view_details')}</Link>
                {submission.hasMatches && (
                  <Link className={buttonVariants({ variant: "outline" })} to={`/requests/${submission.id}/parts`}>
                    {t('success_matches')}
                  </Link>
                )}
              </div>
            ) : (
            <div className="mt-8 p-5 rounded-xl bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.18)] text-left">
              <p className="text-xs font-mono uppercase tracking-widest text-[#00C853] mb-2">{t('success_track_label')}</p>
              <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] mb-4 leading-relaxed">
                {t('success_track_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-5 py-2 text-sm hover:bg-[#39FF88] transition-colors"
                >
                  {t('success_create_account')}
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] font-medium px-5 py-2 text-sm hover:text-[#07110A] dark:hover:text-white transition-colors"
                >
                  {t('success_back_home')}
                </Link>
              </div>
            </div>
            )}
          </div>
        )}

        {!submission && (
        <div className="max-w-[860px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link to={auth ? '/requests' : '/'} className="text-[#4A6B50] dark:text-[#7A9A80] text-xs hover:text-[#07110A] dark:hover:text-white mb-4 inline-block">
              {auth ? t('back_to_requests') : t('back_to_home')}
            </Link>
            <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
              <span className="block w-6 h-px bg-[#00C853]" />
              {t('new_label')}
            </p>
            <h1 className="text-3xl font-extrabold text-[#07110A] dark:text-white font-display">{t('new_heading')}</h1>
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Vehicle */}
            <Section title={t('section_vehicle')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="vehicleMake" label={t('field_make')} error={errors.vehicleMake?.message}>
                  <Input id="request-vehicleMake" required aria-invalid={!!errors.vehicleMake} aria-describedby={errors.vehicleMake ? 'request-vehicleMake-error' : undefined} {...register('vehicleMake')} placeholder="Toyota" className={fieldClass} />
                </Field>
                <Field name="model" label={t('field_model')} error={errors.model?.message}>
                  <Input id="request-model" required aria-invalid={!!errors.model} aria-describedby={errors.model ? 'request-model-error' : undefined} {...register('model')} placeholder="Hilux" className={fieldClass} />
                </Field>
                <Field name="year" label={t('field_year')} error={errors.year?.message}>
                  <Input inputMode="numeric" id="request-year" required aria-invalid={!!errors.year} aria-describedby={errors.year ? 'request-year-error' : undefined} {...register('year')} placeholder="2021" className={fieldClass} />
                </Field>
              </div>
            </Section>

            {/* Section 2: Part */}
            <Section title={t('section_part')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="partName" label={t('field_partName')} error={errors.partName?.message} className="sm:col-span-2">
                  <Input id="request-partName" required aria-invalid={!!errors.partName} aria-describedby={errors.partName ? 'request-partName-error' : undefined} {...register('partName')} placeholder="Front brake pad set" className={fieldClass} />
                </Field>
              </div>
            </Section>

            {/* Section 3: Contact & Delivery */}
            <Section title={t('section_contact')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="country" label={t('field_country')} error={errors.country?.message}>
                  <Input id="request-country" required aria-invalid={!!errors.country} aria-describedby={errors.country ? 'request-country-error' : undefined} {...register('country')} placeholder="Kenya" className={fieldClass} />
                </Field>
                <Field name="phone" label={t('field_phone')} error={errors.phone?.message}>
                  <Input autoComplete="tel" id="request-phone" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'request-phone-error' : undefined} {...register('phone')} type="tel" placeholder="+254 700 000 000" className={fieldClass} />
                </Field>
                <Field name="email" label={t('field_email')} error={errors.email?.message} className="sm:col-span-2">
                  <Input
                    id="request-email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'request-email-error' : undefined} {...register('email')}
                    type="email" autoComplete="email"
                    placeholder="you@example.com"
                    readOnly={!!auth}
                    className={cn(fieldClass, auth && 'opacity-60 cursor-not-allowed')}
                  />
                  {!auth && (
                    <p className="text-[10px] text-[#4A6B50] dark:text-[#7A9A80] mt-1">
                      {t('field_email_hint')}
                    </p>
                  )}
                </Field>
              </div>
            </Section>

            <details open={detailsOpen} onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
              className="rounded-2xl border border-border bg-card p-5">
              <summary className="cursor-pointer font-semibold">{t('additional_details')}</summary>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field name="engineType" label={t('optional_field', { label: t('field_engine') })} error={errors.engineType?.message}>
                  <Input id="request-engineType" aria-invalid={!!errors.engineType} aria-describedby={errors.engineType ? 'request-engineType-error' : undefined} {...register('engineType')} placeholder="2.4L Diesel" className={fieldClass} />
                </Field>
                <Field name="chassisNumber" label={t('optional_field', { label: t('field_chassis') })} error={errors.chassisNumber?.message} className="sm:col-span-2">
                  <Input id="request-chassisNumber" aria-invalid={!!errors.chassisNumber} aria-describedby={errors.chassisNumber ? 'request-chassisNumber-error' : undefined} {...register('chassisNumber')} placeholder="JTFHX02P900XXXXX" className={fieldClass} />
                </Field>
                <Field name="partNumber" label={t('optional_field', { label: t('field_partNumber') })} error={errors.partNumber?.message}>
                  <Input id="request-partNumber" aria-invalid={!!errors.partNumber} aria-describedby={errors.partNumber ? 'request-partNumber-error' : undefined} {...register('partNumber')} placeholder="04465-0K260" className={fieldClass} />
                </Field>
                <Field name="condition" label={t('optional_field', { label: t('field_condition') })}>
                  <select
                    id="request-condition" value={condition}
                    onChange={(e) => setCondition(Number(e.target.value))}
                    className={selectClass}
                  >
                    {conditionOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field name="urgency" label={t('optional_field', { label: t('field_urgency') })} className="sm:col-span-2">
                  <select
                    id="request-urgency" value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className={selectClass}
                  >
                    {urgencyOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field name="description" label={t('optional_field', { label: t('field_description') })} error={errors.description?.message} className="sm:col-span-2">
                  <textarea
                    id="request-description" aria-invalid={!!errors.description} aria-describedby={errors.description ? 'request-description-error' : undefined} {...register('description')}
                    rows={3}
                    placeholder={t('field_description_placeholder')}
                    className={cn(
                      fieldClass,
                      'h-auto px-3 py-2.5 rounded-lg border w-full resize-none',
                    )}
                  />
                </Field>
              </div>
              <section className="mt-6" aria-labelledby="request-photos">
                <h3 id="request-photos" className="font-semibold">{t('optional_field', { label: t('section_images') })}</h3>
                {auth?.token ? (
                  <div className="mt-2">
                    <label htmlFor="request-photo-files" className="block text-sm">{t('images_upload_label')}</label>
                    <Input id="request-photo-files" type="file" multiple accept="image/png,image/jpeg"
                      onChange={handleImageUpload} disabled={uploading || isSubmitting}
                      aria-describedby="request-photo-formats" className="mt-2" />
                    <p id="request-photo-formats" className="mt-1 text-xs text-muted-foreground">{t('images_format_hint')}</p>
                    {uploading && <p role="status" className="mt-2 text-sm">{t('images_uploading')}</p>}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t('images_sign_in_hint')}</p>
                )}
                {photos.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {photos.map((photo) => (
                      <li key={photo.id} className="min-w-0 rounded-lg border border-border p-3">
                        {photo.url && <img src={photo.url} alt={photo.file.name} className="mb-2 h-24 w-full rounded object-contain" />}
                        <p className="break-all text-sm">{photo.file.name}</p>
                        {photo.failed && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t('error_image_upload')}</p>}
                        <div className="mt-2 flex gap-2">
                          {photo.failed && (
                            <Button type="button" size="sm" variant="outline" disabled={uploading || isSubmitting}
                              onClick={() => {
                                setPhotos((previous) => previous.map((item) => item.id === photo.id ? { ...item, failed: false } : item))
                                void uploadPhotos([photo])
                              }}>{t('photo_retry')}</Button>
                          )}
                          <Button type="button" size="sm" variant="outline" disabled={isSubmitting}
                            onClick={() => setPhotos((previous) => previous.filter((item) => item.id !== photo.id))}>
                            {t('photo_remove')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </details>

            {apiError && (
              <p role="alert" className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                {apiError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || uploading || photos.some((photo) => photo.failed)}
                className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold px-8"
              >
                {isSubmitting ? t('submit_loading') : t('submit_btn')}
              </Button>
              <Link
                to={auth ? '/requests' : '/'}
                className="inline-flex items-center px-6 py-2 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] text-sm hover:text-[#07110A] dark:hover:text-white hover:border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)] transition-colors"
              >
                {t('cancel_btn')}
              </Link>
            </div>
          </form>
        </div>
        )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[#07110A] dark:text-white font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({
  name,
  label,
  error,
  className,
  children,
}: {
  name: string
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={`request-${name}`} className="text-[#07110A] dark:text-[#E8F0E9] text-sm">{label}</Label>
      {children}
      {error && <p id={`request-${name}-error`} className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
