# Search and coverage implementation plan

Status: implementation plan following approval of the coverage-search recommendation. Prepared 12 November 2026. No application code changes in this step.

## 1. Product objective

Customers can find catalog parts by VIN, vehicle selection, a part name/description, or a part number. Vehicle filters are optional for global part searches. A previously unseen VIN can lead to an existing covered catalog when its vehicle identity is known or confirmed. Preserve the distinction between exact VIN records, confirmed configuration identification, broader catalog browsing, and confirmed individual part fitment.

The decoder is useful even when incomplete. Evaluate each returned field and its provenance. Do not discard all identity fields because NHTSA success is false or a check digit warns. Do not treat all fields as reliable merely because HTTP status is 200. Keep the detailed check-digit/NHTSA wording out of the customer banner, as requested.

## 2. Existing capabilities and boundaries

Use the populated `/api/vehicles` catalog. Working capabilities include makes, models, vehicle categories, model parts, filtered search and individual catalog details. The existing search accepts keyword, partNumber, PNC, make/model, year/modelYear, steering, engine, transmission, series, market and assembly filters; exact matching/normalization/combination behavior must be contract-tested before each feature relies on it.

Confirmed distinction: Fortuner/LHD/year=2018 returns 8,978 rows based on compatibility metadata; modelYear=2018 returns zero because source model year is 2019. Matching engineFamily=2GD-FTV works; 1GD-FTV returns zero. These tests do not prove part-level applicability for every production month or option.

`/api/vehicles/categories` returns make/model groups, observed year/steering variants and counts. It does not currently return a full configuration inventory or assembly tree. `/api/parts/groups` returns 404. `/api/PartsSeed` is separate and empty. No new resolver/configuration endpoint is assumed to exist.

Vehicle make and vehicle brand mean the same selector in the first release. A part manufacturer's brand is a separate attribute: the current make/oem fields do not establish aftermarket-brand coverage. Do not add a misleading part-brand filter or equate Bosch with vehicle make. Enable that filter only when Joe supplies the corresponding data and contract.

## 3. Search experience

Provide one main search field with Auto, VIN, Part number and Part name modes. Default Auto keeps common entry simple; an explicit mode resolves ambiguity. Offer optional vehicle filters through a compact vehicle selector, showing active selections as removable chips. Existing vehicle/model browse links feed the same search state.

Examples: VIN; `091110K190`; `JACK`; part number with Toyota selected; `oil filter` with a selected vehicle. Search by part number or name must work with no vehicle selection. Recognize known make/model terms conservatively and propose structured selections; do not promise unrestricted natural-language understanding or silently discard unrecognized words.

In Auto mode, a VIN-shaped 17-character value triggers VIN lookup, with a visible way to switch to Part number for ambiguous identifiers. Explicit VIN mode validates length/characters before requesting. An identifier-like alphanumeric term tries part-number search first; ordinary words/phrases use keyword search. Numeric-only input remains a string, preserving leading zeros. A short numeric code can be a PNC: present an explicit PNC option/filter instead of silently claiming it is an OEM part number.

Keep original input for display. Trim surrounding whitespace; uppercase VIN. Preserve meaningful part-number letters, leading zeros, hyphens and suffixes. Only perform alternate separator normalization after contract verification, with the original query retained. Never expand an unknown number to a guessed supersession/interchange.

## 4. Shared search state and architecture

Introduce a typed search domain and one request builder/coordinator reused by HomePage, PartsSearchPage and vehicle/model browsing. Suggested focused modules are `types/search.ts`, `lib/searchIntent.ts`, `lib/searchQuery.ts` and `lib/resolveCatalogSearch.ts`; retain and adapt the existing `lib/resolveVin.ts`. Names can follow repository conventions during implementation.

State includes input/mode; customer VIN; decoder evidence and conflicts; selected vehicle/configuration; exact versus catalog scope; part query; assembly filters; sorting; page and page size. Use discriminated result states rather than inferring identity from the first product.

Suggested scopes:

- `exactVin`: all displayed catalog records must carry the requested VIN.
- `catalog`: known/confirmed coverage criteria, with source VINs kept separate from customer VIN.
- `globalParts`: part search without a selected vehicle.

Suggested resolution states: loading, exact match, selected/identified catalog, needs confirmation, unsupported vehicle, empty part results, invalid input, service error. Configuration identification and individual part-fitment evidence are separate; a selected catalog is not a guaranteed-fit badge.

Persist user search inputs, scope, selections, filters, sorting and page in the URL using a stable documented schema. Refresh, direct links and Back/Forward must work without React location state. Do not place raw decoder payloads in the URL. Abort obsolete requests or ignore their results. Changing any search/filter resets page to 1; every request retains the active scope.

