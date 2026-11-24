import { useExternalCart } from '@/context/ExternalCartContext'
import { formatCheckoutPrice } from '@/lib/checkoutPrice'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalogApi'
import { diagramImageOrigin as imageOrigin, getReviewedSheet, santaFeVin } from '@/data/diagramPncRegions'
import catalogs from '@/data/catalogAssemblies.json'
import toolsImage from '@/assets/demo/santa-fe-tools.png'
import type { CatalogPartItem } from '@/types/catalog'
import { PartImage } from './PartImage'

const toolsUrl = imageOrigin + '133839.png'

const hotspots = [
  { id: 36007, pnc: '09110', number: '091102W000', box: [1088, 729, 394, 356] },
  { id: 36008, pnc: '09127A', number: '091274D100', box: [1044, 774, 165, 102] },
  { id: 36009, pnc: '09131', number: '091314D000', box: [289, 1023, 259, 140] },
  { id: 36010, pnc: '09132', number: '091323B000', box: [743, 641, 260, 173] },
  { id: 36011, pnc: '09146', number: '0914611110', box: [136, 627, 201, 132] },
  { id: 36012, pnc: '09147A', number: '09147S1000', box: [397, 620, 362, 243] },
  { id: 36013, pnc: '09149C', number: '09149S1000', box: [523, 1357, 693, 390] },
  { id: 36014, pnc: '09516', number: '425162W000', box: [732, 1030, 174, 121] },
]

export type DiagramCatalog = typeof catalogs[number]
type Assembly = DiagramCatalog['assemblies'][number]

async function loadAssembly(catalog: DiagramCatalog, assembly: Assembly, signal: AbortSignal) {
  const rows = new Map<number, CatalogPartItem>()
  let totalPages = 1
  for (let page = 1; page <= totalPages; page++) {
    const result = await catalogApi.searchVehicles({
      make: catalog.make, model: catalog.model, vin: catalog.vin,
      groupName: assembly.group, subgroupName: assembly.name, page, pageSize: 100,
    }, signal)
    if (result.page !== page || result.totalPages > 28) throw new Error('Unexpected catalog pagination')
    totalPages = result.totalPages
    for (const row of result.items) {
      if (row.vin === catalog.vin && row.groupName === assembly.group && row.subgroupName === assembly.name) {
        rows.set(row.id, row)
      }
    }
  }
  return [...rows.values()]
}

