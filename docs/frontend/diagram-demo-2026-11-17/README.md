# Interactive diagram review demo

Open `/demo/parts-diagram` on the Vite app. The local verification server uses `http://127.0.0.1:5175/demo/parts-diagram`. This route is separate from the normal catalog screens and has no main-navigation link. No backend writes, orders, new dependencies or deployment are involved.

## What works

- Seven real Creta service-tool catalog rows with a bundled copy of the seeded `153294.png` diagram.
- Parts on the left and list on the right on desktop; diagram above list on mobile.
- List-to-image and image-to-list selection, red frames, keyboard Enter/Space and selected-state announcements.
- Physical-object versus printed-callout highlighting, with independently drawn rectangles.
- Optional idle hotspot outlines, zoom/reset, find-selected, drag-to-pan when zoomed and browser fullscreen.
- Review tools to edit the selected rectangle in original-image pixels, reject invalid/out-of-bounds geometry, reset annotations and export a review JSON file.
- Optional read-only refresh through seven `/api/vehicles/parts/{id}` calls. Updated rows must retain their expected ID, part number, PNC, source VIN and image URL before they are accepted. Failed/changed rows retain the snapshot.
- Missing image message and a usable list. Failed backend refresh leaves the demonstration usable.

## Demo boundaries

The image and row data were observed on 17 November 2026. Rectangles are manually drawn local review annotations, not backend-supplied or OEM-certified mappings. The complete seven-part snapshot is bundled so the initial demonstration has no backend dependency; it is not an installed offline/PWA application.

The API provides 5.00 without currency for these rows. Customer-facing price cells therefore say Request price; the raw value is available in review tools. Required quantity is distinct from stock. The demo does not verify arbitrary VIN compatibility, represent alternative-callout workflows, or make other illustrations interactive. Those remain later scope.

Edits live in React state and reset on reload/navigation. Export creates a local download; it does not save mappings to Joe's database or define an agreed import format. It provides concrete geometry to discuss and adapt to the backend contract. The English demo sets its own language/direction; full product translation is outside this pilot.

## Five-minute meeting walkthrough

1. Select Jack Assembly in the list; show the corresponding red object frame.
2. Tap the Tool Box in the image; show the highlighted row and selected-part summary.
3. Switch Physical part / Callout number. Ask stakeholders which framing they want. Use both as evidence rather than debating an abstract mockup.
4. Zoom, pan, Find selected and fullscreen. Repeat selection at phone width.
5. Open Review & adjust, move a rectangle and export JSON. Show Joe the image dimensions, part IDs, callouts and geometry.
6. Discuss price/currency, required quantity, geometry ownership, mobile layout and how full-catalog diagram membership should be returned.

No participant needs to approve the current annotations as production truth to evaluate the interaction. The next deliverable is an agreed mapped assembly contract and reviewed annotation sample.

## Files

- `src/frontend/src/data/diagramDemo.ts`: typed seven-row snapshot and separate object/label rectangles.
- `src/frontend/src/assets/demo/creta-tools.png`: exact seeded/source illustration, bundled unchanged.
- `src/frontend/src/components/catalog/DemoDiagramCanvas.tsx`: SVG overlay, selection, zoom/pan and fullscreen.
- `src/frontend/src/pages/parts/DiagramDemoPage.tsx` and `diagramDemo.css`: review page, live refresh, session editing/export and responsive layout.
- Router: a lazy-loaded public demo route.

## Verification

14 Chromium scenarios passed, including real pointer/keyboard/touch input, both selection directions, mode switching, coordinate edit/reset/bounds checking, downloaded JSON inspection, zoom/pan/fullscreen, all seven successful live detail requests, simulated API failure and 390-pixel mobile layout without horizontal overflow. Browser evidence and desktop/mobile screenshots are adjacent to this document. The mobile screenshot includes the intentionally simulated refresh failure, demonstrating snapshot resilience.

Production build and existing focused search/VIN test files pass. New/changed TypeScript files have no ESLint errors; the router retains its three existing refresh warnings. Full lint has the existing 12 unrelated errors and 15 warnings; the temporary extra router warning introduced during development was removed. Existing bundle-size/Browserslist warnings remain.

Reproduce from repository root with Vite running on port 5175:

```bash
CHROMIUM_PATH=/path/to/chrome node tests/frontend/diagramDemo.browser.mjs
```

The test defaults to `http://127.0.0.1:5175`; `AAP_TEST_URL` and `AAP_TEST_OUTPUT` can override server and artifact paths. Browser checks need local socket permissions and public API access for the successful-refresh case. Snapshot interactions themselves do not need API access.
