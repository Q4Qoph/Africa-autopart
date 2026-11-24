import { useState } from 'react'
import type { CSSProperties } from 'react'
import placeholder from '@/assets/part-image-placeholder.svg'

export function PartImage({ src, alt, className, style, loading }: {
  src?: string | null
  alt: string
  className?: string
  style?: CSSProperties
  loading?: 'lazy' | 'eager'
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const missing = !src || failedSource === src
  return <img
    loading={loading}
    src={missing ? placeholder : src}
    alt={missing ? `${alt} — image unavailable` : alt}
    className={missing ? 'h-16 w-16 rounded bg-white p-2 object-contain' : className}
    style={missing ? undefined : style}
    onError={missing ? undefined : () => setFailedSource(src || null)}
  />
}
