# Shared catalog search implementation

Implemented 12 November 2026 following `search-implementation-plan.md`. No backend deployment or database mutation is part of this change.

## Shipped frontend behavior

- One search form and typed URL state across homepage, direct search and model routes. Modes: Auto, VIN, Part number, Part name and explicit PNC. Vehicle make/model/year/steering and audited configuration selection are optional. A standalone number/name does not inherit a vehicle from its first result.
- Auto recognizes known vehicle makes/models and make-prefixed part input. An explicit number mode overrides VIN-shaped input. Identifiers retain leading zeros, letters and suffixes.
- Exact VIN search keeps its strict row-VIN guard. Useful partial decoder fields remain available even when NHTSA success is false. Exact catalog identity takes precedence over conflicting generic decoder identity; ambiguous unsupported decoded years remain unknown. Verbose validation messages remain hidden.
- Unseeded VINs lead to guided catalog selection. Customer VIN and reference catalog VINs are separate. Selecting a catalog uses its compatibility/configuration filters without constraining the request to the unseeded VIN. A conflicting decoded make requires clearing the VIN before changing make.
- Repeated part searches, result filters, assembly selections, sorting and pagination retain scope. URL persistence supports reload, history and shareable links. Async queries have separate cache keys, stale-result isolation and catalog-request cancellation. Catalog requests have a 20-second timeout and explicit retry rather than unrestricted fallbacks.
- Live `/api/vehicles/categories` supplies vehicle make/model options. A dated ten-configuration index generated from the reconciled catalog supplies configuration details absent from categories. The index must be refreshed after imports. The customer browser does not collect the whole catalog.
- `/api/vehicles/parts/{id}` powers catalog modal details, retaining the initial preview if the detail request fails. It is separate from legacy PartsSeed product IDs.
- Missing diagrams have an explicit unavailable state. Catalog price/stock assertions were replaced with a price-and-availability request link. Request links prefill supported form fields via URL, including customer VIN and part number, without creating an order or payment.
- New search controls/messages support English, French, Amharic and Arabic; RTL/mobile layout and labeled form controls are included. Cards are keyboard-operable and modal focus is contained/restored.

## Files

`lib/catalogSearch.ts` owns input classification, canonical URL serialization, request construction and guarded result handling. `hooks/useCatalogSearch.ts` coordinates React Query and VIN lookup. `components/catalog/CatalogSearchForm.tsx` provides the shared form. `data/catalogConfigurations.ts` is the dated configuration snapshot; `i18n/searchMessages.ts` provides translations. HomePage and PartsSearchPage use this flow instead of duplicated request branches.

URL fields include q, mode, vin, scope, make, model, year, steering, engineFamily, vehicleSeries, transmission, marketSpec, filter, groupName, sort and page. `vin` is customer context; only scope=vin sends it as an exact catalog filter. `scope=catalog` requires make/model context. `year` means compatibility-year search; it is not the source `modelYear` filter.

## Verified API semantics and limitations

Read-only contract checks confirmed:

- partNumber=091110K190 returns two reference-VIN records; partNumber=091110K returns four, and partNumber=0K190 returns 38. The backend uses contains matching. UI labels identify this; exact-match global ranking is not claimed without a backend exact-match/ranking contract.
- A formatted 09111-0K190 returns zero. The UI offers an explicit retry without separators rather than silently rewriting the identifier. This is a user-selected alternative, not proof all hyphens are insignificant.
- Keyword matching is case-sensitive. Raw lowercase `oil filter` returns zero. The coordinator normalizes Toyota keywords to uppercase and Hyundai keywords to title case; global keyword results use disjoint make partitions, count them, and fetch only pages needed for the requested 48-row window. Counts/pagination are stable without downloading all matching rows. Results are grouped by make and sorting applies within each make. A case-insensitive backend query would remove these extra count/window requests. Unknown phrases offer explicit individual-word searches; full fuzzy/word-order-independent matching is not claimed.
- PNC search works; it remains distinct from part-number search.
- Part-number sorting works with sortBy=partNumber and sortDescending.
- Search model=LAND CRUISER also includes Prado. The verified single Land Cruiser 70 context adds its exact source series filter, including model-only direct URLs. New ambiguous model families require updated configuration data or an exact-model backend contract.

