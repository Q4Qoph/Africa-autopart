# Backend discussion with Joe — 12 November 2026

## Opening

We have catalog data and can browse it by configuration. The remaining gap is safely mapping an unseen customer VIN to a covered configuration. Our live tests show partial decoding and broad fallback results; we need to distinguish those from confirmed fitment.

## Evidence to review together

Eight published VINs, three read-only requests each: all HTTP 200, all exact VIN searches zero, all NHTSA success=false. Full URLs and payloads: [published VIN evidence](published-vin-tests-2026-11-12/evidence.json).

1. GET /api/vehicles/vin/JTEBH3FJXKK204701?page=1&pageSize=1 returns matchedInCatalog=true and 21,572 rows. Its first item is a Fortuner, although the sourced vehicle is a Prado. GET /api/vehicles/search?vin=JTEBH3FJXKK204701&page=1&pageSize=1 returns zero.
2. GET /api/vehicles/vin/JTEBR3FJ3R5029536?page=1&pageSize=1 returns matchedInCatalog=true and 8,049 rows. The separately filtered Prado 2.8 configuration returns 4,305 rows. What fallback criteria produce the broader result?
3. JTEBH3FJ20K208013 partially decodes as Land Cruiser, 2000cc gasoline; the published catalog describes Prado 3.0 diesel. Partial external decoder fields must not establish fitment.
4. Separate configuration searches return populated catalogs. This demonstrates catalog availability, not compatibility certification or unique saleable-part totals.

## Questions for Joe

- What exact query and fallback rules does the VIN endpoint execute? Does matchedInCatalog mean exact source VIN, make/year candidates, or confirmed configuration?
- Do imports retain source VIN, model code, market, steering, engine, transmission, production dates and option applicability as structured fields? Which are unavailable?
- Can the backend resolve arbitrary VINs through an OEM/provider mapping? If unavailable, can it expose candidate configurations for explicit user selection?
- Are row counts source records or distinct parts? How should parts shared across seed VINs be aggregated without losing applicability?
- Can we add exact model/configuration filters, case-insensitive keyword search, global assembly facets and documented part-number matching?
- Which image references are imported, which resolve publicly, and how are missing images represented?

## Proposed backend contract (not currently implemented)

Separate decoded identity from catalog resolution. Return an explicit resolution status such as exact_source_vin, confirmed_configuration, candidates, no_coverage or decoder_unavailable. Include match basis, configuration ID, source catalog VINs and unresolved attributes. Return candidate parts only with an explicit candidate scope; do not label make/year fallback as VIN-compatible.

Expose a server-owned configuration/coverage endpoint with stable IDs and structured market, steering, engine, transmission and production range. Search by configuration ID. Preserve customer VIN separately from reference catalog VINs. Model year and production date should remain distinct.

## Frontend available now

Shared part-name/number/PNC/VIN search; strict exact-VIN row guard; guided configuration browsing for unseen VINs; Shop uses the paginated catalog; catalog details, quotation links and missing-image placeholder. The frontend does not certify arbitrary VIN fitment. Its configuration list is currently a dated local snapshot that needs refreshing after imports.

## Acceptance checks to agree

- Seed VIN returns its own catalog records.
- Unseeded covered VIN returns a confirmed configuration only when supported by mapping evidence; otherwise offers candidates for user selection.
- A Kia VIN never silently receives a Toyota catalog.
- Prado does not receive Fortuner results under a confirmed VIN match.
- Similar vehicles with different market, engine, steering or production range remain distinguishable.
- Unknown/unsupported VIN, partial decoding, provider timeout and empty catalog have distinct responses.
- Part-number-only search works without vehicle context; configuration-scoped searches retain their scope.

## Desired outcome

Agree the match-status contract first, assign backend and frontend owners, and choose one independently verified unseeded Fortuner plus a mismatched vehicle as the pilot. Expand after those acceptance checks pass. The contract and timeline need Joe’s agreement; the above is a proposal, not a backend implementation claim.
