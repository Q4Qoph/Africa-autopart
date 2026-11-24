import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getBrandLogoPath } from '@/lib/brandUtils'
import { getVehicleCoverageSnapshot } from '@/data/vehicleCoverage'
import { buildSearchQuery, prepareSearch, readSearch, writeSearch } from '@/lib/catalogSearch'

const coverage = getVehicleCoverageSnapshot()
const categories = coverage.makes.flatMap(make => make.models.map(model => ({
  make: make.make, model: model.model, variants: [], partCount: 0,
})))

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation(['home', 'search'])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = prepareSearch(query, 'auto', readSearch(new URLSearchParams()), categories)
    try {
      buildSearchQuery(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'error')
      return
    }
    navigate(`/parts-search?${writeSearch(next)}`)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-8 sm:py-10">
      <section aria-labelledby="home-title" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 dark:border-emerald-900 dark:bg-emerald-950/40 sm:p-9">
        <h1 id="home-title" className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{t('finder_title')}</h1>
        <form role="search" onSubmit={search} className="mt-5 max-w-3xl space-y-2">
          <label htmlFor="home-query" className="block text-sm font-medium">{t('search:query')}</label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input id="home-query" data-testid="catalog-query" type="search" dir="auto" autoComplete="off" spellCheck={false}
              maxLength={80} value={query} placeholder={t('finder_example')} aria-invalid={!!error}
              aria-describedby={error ? 'home-search-error' : undefined}
              onChange={event => { setQuery(event.target.value); setError('') }}
              className="min-h-12 w-full rounded-lg border border-slate-400 bg-white px-3 text-base text-slate-950 focus-visible:outline-2 focus-visible:outline-emerald-700 dark:border-slate-500 dark:bg-slate-900 dark:text-white" />
            <button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <Search size={18} aria-hidden="true" className="hidden sm:block" /> {t('search:submit')}
            </button>
          </div>
          {error && <p id="home-search-error" role="alert" className="text-sm text-red-700 dark:text-red-300">{t(`search:${error}`, { defaultValue: t('search:error') })}</p>}
        </form>
        <a href="#vehicle-catalogs" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald-800 underline underline-offset-4 dark:text-emerald-300">
          {t('finder_browse')} <ArrowDown size={16} aria-hidden="true" />
        </a>
      </section>

      <section id="vehicle-catalogs" aria-labelledby="vehicle-catalogs-title" className="scroll-mt-28">
        <h2 id="vehicle-catalogs-title" className="text-xl font-bold">{t('coverage_catalogs_heading')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('coverage_years_note')} {t('finder_lhd')}</p>
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2">
          {coverage.makes.map(make => (
            <section key={make.make} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-brand-card">
              <h3 className="flex items-center gap-3 px-4 py-3 font-semibold">
                <span className="grid h-9 w-12 shrink-0 place-items-center rounded-md bg-slate-50 dark:bg-slate-200">
                  <img src={getBrandLogoPath(make.label)} alt="" width={36} height={24} className="h-6 w-9 object-contain" />
                </span>
                <bdi>{make.label}</bdi>
              </h3>
              <ul className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {make.models.map(model => (
                  <li key={model.model}>
                    <Link to={`/brands/${encodeURIComponent(make.make)}/models/${encodeURIComponent(model.model)}/parts`}
                      className="flex min-h-11 items-center gap-3 px-4 py-2 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-700 dark:hover:bg-emerald-950/50">
                      <bdi className="flex-1 font-medium">{model.label}</bdi>
                      <span className="shrink-0 text-end text-xs text-slate-600 dark:text-slate-300">
                        {model.ranges.map(({ startYear, endYear, steering }) => (
                          <bdi key={`${startYear}-${endYear}-${steering}`} className="block">
                            {startYear === null || endYear === null ? t('coverage_years_unknown') : startYear === endYear ? startYear : `${startYear}–${endYear}`}
                          </bdi>
                        ))}
                      </span>
                      <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-emerald-700 rtl:rotate-180 dark:text-emerald-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <div>
          <h2 className="font-semibold">{t('finder_missing')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('finder_help')}</p>
        </div>
        <Link to="/requests/new" className="inline-flex min-h-11 items-center rounded-lg border border-emerald-700 px-4 font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50">
          {t('search:request')}
        </Link>
      </section>

      <details className="border-t border-slate-200 dark:border-slate-700">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold">{t('finder_order')}</summary>
        <ol className="list-decimal space-y-2 pb-4 ps-6 text-sm text-slate-700 dark:text-slate-300">
          <li>{t('finder_step_search')}</li>
          <li>{t('finder_step_select')}</li>
          <li>{t('finder_step_order')}</li>
        </ol>
      </details>
    </div>
  )
}
