import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { CarFront, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { VehicleCoverageSnapshot } from '@/data/vehicleCoverage'
import { cn } from '@/lib/utils'

interface VehicleCoveragePanelProps {
  coverage: VehicleCoverageSnapshot
}

export function VehicleCoveragePanel({ coverage }: VehicleCoveragePanelProps) {
  const { t, i18n } = useTranslation('home')
  const id = useId()
  // Both groups are visible initially; each can be collapsed independently.
  const [collapsedMakes, setCollapsedMakes] = useState<ReadonlySet<string>>(new Set())
  const steeringValues = Array.from(new Set(coverage.makes.flatMap((make) =>
    make.models.flatMap((model) => model.ranges.flatMap((range) => range.steering ? [range.steering] : [])),
  )))
  const verifiedDate = new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(coverage.verifiedAt))

  function toggleMake(make: string) {
    setCollapsedMakes((current) => {
      const next = new Set(current)
      if (next.has(make)) next.delete(make)
      else next.add(make)
      return next
    })
  }

  return (
    <aside
      aria-labelledby={`${id}-title`}
      className="min-w-0 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-brand-card lg:col-start-2 lg:row-start-1 lg:row-span-3"
    >
      <div className="border-b border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <div className="mb-2 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <CarFront className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id={`${id}-title`} className="text-base font-bold">{t('coverage_heading')}</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('coverage_description')}</p>
      </div>

      {coverage.makes.length === 0 ? (
        <p className="p-4 text-sm text-slate-600 dark:text-slate-300">{t('coverage_empty')}</p>
      ) : coverage.makes.map((make, index) => {
        const expanded = !collapsedMakes.has(make.make)
        const buttonId = `${id}-make-${index}`
        const panelId = `${id}-models-${index}`
        return (
          <div key={make.make} className="border-b border-slate-100 dark:border-slate-800">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleMake(make.make)}
                className="flex min-h-12 w-full items-center gap-2 px-4 py-3 text-start transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-brand-ink dark:focus-visible:outline-emerald-400"
              >
                <bdi className="flex-1 font-bold text-slate-800 dark:text-slate-100">{make.label}</bdi>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('coverage_model_count', { count: make.models.length })}
                </span>
                <ChevronDown aria-hidden="true" className={cn('h-4 w-4 shrink-0 text-slate-500', !expanded && '-rotate-90 rtl:rotate-90')} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="px-4 pb-3">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {make.models.map((model) => (
                  <li key={model.model} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 py-2.5 text-sm">
                    <bdi className="font-medium leading-5 text-slate-700 dark:text-slate-200">{model.label}</bdi>
                    <ul className="space-y-1 text-end">
                      {model.ranges.map((range) => (
                        <li key={`${range.startYear}-${range.endYear}-${range.steering}`} className="flex flex-wrap items-center justify-end gap-1.5 text-xs">
                          <span className="sr-only">{t('coverage_year_label')}: </span>
                          <bdi className="tabular-nums text-slate-600 dark:text-slate-300">
                            {range.startYear === null || range.endYear === null
                              ? t('coverage_years_unknown')
                              : range.startYear === range.endYear ? range.startYear : `${range.startYear}–${range.endYear}`}
                          </bdi>
                          {range.steering ? (
                            <abbr
                              title={t(range.steering === 'LHD' ? 'coverage_lhd' : 'coverage_rhd')}
                              className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 no-underline dark:bg-emerald-950 dark:text-emerald-300"
                            >{range.steering}</abbr>
                          ) : <span className="text-slate-500 dark:text-slate-400">{t('coverage_steering_unknown')}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <Link
                to={`/brands/${encodeURIComponent(make.make)}`}
                className="mt-1 inline-block rounded py-1 text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-200"
              >{t('coverage_browse_make', { make: make.label })}</Link>
            </div>
          </div>
        )
      })}

      <div className="space-y-2 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-500 dark:bg-brand-ink/40 dark:text-slate-400">
        <p>{t('coverage_years_note')}</p>
        {steeringValues.map((steering) => (
          <p key={steering}><bdi>{steering}</bdi> = {t(steering === 'LHD' ? 'coverage_lhd' : 'coverage_rhd')}</p>
        ))}
        <p>{t('coverage_checked')} <time dateTime={coverage.verifiedAt}>{verifiedDate}</time></p>
      </div>
    </aside>
  )
}