## 5. Resolution flows

### VIN

1. Normalize and validate input. Request exact VIN search and decoder independently.
2. If exact records exist, display them even if decoding fails. Prefer traceable catalog identity over conflicting generic decoder guesses; retain disagreements internally. Do not mislabel Prado as Land Cruiser 70 or silently choose a conflicting year.
3. If exact search succeeds with zero rows, use usable decoder fields to propose covered catalog candidates. Resolve aliases against known catalogs; ambiguous names require confirmation. Missing fields stay unknown, not wildcard evidence of fitment.
4. If identity/configuration is sufficiently supported, select the relevant catalog. If only broad identity is available, show the covered family with explicit configuration confirmation. If make/model/year or necessary distinguishing fields are absent or conflict, ask only for those fields.
5. Search the selected catalog with compatibility `year` and available configuration filters. Do not include an unseeded customer VIN in that query: it would force zero results. Keep that VIN visible separately; returned reference VINs remain unchanged.
6. If supported identity has no covered catalog, offer sourcing and explicit broader browsing. Never substitute an unrelated catalog. A service error is not evidence of no coverage and must not trigger unrestricted fallback.

### Part number

Use `/api/vehicles/search?partNumber=...` first, adding the active vehicle or exact-VIN scope when present. Verify whether the backend returns exact, contains or prefix matches; label and rank accordingly. Exact matches rank before clearly separated partial alternatives. Do not let keyword results bypass an available exact part-number result.

Without vehicle filters, show matches across the catalog and their applications. With filters, preserve them. If no scoped match exists but global matches exist, offer a separate “Search all vehicles” action; broaden only on that action. Clearly state that global presence does not prove fitment to the selected vehicle.

### Part name / description

Use `keyword` with the active scope. Preserve multiword input; test how the server combines words, cases, languages and aliases. Keep both original and translated names where supplied. If synonyms are introduced, maintain an explicit reviewed map and identify expanded searches. Do not claim fuzzy/spelling search until supported. A model name on its own should route to catalog selection/browsing where recognized.

### Vehicle selection / browsing

Populate makes and models using existing endpoints. Obtain coverage from categories, with extended configuration details when available. A minimal confirmed make/model/year/steering selection can open a broad catalog. Let users narrow engine, transmission, series and market using verified options. Do not derive a supposedly complete configuration selector from the first 48 returned rows or invent model-year coverage from sparse observed years. Until Joe provides full configuration coverage, use a versioned, verified configuration index generated from the audited catalog/source metadata for the currently covered vehicles, refreshed with imports. Treat it as a dated snapshot and validate selections through filtered search. Do not download all 38,757 rows in each customer browser.

Explicitly reject contradictory combinations or request confirmation, e.g. decoded Kia with Toyota selected. A user's deliberate vehicle change starts a new scope; it must not silently reinterpret the entered VIN.

## 6. Results and facets

Display the query, scope, selected vehicle and basis for the catalog shown. Separate “catalog records found for this VIN,” “catalog for selected configuration,” “browse this model,” and global part results. No verbose raw decoder warning text in the customer banner. Show concise actionable service errors/retry and missing-detail prompts.

Use stable backend IDs for details. Integrate `/api/vehicles/parts/{id}` through the vehicle catalog client; do not interchange IDs with PartsSeed. Keep a product's multiple applications, PNCs, quantities and diagrams accessible. Preserve the two differing Fortuner part alternatives rather than arbitrarily selecting one.

Do not claim deduplicated total counts by deduplicating just the current page. Until backend aggregation exists, label counts as catalog records and retain correct server pagination. Grouping true products across pages and aggregating applications requires server support and agreed identity keys. Assembly facet counts likewise require scoped backend aggregation; categories are vehicle coverage, not assembly facets.

Images are diagrams unless a source explicitly identifies product photography. Render missing-image states honestly. Exact image IDs remain strings. Confirmed supplier price/stock is separate; existing hardcoded $45/availability and uniform API 5.0 need an agreed commercial decision before purchase claims. Do not invent replacement compatibility from an unverified replacement string.

## 7. Backend coordination

Frontend work can start using current endpoints. Request these contract improvements from Joe in parallel:

