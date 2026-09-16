import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CarFront, ChevronRight, Loader2 } from 'lucide-react'
import { catalogApi } from '@/api/catalogApi'
import { getBrandLogoPath } from '@/lib/brandUtils'

export default function BrandPage() {
  const { make: encodedMake } = useParams<{ make: string }>()
  const navigate = useNavigate()
  const make = encodedMake ? decodeURIComponent(encodedMake) : ''
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadModels() {
      if (!make) {
        setError('Vehicle make was not provided.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const firstPage = await catalogApi.getModelsByMake(make, 1, 50)
        const pages = Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
          catalogApi.getModelsByMake(make, index + 2, 50),
        )
        const remainingPages = await Promise.all(pages)
        const allModels = [firstPage, ...remainingPages]
          .flatMap((page) => page.items || [])
          .filter(Boolean)

        if (!cancelled) {
          setModels(Array.from(new Set(allModels)))
        }
      } catch {
        if (!cancelled) {
          setError(`Could not load ${make} models. Please try again.`)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadModels()
    return () => {
      cancelled = true
    }
  }, [make])

  function openModel(model: string) {
    navigate(`/brands/${encodeURIComponent(make)}/models/${encodeURIComponent(model)}/parts`)
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-brand-ink px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#00C853] dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to vehicle makes
        </Link>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-card md:flex md:items-center md:gap-8 md:p-8">
          <div className="flex h-32 w-48 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-4 dark:bg-brand-ink">
            <img
              src={getBrandLogoPath(make)}
              alt={`${make} logo`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-6 md:mt-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00C853]">Vehicle catalog</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">{make}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Browse available {make} models and open a parts catalog for the model you need.
              Explore parts from our extensive Africa Auto Parts database.
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {loading ? 'Loading model availability…' : `${models.length} model${models.length === 1 ? '' : 's'} available`}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose a model</h2>
            {!loading && models.length > 0 && (
              <span className="text-xs font-mono text-slate-500">{models.length} models</span>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-brand-card">
              <Loader2 className="h-7 w-7 animate-spin text-[#00C853]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-brand-card dark:text-slate-300">
              No models are currently available for {make}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => openModel(model)}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#00C853] hover:shadow-md dark:border-slate-800 dark:bg-brand-card"
                >
                  <span className="flex items-center gap-3">
                    <CarFront className="h-5 w-5 text-[#00C853]" />
                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">{model}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">View parts catalog</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#00C853]" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
