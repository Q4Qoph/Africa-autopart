# Interactive assembly diagrams — requirements and implementation plan

Status: proposal for review, 16 November 2026. No application code changed.

## Stakeholder requirements

- Desktop: photo/diagram on the left, matching parts list on the right.
- Selecting a part name or number in the list frames the corresponding image region in red.
- Selecting a part region in the image highlights its corresponding list entry.
- Each part has a number, name, quantity, price and image coordinates.
- Works on mobile and desktop.

## Verified current state

The active flow uses `api/catalogApi.ts`, `pages/parts/PartsSearchPage.tsx` and the same page through Shop. It displays catalog cards and a single-part details modal with image/fullscreen viewing. It does not implement mapped assembly interaction. `components/catalog/PartImage.tsx` already handles missing/broken images.

`types/catalog.ts` has part identity, PNC, quantity, optional picId and imageUrl, but no hotspot geometry, stable diagram relationship or typed price. Live GET `/api/vehicles/search?page=1&pageSize=2` and GET `/api/vehicles/parts/1` return price=5 and imageUrl=null for the sampled rows, without diagram IDs or coordinates. This is a sample, not an audit of all rows. Currency and whether those prices are genuine offers remain unverified. Quantity is catalog quantity, not available stock.

Legacy `types/vin.ts` declares x/y coordinate fields. `api/vinApi.ts` includes older routes; declarations do not prove working production data. Current Swagger defines `CatalogDiagram` and `CalloutMapping`: diagram identity/revision/image references, callout codes, part IDs, percent x/y, percentage bounding boxes and pointer lines. This is promising reuse, but populated records and their delivery to the active frontend remain unverified. No dedicated public diagram retrieval path was identified in the inspected Swagger paths. A GET probe of `/api/Vin/search/{vin}` did not provide a payload; Swagger documents POST for that operation, so this probe is not evidence that the documented operation fails. No POST was performed for this study.

Evidence: adjacent catalog sample, detail sample and extracted Swagger schemas. Existing VIN matching limitations remain separate: a clickable illustration cannot establish vehicle fitment.

## Research and design implications

