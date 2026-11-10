# Homepage vehicle coverage panel

The homepage now shows a coverage card beside search on desktop and immediately below search on smaller screens. Toyota and Hyundai groups start expanded and can be toggled independently with a mouse, Enter or Space. The card shows model names, distinct catalog year ranges and steering only.

## Data and ownership

`src/frontend/src/data/vehicleCoverage.ts` contains the typed backend-derived release snapshot and `getVehicleCoverageSnapshot()` provider. The source audit is documented in [the November 9 verification](../vehicle-coverage-verification-2026-11-09.md). Ten detailed configurations collapse to nine distinct model/year/steering entries under seven models. The separate Creta ranges and Prado ranges remain separate; identical visible entries are deduplicated.

The panel displays the verification date because this is a dated catalog snapshot, not a live inventory guarantee. It does not fetch all part pages in customer browsers. The adjacent catalog grid and model-count tile use the same snapshot so their supported makes agree with the notice. The two old, unmatched VIN examples on the homepage were replaced with the verified Creta and Land Cruiser examples.

The release snapshot was revalidated on **10 November 2026 at 19:25 UTC**. All 194 pages reconciled to 38,757 unique records and the same nine distinct model/year/steering entries across seven models. The audit retried connection resets and an incomplete JSON response; the verification date was advanced only after the full collection succeeded.

Coverage means that matching catalog records were verified. It does not certify stock, every component for a vehicle, or every intervening model year. Year ranges come from backend compatibility metadata, while LHD/RHD come from backend steering values. Null metadata is displayed as unspecified; it is not converted to LHD or “Present.”

## Refresh after catalog imports

The frontend maintainer should refresh this snapshot with the backend owner whenever searchable coverage changes:

1. Obtain a current distinct configuration export from the backend, or run a bounded, read-only audit of all pages from `/api/vehicles/search`. The audited service accepts `pageSize=200`; confirm the server's actual returned page size and total pages rather than assuming a limit.
2. Reconcile row totals and unique record IDs, and verify that pagination represents a consistent snapshot. Retry failed/truncated responses; never publish a partial collection as complete coverage.
3. Keep records with searchable parts. Group using raw make/model keys, compatibility start/end years and steering. Preserve separate intervals instead of merging overlapping ranges into a wider claim.
4. Update the data module's makes, models, ranges and `verifiedAt` only after successful verification. Keep raw backend model keys distinct from display labels (for example, `LAND CRUISER` versus “Land Cruiser 70”). Do not advance an end year just because the calendar year changed.
5. Update the verification evidence and verify representative VIN/model searches. Run build/lint and inspect the panel in all supported languages and on mobile.

If a small backend aggregation endpoint becomes available, replace the snapshot provider with a validated fetch/cache layer using the existing QueryClient. Keep the rendering component's data contract separate. Distinguish loading, empty and error states; do not silently mislabel a stale snapshot as live data. No coverage aggregation endpoint is assumed to exist by this implementation.

## Implementation files

- `src/frontend/src/components/catalog/VehicleCoveragePanel.tsx`: accessible disclosure controls, model list, steering definitions, date and scope note.
- `src/frontend/src/data/vehicleCoverage.ts`: immutable typed snapshot and provider.
- `src/frontend/src/pages/HomePage.tsx`: responsive placement, supported catalog links and snapshot model-count tile.
- `src/frontend/src/i18n/locales/{en,fr,am,ar}/home.ts`: all new customer-facing text and plural model counts.

The panel's brand links open the existing brand catalog. It does not append year/steering URL filters that the current results page ignores. No new dependency, route or backend mutation was added.

## Verification

- Production build passed. Existing bundle-size and Browserslist-age warnings remain.
- ESLint passed for all changed application files. Full-repository lint reports 13 existing errors and 15 warnings outside those files.
- Browser checks passed: seven models/nine ranges, independent disclosures, Space/Enter, `aria-controls`, widths 320/390/768/1024/1440, French/Amharic/Arabic, RTL and dark mode, and availability of the dated snapshot with the backend blocked.
- Existing Toyota catalog navigation and the updated Creta VIN example returned live results from the local frontend.

Screenshots:

- [Desktop](screenshots/vehicle-coverage-desktop.png)
- [Mobile](screenshots/vehicle-coverage-mobile.png)
- [Arabic / dark mode](screenshots/vehicle-coverage-arabic.png)

Implementation is local and has not been deployed.