- Define matching semantics for partNumber, keyword, PNC, make/model aliases, case, separators, sorting and combined filters. Confirm compatibility-year and production-month meanings.
- Extend categories or supply a configuration list with stable IDs, source catalog/model codes, engine/transmission/market/steering and coverage dates. Keep observed model years distinct.
- Make VIN embedded catalog status agree with dedicated search, and return source/provenance and unresolved/conflicting attributes. Better regional/OEM identification is needed for reliable automatic classification of unseen VINs.
- Return aggregated products/applications with stable pagination and scoped assembly facets, preserving alternatives and diagram links.
- Restore diagram IDs/media mappings and clarify offer/stock/currency semantics.

These are requested capabilities, not assumed routes. If unavailable, ship guided catalog browsing and record-level pagination honestly. Automatic confirmation for arbitrary unseen VINs remains limited by identification data.

## 8. Scenario and acceptance matrix

| Scenario | Expected outcome |
| --- | --- |
| Empty input, no browse selection | Prompt; no accidental unrestricted query |
| Explicit supported vehicle selection, empty part field | Covered catalog browsing |
| Seeded Toyota VIN | Correct exact records and identity |
| Kia sample VIN | Retain useful Kia/Sportage decode; no Toyota substitution |
| Unseeded VIN with useful supported identity | Relevant catalog candidate/selection, not automatic zero-only dead end |
| Partial decode with NHTSA success false | Use trustworthy populated fields; request missing/conflicting details |
| Creta year 1990/alternate 2020 | Do not automatically choose 1990; confirm using provenance/selection |
| Decoder unavailable, exact catalog works | Display exact catalog; concise decoding-unavailable state |
| Exact search fails | Service error/retry; never interpreted as zero coverage |
| Unknown/invalid VIN | Validation or guided vehicle selection, no invented identity |
| 17-character part number in Auto | Offer mode correction; explicit Part number works |
| Part number alone, numeric or alphanumeric | Catalog-wide part search with original identifier preserved |
| Part number with make/model/year/engine | Scoped results; filters persist |
| Exact number absent but partial matches exist | Explicit alternatives after verifying endpoint semantics |
| PNC input | Explicit callout search; no false part-number equivalence |
| Part name alone or multiword description | Global keyword results or honest empty state |
| Part name with selected make/vehicle | Scoped keyword results |
| Recognized make/model term | Vehicle/catalog selection without guessing arbitrary text |
| Conflicting entered VIN and selected make | Ask to correct/change scope |
| Part found globally but not in selected catalog | Scoped empty state with optional explicit global search |
| Outside-year, RHD or different-engine control | Do not leak records excluded by verified filters |
| Missing option for a Fortuner alternative | Retain choices; do not assert one definitive part |
| Zero filtered rows in a supported catalog | “No matching parts for these filters,” not “vehicle unsupported” |
| Filter clear, pagination, sorting | Active query type, catalog/VIN scope and selections retained |
| Refresh, direct URL, Back/Forward | Same reproducible search context |
| Rapid edits/navigation, slow responses | Latest request wins; obsolete results cannot replace current results |
| Network error, timeout, 429 or server failure | Actionable retry; bounded handling, no empty-success/global fallback |
| Missing image/quantity/translation | Honest placeholders; no invented stock or quantities |
| Duplicate records across source VINs/pages | Honest record counts until server aggregation exists |
| Unsupported part-brand filter | No fake brand mapping; vehicle make remains separately labeled |

Test identifiers should include existing Toyota/Fortuner samples, Kia KNAJE55136K135961, standalone Creta MALC281CBLM567587, actual seeded part numbers and a genuine independently verified unseeded Fortuner VIN. Synthetic negatives are not evidence of a real vehicle's compatibility.

## 9. Delivery order and validation

1. Contract checks and fixtures for query semantics, source precedence and response states.
2. Shared typed intent/state/query coordinator plus tests; URL persistence.
3. Global and scoped part-name/number search, preserving existing vehicle browse routes.
4. Guided VIN-to-covered-catalog selection; integrate live coverage appropriately.
5. Results/detail presentation, filters and race/error handling; integrate backend improvements as available.
6. Regression run and review, then a separately authorized release and production smoke checks.

Add focused tests using the established Node test approach where suitable; browser checks cover complete workflows. Include homepage/direct URL parity, global/scoped part searches, negative and failure paths, and stable pagination. Run frontend lint/build; report unrelated baseline issues separately. Verify small screens, keyboard operation, current locales (English/French/Amharic/Arabic) and RTL. Never transmit sample searches to payment/order mutation endpoints during validation.

Definition of done for the first release: customers can search a part name or number without vehicle details, optionally narrow by vehicle make/configuration, and reach relevant covered catalogs from usable VIN evidence or guided selection. No path silently changes identity, drops scope, fabricates fitment or loads an unrelated unrestricted catalog after failure.