- [Parts-Catalogs documentation](https://www.parts-catalogs.com/doc/us/part_selection_page.htm) describes diagram-number selection highlighting both list and diagram, plus separate access to pricing. Adopt synchronized selection and retain an explicit diagram callout alongside the commercial part number.
- [PartSouq guide](https://meta.partsouq.com/en/how-to-place-an-order-on-the-partsouq-com-368.html) supports selecting through numbered entries or the diagram. Keep both paths usable.
- [W3C image-map guidance](https://www.w3.org/WAI/tutorials/images/imagemap/) warns that coordinates must scale with mobile images and recommends equivalent text links. Keep the parts list fully usable without the picture.
- [MDN SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox) documents a scalable coordinate system. Recommendation: render image and overlay inside the same SVG viewBox, rather than separately scaling fixed screen coordinates.
- [WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies a 24 CSS pixel minimum with exceptions. Aim for 44-pixel touch controls where space allows; dense diagram regions need zoom and equivalent accessible list controls.

## Proposed interaction

Open an assembly diagram from a search result or subgroup without replacing global search with one arbitrary image. A subgroup can contain multiple illustrations; imageUrl equality, subgroup name, PNC or part number alone must not establish diagram membership.

Desktop: approximately half-width illustration on the left, list on the right, scoped to the current diagram and vehicle/catalog context. Display callout, number/name, quantity and unit-price/currency columns. Selecting name/number selects the part; a separate labeled control copies the number. Preserve search state when entering/leaving the viewer.

Mobile proposal: diagram above stacked part rows, selected-part summary and an explicit full-screen viewer. Provide zoom buttons, reset and optional pan/pinch. Avoid forcing desktop columns into a narrow viewport. This changes the spatial layout while preserving both-way selection and needs PM confirmation.

One parent owns selected part IDs and callout ID. List selection highlights every verified region for that part and reveals it in the viewer. Region selection reveals the matching list entry. If one callout represents several alternatives, highlight/show the candidates and ask the user to select; never silently select the first. One part may have multiple regions. Hover is supplementary; click, tap and keyboard must work. Red border plus a selected label/focus cue avoids color-only feedback. Do not steal keyboard focus on selection; scroll the relevant panel only when needed, respecting reduced motion.

Persist diagram/selected-part context in the URL if supported by the agreed API IDs. Reset selection on diagram/configuration changes and isolate stale network responses. Fullscreen uses the same selection and geometry.

## Data contract to agree with Joe

Reuse existing diagram/callout entities where suitable; do not introduce duplicate models solely for this screen. Supply a diagram-scoped DTO containing:

- Diagram ID, revision, title, assembly/configuration applicability, accessible image URL and original width/height.
- Catalog part IDs, callout labels, number, name, nullable required quantity and unit, nullable unit price plus currency and source/status. Separate available stock from required quantity.
- Hotspot ID, diagram ID/revision, callout code, associated part IDs and bounding rectangle; optional polygon for irregular objects. Define origin, unit and whether geometry encloses the actual object or a printed callout label.
- Recommended percent rectangle convention: top-left origin, x/y/width/height in 0–100, bound to the uncropped source image. Convert to original-image coordinates for the SVG viewBox. Reject non-finite, negative, zero-size and out-of-bounds geometry.
- Full diagram membership and how filtered/paginated rows can be revealed. An image click must not fail because its row is on another page.

Proposed endpoints, not existing API claims: diagram lookup by part/configuration; diagram details with mappings; diagram-scoped parts with documented pagination. Actual routes should follow Joe's backend conventions. Do not join unrelated source-record IDs or deduplicate alternatives simply by part number.

An x/y point permits a marker; it cannot accurately frame an object without extent data. If source imports lack geometry, obtain provider mapping files or create manually reviewed annotations. OCR may assist label discovery, but cannot reliably establish physical part boundaries or fitment without review. An annotation tool is a separate scope decision. Image replacements/crops require geometry revalidation and versioning.

## Implementation sequence

1. **Data readiness — Joe + frontend:** select one real assembly with a working image and 10–20 mapped rows. Validate all IDs, geometry, alternatives, quantity semantics and price/currency. Agree object vs callout framing and mobile layout. Produce one approved DTO fixture and endpoint contract.
2. **Frontend pilot:** add typed diagram DTOs and an API adapter; focused `AssemblyDiagramViewer`, `DiagramCanvas`, `DiagramPartsList` and shared selection hook. Use existing React/TypeScript, React Query and UI styles. Native SVG supports the initial viewer without an added graphics framework. Fixtures must be marked as demo; no fabricated production coordinates/prices.
3. **Integration:** open from relevant catalog rows/subgroups in search and Shop; load the correct diagram and contextual rows. Keep standalone part-number search usable. Missing diagram/mapping uses the current list and placeholder; missing prices show Request price, never a default zero or an unverified seeded price.
4. **Verification:** geometry mapping and ID resolution tests; real-image browser checks for both selection directions, multiple regions/alternatives, filtered/off-page rows, zoom, resize, orientation, fullscreen, keyboard, RTL, touch, stale requests, broken images and invalid/missing mappings. Run lint/build and report existing baseline issues separately.
5. **Rollout:** pilot one verified assembly, then audit and enable additional diagrams with mappings. Measure which assemblies have working images and verified hotspots. Keep partially mapped diagrams honest: unmapped rows remain selectable but cannot claim an image highlight.

## Acceptance criteria

- Selecting a mapped row produces a red frame around its agreed region(s), accurately positioned after resizing/zooming.
- Selecting a region highlights/reveals its corresponding row or explicit alternative group, without changing vehicle context.
- Required fields are displayed, with truthful unavailable states for absent quantity/price. Coordinates remain implementation data unless an annotation/review mode is requested.
- Selection works on desktop and mobile without hover; list and viewer remain keyboard accessible.
- Unmapped/broken illustrations never receive invented rectangles. Wrong-revision mappings are rejected.
- Global search, VIN safeguards, quotations and navigation continue working.

## Decisions needed before production implementation

1. Does red framing surround the physical object or printed callout? Are both photos and exploded diagrams in the first release?
2. Can Joe provide populated existing CalloutMapping records, including bounding boxes, linked to active catalog part IDs?
3. Are current price=5 values real or placeholders; what is the currency, supplier and price policy? Is request-price acceptable where unavailable?
4. Does quantity mean required per assembly, quantity to order, or stock? Recommendation: label required quantity explicitly and keep order quantity separate.
5. Approve stacked mobile layout and choose the first verified assembly for the pilot.

Recommendation: approve data contract and one real mapped assembly before coding production interaction. This is primarily a diagram-to-part data relationship requirement with a manageable frontend viewer, rather than merely a page-layout change.