Counts remain catalog-record counts with server pagination. Deduplicating product totals or assembling complete facets across all pages requires backend aggregation. Groups are labeled as groups on the current page and retain the active group. No fake complete category list or calls to the failing /api/parts/groups endpoint are used.

Automatic OEM configuration confirmation for arbitrary unseen VINs, full production-month/option fitment, complete images, replacement validation, aftermarket-brand filtering, and verified supplier offers remain backend/data dependencies. Guided browsing is available now without pretending those capabilities exist. Shop now explicitly uses the same populated catalog search view, with paginated full-catalog browsing as its default. Its search, filters, details and quote actions share the main catalog flow. PartsSeed is no longer used by Shop; the legacy standalone PartsSeed detail route is separate. The full-catalog opt-in is isolated in query cache keys and cannot bypass VIN or missing-configuration guards.

## Verification commands

From the repository root, after frontend dependencies are installed:

```bash
node tests/frontend/catalogSearch.test.mjs
node tests/frontend/resolveVin.test.mjs
```

The tests use Node's built-in runner and the project's TypeScript compiler. No new dependency was installed. Browser checks use Chromium DevTools directly and perform catalog reads only:

```bash
# Start the frontend Vite app in another terminal.
CHROMIUM_PATH=/path/to/chrome AAP_TEST_URL=http://127.0.0.1:5175 node tests/frontend/catalogSearch.browser.mjs
```

Browser artifacts default to `/tmp/aap-search-checks/`. Tests intentionally use current API response fixtures/counts; catalog imports may require updating the expected counts. Test inputs include a synthetic unseeded VIN to check guided flow; this is not verification of that synthetic vehicle's existence or fitment.

Run `npm run lint` and `npm run build` from `src/frontend`. Validation results and screenshots are saved alongside this document after final verification. Existing unrelated lint errors and build bundle-size/Browserslist warnings must be reported separately.


## Final verification — 12 November 2026

- 31 focused checks passed: 22 search-domain checks and 9 VIN-resolution checks.
- 20 end-to-end Chromium scenarios passed against the local Vite app and live read-only API. The final run needed zero retries. Scenarios cover global/scoped part queries, explicit broadening/history, useful partial Kia decoding, shared-URL make conflicts, unseeded guided catalog selection, retained filters/year/engine/steering, pagination/sort, Land Cruiser/Prado separation, detail quotation action, exact VIN persistence, ambiguous identifier modes, formatted numbers, PNC, decoder/catalog failures, lowercase multiword search across makes, invalid VIN, French/Amharic and Arabic mobile RTL.
- Production build passed. Existing large-bundle and old Browserslist-data warnings remain.
- Changed-file ESLint has no errors and one pre-existing modal-navigation hook warning. Full-project lint remains blocked by 12 unrelated errors and 15 warnings.
- Whitespace/diff checks passed. No dependency, backend, production database or deployment changes were made.

Evidence and screenshots: `search-verification-2026-11-12/`. The browser suite verifies catalog discovery, not OEM certification of individual part fitment. A genuine independently verified unseeded Fortuner should still be used for the production acceptance pilot; the automated synthetic VIN exercises the guided UI and query scoping only.


## Shop follow-up

`/shop` requests `/api/vehicles/search?page=1&pageSize=48` by default and displays all 38,757 catalog records through pagination. The header link resets to that full catalog. Explicit full-catalog browsing is a Shop-only opt-in; empty ordinary search and VIN failure paths remain guarded. Old `search` query links remain accepted. Two focused domain tests cover the opt-in and retained safety guards.

Shop follow-up verification: 24 search-domain checks and 9 VIN checks pass; three focused browser scenarios pass (full catalog, pagination/search/details/SVG placeholder, and reset/cache isolation). Production build passes. Full lint remains at the existing 12 unrelated errors and 15 warnings. Evidence: `search-verification-2026-11-12/shop-browser-evidence.json`.
