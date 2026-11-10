# Homepage vehicle coverage: researched implementation plan

Date: 10 November 2026. The user approved this plan and the panel is now implemented locally. See [implementation and refresh notes](vehicle-coverage-panel.md). The sections below retain the researched recommendation and design rationale.

## Confirmed direction

The user clarified that the project manager had already reviewed the requested vehicle list before sending the follow-up instructions. Use the backend data to resolve uncertain spoken examples, dates and steering terminology. The current verified snapshot contains LHD records; do not introduce RWD as a steering label or copy the unclear example years.

The product goal is a prominent homepage notice showing which vehicles currently have searchable catalog parts. Display make, model, catalog year ranges and steering only. Exclude body, engine, gearbox, market, price and stock details from this panel.

Sources within this project:

- [Voice note and requirements](../voice-note-2026-11-10.md).
- [Full November 9 coverage verification](../vehicle-coverage-verification-2026-11-09.md).
- [Verified vehicle list PDF](../product/Africa%20Autopart%20Vehicle%20Coverage%20-%202026-11-09.pdf).

## Relevant external practices

1. **Keep VIN/part search primary and add a make/model browsing path.** PartSouq's own guide describes part-number, VIN/frame and brand/model lookup. 7zap presents brand catalogs alongside VIN identification. For this project, that supports a coverage browser beside the existing search, rather than replacing search or treating a broad model match as exact VIN fitment. This is an application of those patterns, not a claim that their homepage layouts must be copied. Sources: [PartSouq guide](https://meta.partsouq.com/en/how-to-place-an-order-on-the-partsouq-com-368.html), [7zap catalog](https://7zap.com/en/catalog/cars/).
2. **Do not hide the essential coverage message.** GOV.UK cautions that accordions hide content and are unsuitable for information everyone needs. Keep the notice and supported make names visible. For the present small list, start both make groups expanded and allow users to collapse them. Do not add nested accordions. This default is a project design recommendation, not a required GOV.UK setting. Source: [GOV.UK accordion guidance](https://design-system.service.gov.uk/components/accordion/).
3. **Use an accessible disclosure control.** If using buttons, expose expanded state and the controlled panel, support Enter/Space, and preserve visible keyboard focus. Use native semantics instead of a clickable `div`. Sources: [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [W3C accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).
4. **Reflow the panel on mobile and zoom.** The W3C reflow guidance addresses content fitting a 320-CSS-pixel-wide viewport. Stack the coverage panel near the search on small screens; avoid a fixed overlay and horizontal scrolling. Source: [W3C reflow guidance](https://www.w3.org/WAI/WCAG21/Understanding/reflow).

## Findings from the actual code

| Location | Current implementation | Implication |
| --- | --- | --- |
| `src/frontend/src/pages/HomePage.tsx` | Search is a centred `max-w-4xl` section. No coverage panel exists. | Introduce a responsive search/coverage layout and extract the new panel into its own component. Preserve room for the search input and wrapped example links. |
| `HomePage.tsx`, `getDisplayBrands()` | The logo grid starts with a hardcoded brand list, then adds live makes. | That list is not a supported-coverage source. Align its availability presentation with verified makes so it does not contradict the new notice. |
| `HomePage.tsx`, stats grid | “17,000,000 PARTS IN DATABASE” is hardcoded. | This conflicts with the last audited 38,757 catalog rows unless a separate, defined inventory supports the figure. Recommend removing or verifying the claim; do not substitute a different metric without defining it. |
| `src/frontend/src/pages/BrandPage.tsx` | Paginated model loading and navigation to model parts already work. | Reuse these routes for optional, clearly labelled model-level navigation. |
| `src/frontend/src/pages/parts/PartsSearchPage.tsx` | URL parsing handles VIN/make/model/keyword/group. It does not read year/steering URL filters. | Do not append year/steering parameters and imply the results are filtered. Year-specific navigation needs an explicit extension covering initial fetch, filtering and pagination. |
| `src/frontend/src/api/catalogApi.ts` | Make/model/parts/search wrappers exist; no dedicated coverage aggregation wrapper exists. | A first part page per model is incomplete. It missed additional Creta and Prado configurations in the earlier summary. |
| `src/frontend/src/types/catalog.ts` | Compatibility years, model year and steering are separate fields. | Use backend compatibility fields for the displayed catalog ranges, not VIN-year guesses or the spoken examples. Preserve unknown values explicitly. |
| `src/frontend/src/App.tsx` | TanStack Query is already provided. | A future lightweight coverage endpoint can be cached without adding another state library. |
| `src/frontend/src/components/layout/RootLayout.tsx` | Main content is capped at 1,240px. | Fit the panel inside this shell rather than outside it as a floating sidebar. |
| `src/frontend/src/context/LanguageContext.tsx`, `src/frontend/src/i18n/` | English, French, Amharic and Arabic/RTL support exists. | Add translation keys, use direction-aware alignment and check Arabic layout plus both themes. |

## Recommended visible behaviour

- A compact **Currently covered vehicles** card beside the search area on desktop, approximately 300–340px wide when space permits.
- On tablet/mobile, a full-width card immediately after the search, before statistics and the larger logo catalog grid. Keep the main search first in reading order.
- Always show: “These vehicle categories currently have searchable parts.”
- Use brand heading controls with chevrons: **Toyota · 5 models**, **Hyundai · 2 models**. Show both groups initially because the present list is short; permit independent collapse/expansion.
- Within each group, show a model name and its distinct catalog year/steering entries. Only the make level collapses; no second level of nested interaction is needed.
- Add a small plain-language legend: **LHD = left-hand drive** and **Years shown are catalog coverage ranges**. The panel describes searchable records, not guaranteed stock or every component for every year.
- Keep the verified date available as a small caption when using a dated snapshot.
- Brand controls reveal their lists inline. Model links are optional; if supplied initially, label them as browsing the whole model catalog. Exact year/steering links are outside the initial panel scope because the current results page ignores those parameters.

## Backend-derived content

The November 9 audit found 10 detailed configurations. For the requested simple display, deduplicate only identical `(make, model, compatibilityStartYear, compatibilityEndYear, steering)` tuples. This produces **9 distinct coverage entries under 7 model headings**. Group several entries under one model heading; do not merge overlapping or adjacent intervals into an unverified wider interval.

| Make | Model display | Catalog range(s) | Steering |
| --- | --- | --- | --- |
| Toyota | Fortuner | 2016–2020 | LHD |
| Toyota | Hilux | 2011–2015 | LHD |
| Toyota | Land Cruiser 70 | 2007–2026 | LHD |
| Toyota | Land Cruiser Prado | 2017–2020; 2020–2024 | LHD |
| Toyota | Vios | 2016–2017 | LHD |
| Hyundai | Creta | 2018–2020; 2018–2021 | LHD |
| Hyundai | Santa Fe | 2018–2020 | LHD |

These are dated backend observations, not a fresh November 10 production audit. The display name “Land Cruiser 70” must retain the raw backend model key `LAND CRUISER` if used for existing route navigation.

Do not use `getDisplayBrands()`, `getVehicleModels()` fallback values, the category-group fallback labels, a VIN decoder's year or the current calendar year to construct this list. An unknown year or steering value must remain unknown, not become “Present” or LHD by default.

## Data delivery and freshness

### Recommended backend destination

Provide a small aggregated configuration response, updated with catalog imports. A route such as `GET /api/vehicles/coverage` is a **proposal**, not an endpoint verified to exist. It should expose a timestamp and distinct make/model/year/steering entries derived from records that actually have searchable parts. The route should define how missing metadata and overlapping fitments are represented.

### Practical first version in this frontend repository

Until that aggregation is available, generate a small typed snapshot from the verified backend collection and retain its verification date. Keep it in one dedicated data module and isolate its consumption behind a small coverage data provider so a later endpoint can replace it. Include a documented refresh step whenever new data is seeded.

This is a release snapshot of backend evidence, not invented manual catalog data. Refresh/confirm the verified list immediately before implementation/release. Do not download the full 38,757-record catalog on homepage visits. The November 9 full audit required 194 requests; that is appropriate for an audit job, not a customer-facing widget.

When the remote provider exists, use the existing QueryClient for caching and keep API parsing separate from rendering. Handle loading, genuinely empty coverage and errors separately. Do not convert an API error into “no vehicles covered” or silently present a stale fallback as live.

## Focused implementation sequence

1. Confirm/refetch the small coverage snapshot from backend evidence and create typed data plus its refresh notes.
2. Add `components/catalog/VehicleCoveragePanel.tsx` with accessible make controls, model grouping and the simple fields requested. Reuse existing theme and button styling; no new UI dependency is needed.
3. Adjust the homepage's search area to use a responsive main/aside grid. Ensure the input/main column has `min-width: 0` and supporting links wrap.
4. Add English/French/Amharic/Arabic translation keys, steering labels and RTL-compatible spacing.
5. Align the adjacent logo catalog's availability cues with backend-supported makes. Separately flag the unsupported database-size claim for correction, without expanding this task into unrelated homepage rewrites.
6. Validate data grouping, keyboard controls, visible focus, desktop/mobile positioning, 320px reflow, dark mode and Arabic. Verify optional model links reach existing model pages.
7. Run the required lint/build checks, report existing baseline failures separately, and provide screenshots of the new panel. Publish only when instructed.

## Completion criteria

- Visitors see the current coverage notice near search without opening another page or modal.
- Toyota and Hyundai controls reveal only backend-derived supported entries; unsupported brands do not appear in the coverage panel.
- Displayed years and steering match the selected backend snapshot, including the newer Prado range and both Creta ranges.
- Duplicate detailed configurations do not become duplicate visible rows with identical model/year/steering labels.
- Body type, engine, transmission, stock and price fields do not appear in this panel.
- The main search remains usable at narrow widths, and coverage remains visible on mobile.
- Controls work by keyboard and expose their open/closed state; translations and RTL are supported.
- The data source, verification timestamp and refresh responsibility are recorded in code/docs.
- No year/steering-specific search promise is made without implementing those filters in the results flow.