export function CatalogDiagrams({ onClose, customerVin, choices }: {
  onClose: (referenceVin: string) => void
  customerVin: string
  choices: DiagramCatalog[]
}) {
  const [params, setParams] = useSearchParams()
  const catalog = choices.find(item => item.vin === params.get('diagramReference')) ?? choices[0]
  const assemblies = catalog.assemblies
  const groups = [...new Set(assemblies.map(item => item.group))]
  const group = groups.find(value => value === params.get('diagramCategory')) ?? ''
  const query = params.get('assemblySearch') ?? ''
  const term = query.trim().toLowerCase()
  const assembly = assemblies.find(item => item.group === params.get('assemblyGroup') && item.name === params.get('assemblyName'))
  const batch = 24
  const requestedSize = Number(params.get('diagramLimit'))
  const limit = Number.isSafeInteger(requestedSize) ? Math.min(assemblies.length, Math.max(batch, requestedSize)) : batch
  const visible = assemblies.filter(item => (!group || item.group === group)
    && item.name.toLowerCase().includes(term))
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
  const cardRef = useRef<HTMLButtonElement | null>(null)
  const returnTo = useRef<Assembly | null>(null)

  useEffect(() => {
    if (!assembly && returnTo.current && cardRef.current) {
      cardRef.current.focus({ preventScroll: true })
      cardRef.current.scrollIntoView({ block: 'nearest' })
      returnTo.current = null
    }
  }, [assembly])

  function update(values: Record<string, string>, replace = false) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace })
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5 py-4" lang="en" dir="ltr">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{assembly?.name ?? 'Parts diagrams'}</h2>
          <p className="text-sm">{catalog.make} {catalog.model} · {catalog.modelYear} · {catalog.steering}</p>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Catalog details</summary>
            <p>{catalog.vehicleSeries} · {catalog.vin}</p>
            <p>{customerVin ? 'Exact VIN catalog' : 'Reference catalog · Confirm fitment before ordering.'}</p>
          </details>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {assembly ? <button type="button" className="min-h-11 rounded-lg border px-3 font-semibold"
            onClick={() => update({ assemblyGroup: '', assemblyName: '' }, true)}>Back to assemblies</button> :
            <button type="button" className="min-h-11 rounded-lg border px-3 font-semibold" onClick={() => onClose(catalog.vin)}>Parts list</button>}
          <Link to="/#vehicle-catalogs" className="inline-flex min-h-11 items-center underline">Change vehicle</Link>
        </div>
      </header>
      {assembly ? <AssemblyViewer key={JSON.stringify([catalog.vin, assembly.group, assembly.name])} catalog={catalog} assembly={assembly} customerVin={customerVin} /> : <>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-medium">
            Find an assembly
            <input type="search" placeholder="Name or assembly code" maxLength={80} className="mt-1 min-h-11 w-full rounded-lg border bg-transparent px-3"
              value={query} onChange={event => update({ assemblySearch: event.target.value, diagramLimit: '' }, true)} />
          </label>
          {choices.length > 1 && <label className="min-w-0 text-sm font-medium">
            Reference catalog
            <select className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 text-slate-900 dark:bg-slate-900 dark:text-white"
              value={catalog.vin} onChange={event => update({ diagramReference: event.target.value, diagramCategory: '', assemblySearch: '', diagramLimit: '' })}>
              {choices.map(item => <option key={item.vin} value={item.vin}>{item.modelYear} · {item.marketSpec || item.vehicleSeries} · {item.engineFamily}</option>)}
            </select>
          </label>}
        </div>
        <section aria-label="Assembly categories">
          <h3 className="mb-2 font-semibold">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {[...groups, ''].map(value => <button key={value} type="button" aria-pressed={group === value}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${group === value ? 'bg-emerald-700 text-white' : 'hover:border-emerald-600'}`}
              onClick={() => update({ diagramCategory: value || 'all', diagramLimit: '' })}>
              {value || 'All categories'} <span className="ml-1 tabular-nums">{value ? assemblies.filter(item => item.group === value).length : assemblies.length}</span>
            </button>)}
          </div>
        </section>
        <p role="status" className="text-sm">{visible.length ? `Showing ${Math.min(limit, visible.length)} of ${visible.length} assemblies` : 'No assemblies match your search.'}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {visible.slice(0, limit).map(item => (
            <button key={JSON.stringify([item.group, item.name])} type="button"
              ref={element => { if (item === returnTo.current) cardRef.current = element }}
              className="flex min-w-0 flex-col items-stretch rounded-lg border p-3 text-left hover:border-emerald-600 focus-visible:outline-emerald-600"
              onClick={() => {
                returnTo.current = item
                update({ assemblyGroup: item.group, assemblyName: item.name })
              }}>
              {item.images[0]?.startsWith(imageOrigin) && <div className="relative mb-3 grid h-32 place-items-center w-full shrink-0 rounded bg-white">
                <PartImage loading="lazy" src={item.images[0]} alt="" className="absolute inset-0 block h-full w-full object-contain object-center p-2" />
              </div>}
              <span className="block break-words font-semibold">{item.name}</span>
              <span className="text-sm">{item.images.length ? `${item.images.length} ${item.images.length === 1 ? 'diagram' : 'diagrams'}` : 'Parts list'}</span>
              {item.images.some(url => getReviewedSheet(url, catalog.vin) || (url === toolsUrl && catalog.vin === santaFeVin)) &&
                <span className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Interactive diagram available</span>}
            </button>
          ))}
        </div>
        {visible.length > limit && <button type="button" className="min-h-11 rounded-lg border px-4 font-semibold"
          onClick={() => update({ diagramLimit: String(limit + batch) }, true)}>Show more assemblies</button>}
      </>}
    </section>
  )
}

function AssemblyViewer({ catalog, assembly, customerVin }: { catalog: DiagramCatalog; assembly: Assembly; customerVin: string }) {
  const { addItem } = useExternalCart()
  const navigate = useNavigate()
  const result = useQuery({
    queryKey: ['catalog-diagram', catalog.vin, assembly.group, assembly.name],
    queryFn: ({ signal }) => loadAssembly(catalog, assembly, signal),
  })
  const [sheet, setSheet] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [activePnc, setActivePnc] = useState<string | null>(null)

  if (result.isPending) return <p role="status">Loading parts…</p>
  if (result.isError) return <div role="alert">Could not load parts. <button className="underline" onClick={() => void result.refetch()}>Retry</button></div>

  const images = [...new Set(result.data.flatMap(row => row.imageUrl?.startsWith(imageOrigin) ? [row.imageUrl] : []))]
  const image = sheet !== null ? images.find(value => value === sheet) : images[0]
  const rows = image ? result.data.filter(row => row.imageUrl === image) : result.data
  const part = rows.find(row => row.id === selected)
  const price = formatCheckoutPrice(part?.price)

  function addSelectedPart() {
    if (!part || !price) return
    addItem({
      name: part.partName,
      partNumber: part.partNumber,
      price,
      isEstimated: true,
      originalPrice: '',
      supplier: part.oem || part.make || '',
      availability: false,
      location: part.model || '',
      imageURL: part.imageUrl?.startsWith(imageOrigin) ? part.imageUrl : '',
    })
    navigate('/cart')
  }
  const toolsMapped = catalog.vin === santaFeVin && image === toolsUrl && rows.length === hotspots.length && hotspots.every(hotspot =>
    rows.some(row => row.id === hotspot.id && row.pnc === hotspot.pnc && row.partNumber === hotspot.number))
  const reviewedSheet = image ? getReviewedSheet(image, catalog.vin) : undefined
  const labels = reviewedSheet?.labels ?? []
  const regions = toolsMapped ? hotspots.map(({ id, pnc, box }) => ({
    pnc, box, matches: rows.filter(row => row.id === id),
  })) : labels.map(label => ({
    ...label, matches: rows.filter(row => row.pnc === label.pnc),
  })).filter(region => region.matches.length > 0)
  const mapped = (toolsMapped || !!reviewedSheet) && regions.length > 0
  const width = reviewedSheet?.width ?? 1656
  const height = reviewedSheet?.height ?? 2260
  const drawing = reviewedSheet?.image ?? toolsImage
  const viewBox = toolsMapped ? '80 520 1430 1260' : `0 0 ${width} ${height}`
  const alternatives = activePnc ? rows.filter(row => row.pnc === activePnc) : []
  const selectedRegion = (matches: CatalogPartItem[]) => matches.some(row => row.id === selected)

  function selectRegion(pnc: string, matches: CatalogPartItem[]) {
    setActivePnc(pnc)
    setSelected(matches.length === 1 ? matches[0].id : null)
    document.getElementById(`santa-fe-part-${matches[0].id}`)?.scrollIntoView({ block: 'nearest' })
  }

  return <>
    {images.length > 0 && (
      <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">Sheet
        <select className="min-h-11 rounded-lg border bg-white px-3 text-slate-900 dark:bg-slate-900 dark:text-white" value={image ?? ''} onChange={event => {
          setSheet(event.target.value)
          setSelected(null)
          setActivePnc(null)
          setZoom(1)
        }}>
          {images.map((url, index) => <option key={url} value={url}>Diagram {index + 1}</option>)}
          <option value="">All parts in assembly</option>
        </select>
      </label>
      {image && <button className="min-h-11 rounded-lg border px-3 text-sm font-medium" type="button"
        onClick={() => setZoom(zoom === 1 ? 2 : 1)}>
        {zoom === 1 ? 'Zoom in' : 'Fit diagram'}
      </button>}
      </div>
    )}
    {!rows.length && <p>No parts are available for this assembly.</p>}
    <div className={image ? 'grid items-start gap-5 lg:grid-cols-2' : ''}>
      {image && <section id="santa-fe-diagram" className="min-w-0 scroll-mt-24">
          <div className="max-h-[65vh] overflow-auto rounded-lg border bg-white">
            {mapped ? <svg viewBox={viewBox} style={{ width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: zoom === 1 ? '65vh' : undefined }}
              role="group" aria-label={assembly.name}>
              <image href={drawing} width={width} height={height} />
              {regions.map(({ matches, pnc, box: [x, y, width, height] }) => (
                <rect key={`${pnc}-${x}-${y}`} x={x} y={y} width={width} height={height} fill="transparent"
                  stroke={(selectedRegion(matches) || activePnc === pnc) ? '#dc2626' : 'transparent'}
                  className="cursor-pointer focus-visible:stroke-blue-600" strokeWidth="3" vectorEffect="non-scaling-stroke"
                  role="button" tabIndex={0} aria-label={`PNC ${pnc}, ${matches.length === 1 ? matches[0].partName : `${matches.length} options`}`}
                  aria-pressed={selectedRegion(matches) || activePnc === pnc}
                  onClick={() => selectRegion(pnc, matches)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectRegion(pnc, matches)
                    }
                  }} />
              ))}
            </svg> : <div style={{ width: `${zoom * 100}%` }}>
              <PartImage src={image} alt={assembly.name} className={`mx-auto block w-full object-contain ${zoom === 1 ? 'max-h-[65vh]' : ''}`} />
            </div>}
          </div>
      </section>}
      <section aria-label="Parts in assembly" className="min-w-0">
        <p className="mb-2 text-sm font-medium" role="status">{alternatives.length > 1 ? `Choose a part number for PNC ${activePnc}` : `${rows.length} parts`}</p>
        <ul className="divide-y rounded-lg border lg:max-h-[60vh] lg:overflow-y-auto">
          {rows.map(row => <li key={row.id}>
            <button type="button" id={`santa-fe-part-${row.id}`} aria-pressed={selected === row.id}
              onClick={() => { setSelected(row.id); setActivePnc(null) }}
              className={`w-full px-3 py-2 text-left focus-visible:outline-emerald-600 ${selected === row.id ? 'bg-emerald-100 text-emerald-950' : alternatives.length > 1 && row.pnc === activePnc ? 'bg-amber-100 text-amber-950' : ''}`}>
              <span className="block font-semibold">{row.partName}{selected === row.id ? ' ✓' : ''}</span>
              <span className="block break-words text-sm">{row.partNumber}{row.pnc ? ` · PNC ${row.pnc}` : ''}</span>
              <span className="block text-xs text-slate-600 dark:text-slate-300">Catalog quantity {row.quantity ?? 'unavailable'}</span>
            </button>
          </li>)}
        </ul>
        {part && image && (!mapped || !regions.some(region => selectedRegion(region.matches))) &&
          <p className="mt-2 text-sm">PNC highlight unavailable on this drawing.</p>}
        {part && <div className="sticky bottom-0 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3 dark:bg-slate-900">
          <p role="status" className="min-w-0 flex-1 break-words text-sm">
            <strong className="block">{part.partName}</strong>
            <span>{part.partNumber}{price && ` · ${price} estimated USD`}</span>
          </p>
          {mapped && regions.some(region => selectedRegion(region.matches)) && <a href="#santa-fe-diagram" className="rounded border px-3 py-2 lg:hidden">Show on diagram</a>}
          {price ? <button type="button" onClick={addSelectedPart}
            className="rounded bg-emerald-700 px-3 py-2 text-white">Add part</button> : <Link className="rounded bg-emerald-700 px-3 py-2 text-white"
            to={`/requests/new?${new URLSearchParams({ ...(customerVin ? { vin: customerVin } : {}), make: catalog.make, model: catalog.model, partNumber: part.partNumber, partName: part.partName })}`}>
            Request part
          </Link>}
        </div>}
      </section>
    </div>
  </>
}
