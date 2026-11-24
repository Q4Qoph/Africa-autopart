import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { demoDiagram } from '@/data/diagramDemo'
import type { DiagramDemoPart } from '@/data/diagramDemo'
import imageUrl from '@/assets/demo/creta-tools.png'

type Props = {
  parts: DiagramDemoPart[]
  selectedId: number
  mode: 'object' | 'label'
  showRegions: boolean
  onSelect: (id: number) => void
}

export function DemoDiagramCanvas({ parts, selectedId, mode, showRegions, onSelect }: Props) {
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState({ x: 300, y: 410 })
  const [failed, setFailed] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ x: number; y: number; center: typeof center; inverse: DOMMatrix; moved: boolean } | null>(null)
  const dragged = useRef(false)
  const width = demoDiagram.width / zoom
  const height = demoDiagram.height / zoom

  function changeZoom(next: number) {
    const bounded = Math.min(3, Math.max(1, next))
    setZoom(bounded)
    setCenter(current => ({
      x: Math.min(600 - 300 / bounded, Math.max(300 / bounded, current.x)),
      y: Math.min(820 - 410 / bounded, Math.max(410 / bounded, current.y)),
    }))
  }

  function startPan(event: PointerEvent<SVGSVGElement>) {
    dragged.current = false
    if (zoom === 1 || !event.isPrimary) return
    const matrix = svgRef.current?.getScreenCTM()
    if (!matrix) return
    gesture.current = { x: event.clientX, y: event.clientY, center, inverse: matrix.inverse(), moved: false }
  }

  function movePan(event: PointerEvent<SVGSVGElement>) {
    const pan = gesture.current
    if (!pan) return
    if (!pan.moved && Math.hypot(event.clientX - pan.x, event.clientY - pan.y) < 6) return
    pan.moved = true
    dragged.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = new DOMPoint(pan.x, pan.y).matrixTransform(pan.inverse)
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(pan.inverse)
    setCenter({
      x: Math.min(600 - width / 2, Math.max(width / 2, pan.center.x + start.x - point.x)),
      y: Math.min(820 - height / 2, Math.max(height / 2, pan.center.y + start.y - point.y)),
    })
  }

  function focusPart() {
    const region = parts.find(part => part.id === selectedId)?.[mode]
    if (!region) return
    const next = 2
    setZoom(next)
    setCenter({
      x: Math.min(600 - 300 / next, Math.max(300 / next, region.x + region.width / 2)),
      y: Math.min(820 - 410 / next, Math.max(410 / next, region.y + region.height / 2)),
    })
  }

  return (
    <div className="diagram-demo-canvas-panel" ref={panelRef}>
      <div className="diagram-demo-tools">
        <div className="diagram-demo-zoom" role="group" aria-label="Diagram zoom">
          <button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => changeZoom(zoom - 0.5)}><ZoomOut size={18} /></button>
          <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
          <button id="demo-zoom-in" type="button" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => changeZoom(zoom + 0.5)}><ZoomIn size={18} /></button>
          <button id="demo-reset-view" type="button" aria-label="Reset diagram view" onClick={() => changeZoom(1)}><RotateCcw size={17} /></button>
        </div>
        <div className="diagram-demo-zoom">
          <button type="button" onClick={focusPart}>Find selected</button>
          <button id="demo-fullscreen" type="button" aria-label="Toggle diagram fullscreen" onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
            else void panelRef.current?.requestFullscreen?.().catch(() => undefined)
          }}><Maximize2 size={17} /></button>
        </div>
      </div>
      {failed ? <div className="diagram-demo-image-error" role="alert">The demo diagram could not load. You can still review the parts list.</div> : (
        <svg
          ref={svgRef}
          className="diagram-demo-svg"
          viewBox={`${center.x - width / 2} ${center.y - height / 2} ${width} ${height}`}
          style={{ touchAction: zoom > 1 ? 'none' : 'pan-y', cursor: zoom > 1 ? 'grab' : undefined }}
          aria-labelledby="diagram-demo-title diagram-demo-description"
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={() => { gesture.current = null }}
          onPointerCancel={() => { gesture.current = null; dragged.current = false }}
        >
          <title id="diagram-demo-title">Hyundai Creta service tools, interactive illustration</title>
          <desc id="diagram-demo-description">Select an outlined part to highlight its list entry. Use Tab and Enter for keyboard selection. These are manually drawn demo regions.</desc>
          <image href={imageUrl} width="600" height="820" onError={() => setFailed(true)} />
          {[...parts].sort((a, b) => b[mode].width * b[mode].height - a[mode].width * a[mode].height).map(part => (
            <rect
              key={part.id}
              {...part[mode]}
              rx="3"
              className={`diagram-demo-region${selectedId === part.id ? ' is-selected' : ''}${showRegions ? ' show-region' : ''}`}
              vectorEffect="non-scaling-stroke"
              role="button"
              tabIndex={0}
              aria-label={`Select ${part.name}, part ${part.partNumber}, callout ${part.callout}`}
              aria-pressed={selectedId === part.id}
              data-region-id={part.id}
              id={`demo-region-${part.id}`}
              onClick={() => { if (!dragged.current) onSelect(part.id) }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(part.id) }
              }}
            ><title>{part.callout} · {part.name} · {part.partNumber}</title></rect>
          ))}
        </svg>
      )}
      <p className="diagram-demo-canvas-note">{zoom > 1 ? 'Drag to pan · Reset to see the complete diagram' : 'Click or tap a part · Use + to inspect the smaller tools'}</p>
    </div>
  )
}
