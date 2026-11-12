import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@/api/catalogApi'
import { catalogConfigurations } from '@/data/catalogConfigurations'
import { buildSearchQuery, prepareSearch } from '@/lib/catalogSearch'
import type { CatalogSearchState, SearchMode, SearchCategory } from '@/lib/catalogSearch'

const snapshot: SearchCategory[] = [...new Map(catalogConfigurations.map(c => [`${c.make}:${c.model}`, { make: c.make, model: c.model, variants: [], partCount: 0 }])).values()]
interface Props {
  state: CatalogSearchState
  onSearch: (state: CatalogSearchState) => void
  decodedMake?: string | null
}
export function CatalogSearchForm({ state, onSearch, decodedMake }: Props) {
  const { t } = useTranslation('search')
  const id = useId()
  const [q, setQ] = useState(state.q || (state.scope === 'vin' ? state.vin : ''))
  const [mode, setMode] = useState<SearchMode>(state.mode)
  const [make, setMake] = useState(state.make)
  const [model, setModel] = useState(state.model)
  const [year, setYear] = useState(state.year)
  const [steering, setSteering] = useState(state.steering)
  const [config, setConfig] = useState(String(catalogConfigurations.findIndex(c => c.make === state.make && c.model === state.model && c.vehicleSeries === state.vehicleSeries)))
  const [error, setError] = useState('')
  const { data, isError } = useQuery({ queryKey: ['vehicle-categories'], queryFn: catalogApi.getCategories, staleTime: 300_000, retry: false })
  const categories = data || snapshot
  const makes = [...new Set([...categories.map(c => c.make), ...(make ? [make] : [])])].sort()
  const models = [...new Set([...categories.filter(c => !make || c.make === make).map(c => c.model), ...(model ? [model] : [])])].sort()
  const configs = catalogConfigurations.map((c, index) => ({ ...c, index })).filter(c => c.make === make && c.model === model)
  const inputClass = 'w-full min-w-0 rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-brand-card dark:text-slate-100'
  function submit(browse: boolean) {
    try {
      let next = prepareSearch(q, mode, { ...state, make, model, year, steering }, categories)
      const selected = catalogConfigurations[Number(config)]
      if (browse) {
        if (!make && !model) throw new Error('chooseVehicle')
        if (state.vin && decodedMake && make && decodedMake.toUpperCase() !== make.toUpperCase()) throw new Error('conflict')
        next = { ...next, vin: state.vin, scope: 'catalog', make, model, year, steering }
        // The main VIN is retained as customer context, never sent as a reference catalog filter.
        if (state.vin && q.toUpperCase() === state.vin) next = { ...next, q: '', mode: 'auto' }
      }
      if (next.scope !== 'vin' && selected && selected.make === next.make && selected.model === next.model) {
        next = { ...next, vehicleSeries: selected.vehicleSeries, engineFamily: selected.engineFamily, transmission: selected.transmission, marketSpec: selected.marketSpec, steering: steering || selected.steering }
      } else next = { ...next, engineFamily: '', vehicleSeries: '', transmission: '', marketSpec: '' }
      if (!browse && state.scope === 'vin' && next.vin && next.make && decodedMake && next.make.toUpperCase() !== decodedMake.toUpperCase()) throw new Error('conflict')
      buildSearchQuery(next)
      setError('')
      onSearch(next)
    } catch (e) { setError(t(e instanceof Error ? e.message : 'error', { defaultValue: t('error') })) }
  }
  return (
    <form aria-label={t('heading')} className="space-y-3 text-start" onSubmit={e => { e.preventDefault(); submit(false) }}>
      <h2 className="font-bold text-slate-900 dark:text-slate-100">{t('heading')}</h2>
      <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
        <label className="text-xs font-medium" htmlFor={`${id}-mode`}>{t('mode')}
          <select id={`${id}-mode`} className={inputClass} value={mode} onChange={e => setMode(e.target.value as SearchMode)}>
            {(['auto', 'vin', 'number', 'name', 'pnc'] as const).map(m => <option key={m} value={m}>{t(m)}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs font-medium" htmlFor={`${id}-query`}>{t('query')}
          <input id={`${id}-query`} data-testid="catalog-query" dir="auto" className={inputClass} value={q} onChange={e => setQ(e.target.value)} placeholder={t('query')} />
        </label>
        <button className="self-end rounded bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700" type="submit">{t('submit')}</button>
      </div>
      <p className="text-xs text-slate-500">{t('modeHint')}</p>
      <details open={!!(state.vin || state.make || state.model)} className="rounded border border-slate-200 p-3 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-semibold">{t('vehicle')}</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs" htmlFor={`${id}-make`}>{t('make')}<select id={`${id}-make`} className={inputClass} value={make} onChange={e => { setMake(e.target.value); setModel(''); setConfig('-1') }}><option value="">{t('any')}</option>{makes.map(m => <option key={m}>{m}</option>)}</select></label>
          <label className="text-xs" htmlFor={`${id}-model`}>{t('model')}<select id={`${id}-model`} className={inputClass} value={model} onChange={e => { const value = e.target.value; setModel(value); setConfig('-1'); if (!make) setMake(categories.find(c => c.model === value)?.make || '') }}><option value="">{t('any')}</option>{models.map(m => <option key={m}>{m}</option>)}</select></label>
          <label className="text-xs" htmlFor={`${id}-year`}>{t('year')}<input id={`${id}-year`} className={inputClass} inputMode="numeric" value={year} onChange={e => setYear(e.target.value)} placeholder="2018" /></label>
          <label className="text-xs" htmlFor={`${id}-steering`}>{t('steering')}<select id={`${id}-steering`} className={inputClass} value={steering} onChange={e => setSteering(e.target.value)}><option value="">{t('any')}</option><option>LHD</option><option>RHD</option></select></label>
          {configs.length > 0 && <label className="text-xs sm:col-span-2 lg:col-span-4" htmlFor={`${id}-config`}>{t('configuration')}<select id={`${id}-config`} className={inputClass} value={config} onChange={e => setConfig(e.target.value)}><option value="-1">{t('any')}</option>{configs.map(c => <option key={c.index} value={c.index}>{c.engineFamily} · {c.transmission} · {c.steering} · {c.compatibilityStartYear}–{c.compatibilityEndYear} · {c.marketSpec} · {c.vehicleSeries}</option>)}</select></label>}
        </div>
        <p className="my-2 text-xs text-slate-500">{t('snapshot')}</p>
        {isError && <p className="text-xs text-amber-700">{t('coverageUnavailable')}</p>}
        <button type="button" className="rounded border border-emerald-600 px-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300" onClick={() => submit(true)}>{t('browse')}</button>
      </details>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {state.vin && <button className="text-sm underline" type="button" onClick={() => onSearch({ ...state, vin: '', q: state.q && state.q.toUpperCase() !== state.vin ? state.q : '', mode: state.mode === 'vin' ? 'auto' : state.mode, scope: state.make ? 'catalog' : 'global', page: 1 })}>{t('clearVin')}</button>}
    </form>
  )
}
