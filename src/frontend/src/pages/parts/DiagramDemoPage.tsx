import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Download, RefreshCw } from 'lucide-react'
import { DemoDiagramCanvas } from '@/components/catalog/DemoDiagramCanvas'
import { catalogApi } from '@/api/catalogApi'
import { demoDiagram, demoParts } from '@/data/diagramDemo'
import type { DiagramRect } from '@/data/diagramDemo'
import './diagramDemo.css'

export default function DiagramDemoPage() {
  const [parts, setParts] = useState(() => structuredClone(demoParts))
  const [selectedId, setSelectedId] = useState(demoParts[0].id)
  const [mode, setMode] = useState<'object' | 'label'>('object')
  const [showRegions, setShowRegions] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [status, setStatus] = useState('Using saved public catalog data from 17 Nov 2026. The demo works without the API.')
  const [review, setReview] = useState(false)
  const [notice, setNotice] = useState('')
  const rowRefs = useRef(new Map<number, HTMLButtonElement>())
  const diagramRef = useRef<HTMLDivElement>(null)
  const selected = parts.find(part => part.id === selectedId)!
  const region = selected[mode]

  function selectFromDiagram(id: number) {
    setSelectedId(id)
    rowRefs.current.get(id)?.scrollIntoView({ block: 'nearest', behavior: 'auto' })
  }

  function selectFromList(id: number) {
    setSelectedId(id)
    if (window.matchMedia('(max-width: 850px)').matches) diagramRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }

  async function refreshParts() {
    setRefreshing(true)
    setStatus('Checking the seven public catalog rows…')
    const results = await Promise.allSettled(demoParts.map(part => catalogApi.getPart(part.id)))
    let accepted = 0
    const updates = results.flatMap((result, index) => {
      const expected = demoParts[index]
      if (result.status !== 'fulfilled') return []
      const actual = result.value
      // A changed row or image must not inherit an old hand-drawn mapping.
      if (actual.id !== expected.id || actual.partNumber !== expected.partNumber || actual.pnc !== expected.callout || actual.vin !== demoDiagram.referenceVin || actual.imageUrl !== demoDiagram.imageUrl) return []
      accepted++
      const price: unknown = 'price' in actual ? actual.price : null
      return [{ id: expected.id, name: actual.partName || expected.name, quantity: actual.quantity ?? null, apiPrice: typeof price === 'number' && Number.isFinite(price) ? price : null }]
    })
    setParts(current => current.map(part => ({ ...part, ...updates.find(update => update.id === part.id) })))
    setStatus(accepted === 7
      ? '7/7 rows refreshed from the live API. Image regions remain local demo annotations.'
      : `${accepted}/7 rows refreshed. Failed or changed rows keep the saved snapshot; their mapping was not reassigned.`)
    setRefreshing(false)
  }

  function updateRegion(field: keyof DiagramRect, raw: string) {
    if (!raw.trim()) return
    const value = Number(raw)
    if (!Number.isFinite(value)) return
    const next = { ...region, [field]: value }
    if (next.x < 0 || next.y < 0 || next.width <= 0 || next.height <= 0 || next.x + next.width > 600 || next.y + next.height > 820) {
      setNotice('Keep the rectangle inside the 600 × 820 image, with positive width and height.')
      return
    }
    setNotice('Annotation adjusted for this session. Export it to share your proposed coordinates.')
    setParts(current => current.map(part => part.id === selectedId ? { ...part, [mode]: next } : part))
  }

  function exportAnnotations() {
    const payload = {
      status: 'demo-review-only',
      ...demoDiagram,
      coordinateSystem: 'original-image-pixels; top-left origin',
      mappingSource: 'manually drawn demo regions; requires catalog owner review',
      pricingStatus: 'unconfirmed; no currency supplied',
      parts,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'creta-diagram-demo-review.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Review JSON exported. No backend records were changed.')
  }

  return (
    <main className="diagram-demo" lang="en" dir="ltr">
      <header className="diagram-demo-header">
        <Link to="/shop" className="diagram-demo-back"><ArrowLeft size={16} /> Back to catalog</Link>
        <span className="diagram-demo-badge">INTERACTIVE DEMO · FOR REVIEW</span>
        <h1>See the part. Select with confidence.</h1>
        <p>Choose a part on the illustration or in the list. Both views stay connected.</p>
        <div className="diagram-demo-context"><strong>Hyundai Creta</strong><span>Service tools · Diagram 153294</span><span>Reference catalog: IGENPA018 · LHD</span></div>
      </header>

      <div className="diagram-demo-banner">
        <p><strong>Real catalog, demo annotations.</strong> Seven catalog rows and the supplied illustration, with hand-drawn selection regions for review. Prices and vehicle fitment are not confirmed by this demo.</p>
        <button type="button" onClick={() => setReview(value => !value)} aria-expanded={review} aria-controls="diagram-demo-review">{review ? 'Close review tools' : 'Review & adjust'}</button>
      </div>

      <div className="diagram-demo-options">
        <fieldset><legend>Highlight</legend>
          <label><input type="radio" name="highlight-mode" checked={mode === 'object'} onChange={() => setMode('object')} /> Physical part</label>
          <label><input type="radio" name="highlight-mode" checked={mode === 'label'} onChange={() => setMode('label')} /> Callout number</label>
        </fieldset>
        <label><input type="checkbox" checked={showRegions} onChange={event => setShowRegions(event.target.checked)} /> Show all clickable regions</label>
      </div>

      <section className="diagram-demo-workspace" aria-label="Interactive diagram and parts list">
        <div className="diagram-demo-left" ref={diagramRef}>
          <div className="diagram-demo-panel-heading"><h2>Assembly illustration</h2><span>600 × 820</span></div>
          <DemoDiagramCanvas parts={parts} selectedId={selectedId} mode={mode} showRegions={showRegions} onSelect={selectFromDiagram} />
          <div className="diagram-demo-selection" aria-live="polite" aria-atomic="true"><Check size={18} /><div><strong>{selected.name}</strong><span>{selected.partNumber} · Callout {selected.callout}</span></div><span className="diagram-demo-selected-tag">Selected</span></div>
        </div>

        <div className="diagram-demo-right">
          <div className="diagram-demo-panel-heading"><h2>Parts in this diagram</h2><span>{parts.length} parts</span></div>
          <p className="diagram-demo-list-help">Select a name or part number to frame it in red.</p>
          <div className="diagram-demo-list" aria-label="Parts">
            {parts.map(part => (
              <button
                key={part.id} type="button"
                className={`diagram-demo-row${selectedId === part.id ? ' is-selected' : ''}`}
                data-part-id={part.id}
                id={`demo-part-${part.id}`}
                aria-pressed={selectedId === part.id}
                onClick={() => selectFromList(part.id)}
                ref={element => { if (element) rowRefs.current.set(part.id, element); else rowRefs.current.delete(part.id) }}
              >
                <span className="diagram-demo-callout">{part.callout}</span>
                <span className="diagram-demo-part-identity"><strong>{part.name}</strong><code>{part.partNumber}</code></span>
                <span className="diagram-demo-part-values"><span>Qty <b>{part.quantity ?? '—'}</b></span><span className="diagram-demo-price">Request price</span></span>
                {selectedId === part.id && <Check className="diagram-demo-row-check" size={17} aria-label="Selected" />}
              </button>
            ))}
          </div>
          <div className="diagram-demo-price-note"><strong>Price column ready for confirmed offers.</strong><p>The API snapshot returns 5.00 for each row without a currency. We show “Request price” until pricing is verified. Quantity means required per catalog, not stock.</p></div>
          <div className="diagram-demo-source"><button type="button" disabled={refreshing} onClick={() => { void refreshParts() }}><RefreshCw size={15} className={refreshing ? 'diagram-demo-spin' : ''} />{refreshing ? 'Refreshing…' : 'Refresh live part data'}</button><p role="status">{status}</p></div>
        </div>
      </section>

      {review && <section id="diagram-demo-review" className="diagram-demo-review" aria-labelledby="diagram-demo-review-title">
        <div><span className="diagram-demo-eyebrow">REVIEW TOGETHER</span><h2 id="diagram-demo-review-title">Make the decisions visible.</h2><p>Change the highlight mode above to compare object framing with callout framing. Adjust this rectangle, then export the proposed mapping for Joe. Edits stay in this browser session.</p></div>
        <div className="diagram-demo-review-grid">
          <div><h3>Selected mapping</h3><p><strong>{selected.name}</strong> · {mode === 'object' ? 'Physical part' : 'Callout number'}</p>
            <div className="diagram-demo-coordinate-fields">{(['x', 'y', 'width', 'height'] as const).map(field => <label key={field}>{field}<input type="number" min={field === 'width' || field === 'height' ? 1 : 0} max={field === 'x' || field === 'width' ? 600 : 820} value={region[field]} onChange={event => updateRegion(field, event.target.value)} /></label>)}</div>
            <p className="diagram-demo-small">Image pixels from top-left · API row {selected.id} · Raw API price: {selected.apiPrice?.toFixed(2) ?? 'Not supplied'} · Currency: not supplied</p>
            <button type="button" onClick={() => { setParts(current => current.map(part => part.id === selectedId ? { ...part, object: { ...demoParts.find(p => p.id === selectedId)!.object }, label: { ...demoParts.find(p => p.id === selectedId)!.label } } : part)); setNotice('Selected part annotations reset.') }}>Reset selected annotations</button>
          </div>
          <div><h3>Confirm for the next iteration</h3><ul><li><strong>PM / stakeholders:</strong> physical-part or callout frame? Is the stacked mobile view clear?</li><li><strong>Joe / data partner:</strong> provide reviewed geometry, stable diagram membership and image revision IDs.</li><li><strong>Commercial team:</strong> confirm price, currency and required-quantity meaning.</li></ul><button type="button" onClick={exportAnnotations}><Download size={16} /> Export review JSON</button></div>
        </div>
        <p className="diagram-demo-notice" role="status">{notice}</p>
      </section>}
      <footer className="diagram-demo-footer">Review prototype · One illustration, seven parts · No backend writes or ordering</footer>
    </main>
  )
}
