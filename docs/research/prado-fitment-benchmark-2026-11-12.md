# Prado VIN matching and market benchmark

Research date: 12 November 2026. No application changes made.

## Scope and evidence

Reviewed the 9 November vehicle-coverage PDF, the committed frontend resolver and results page, and six live backend GET requests. Backend internals and database schema are not present in the inspected application source; statements about backend matching describe observed API behavior rather than verified SQL or server implementation.

## What happens today

Homepage VIN entry navigates to `/parts-search?vin=...`. `resolveVin.ts` requests `/api/vehicles/vin/{vin}` for decoding and `/api/vehicles/search?vin={vin}` for catalog records. Search results must carry the requested VIN. Results initially load 48 rows, with filtering and pagination retaining VIN scope. There is no automatic cross-VIN configuration lookup in this flow.

Live exact search results match the PDF:

| VIN | Catalog configuration | Rows | Pages at 48 |
| --- | --- | ---: | ---: |
| JTEBH3FJ20K223806 | 2019 Prado, 2017–2020 range, 1KD-FTV 3.0 diesel, 5-speed automatic, LHD | 4,423 | 93 |
| JTEBH3FJ205104748 | 2020 Prado, 2017–2020 range, 1KD-FTV 3.0 diesel, 5-speed automatic, LHD | 4,427 | 93 |
| JTEBR3FJX0K300676 | 2023 Prado, 2020–2024 range, 1GD-FTV 2.8 diesel, 6-speed automatic, LHD | 4,305 | 90 |

The make/model parts endpoint returns 13,155 Prado rows, combining these catalogs. That is a model browsing result, not a safe parts list for every Prado.

For the first VIN, the first returned parts include JACK ASSY (0911160131) and jack-handle extensions (0911435040 and 0911435050). Sampled responses across the three Prado VINs include engine/fuel/tool, chassis, body and electrical groups. This was a focused sample, not a fresh full-catalog completeness audit. Some records have null images/quantities or generic `**StdPart` names.

A synthetic negative control made by changing the first VIN's last digit to 7 returned zero catalog rows. This is not evidence of another real vehicle's identity or compatibility. Together with the code, it demonstrates that the current flow does not generalize the PDF year range into cross-VIN fitment.

The PDF explicitly says its ranges do not prove every intervening year has matching parts, and searchable rows do not prove stock or complete component coverage. All listed configurations are LHD.

## Newly observed conflict

For JTEBH3FJ20K223806, the direct decoder returned Toyota / Land Cruiser, no model year, NHTSA success false, and partial attributes including gasoline/2000 cc. Its embedded catalog result was empty with matchedInCatalog false. Dedicated exact catalog search returned 4,423 diesel/3000 cc Prado records.

The current resolver gives generic decoded model precedence over the exact catalog model. Therefore the committed frontend can label this catalog Land Cruiser while its rows and series identify Prado. The first catalog year is used when decoded year is absent. Fuel/engine specifications are drawn from catalog rows. This is a separate issue from the Kia unrestricted fallback, which was fixed. Conflicting data sources need explicit precedence and provenance, rather than assuming every successful decoder response is authoritative.

Commercial display is also separate from fitment: the current part modal/cart code hardcodes $45 and availability true. These are not verified offers. Live sampled API rows include price 5.0, which also needs backend confirmation before being treated as a real selling price.

## Market benchmark: documented patterns

These are provider-documented workflows, not independent product-quality or market-share rankings.

- [PartSouq ordering guide](https://partsouq.com/en/how-to-place-an-order-on-the-partsouq-com-368.html): VIN/frame lookup opens the model's diagram catalog; the user searches diagrams and selects a part. Useful pattern: identify vehicle context, then navigate assemblies and part references, with purchasing as a subsequent step.
- [TecAlliance API introduction](https://developer.tecalliance.cn/en/introduction/index.html): documents VIN or Katashiki to KType, then vehicle-linked parts. Useful pattern: a normalized vehicle-configuration identifier sits between a VIN and reusable part fitment; catalog data need not be copied for each VIN.
- [TecAlliance vehicle identification](https://www.tecalliance.net/products?highlight=vis-vin-vrm&solution=catalogue-ecommerce): describes VIN/registration identification linked to standardized vehicle data. Its regional API documentation does not establish coverage for every Kenyan or Japanese-import vehicle; validate actual samples and licensing before selecting a supplier.
- [eBay Guaranteed Fit](https://www.ebay.com/sellercenter/protections/ebay-guaranteed-fit): checks vehicle details against listing compatibility; car/truck confirmation requires year, make, model, trim and engine. Useful pattern: attach a fitment claim to a product's compatibility evidence, not merely a decoded vehicle name.
- [Auto Care ACES](https://www.autocare.org/aces) and [PIES](https://www.autocare.org/pies): separate fitment exchange from product-information exchange. Useful architecture reference, not proof their reference data covers our target fleet or that a subscription is necessary for this project.
- [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/): documents vehicle identification and specification decoding. It does not document supplying our OEM part-application relationships. A decoder response alone is insufficient evidence for a compatible parts list.

## Recommended target behavior

1. Resolve a VIN or, where supported by a suitable data source, a chassis/frame identifier into a verified vehicle configuration.
2. Use a stable configuration ID with engine, transmission, steering, market, production dates and relevant option/serial qualifiers. Store source and verification information. A shared model/year range is only a candidate filter.
3. Return matching part applications using those qualifiers. Distinguish exact-VIN catalog evidence, verified configuration fitment, unverified model browsing, and no coverage. Do not use the label “fits your vehicle” for a candidate-only match.
4. When several configurations remain possible, ask for the missing engine/steering/production information or request manual verification; do not choose the first result.
5. Keep product identity, fitment applications, diagrams and supplier offers separate. A part may have multiple applications and offers. Only an offer provides verified price, stock, lead time and currency.
6. Support manual vehicle selection and explicit broader catalog browsing without silently substituting it for a VIN match.
7. Publish live coverage by configuration and steering, with counts and a verification date. Count distinct parts separately from application rows.

Proposed ownership: Joe owns configuration resolution, application data, match provenance and offer contracts; the frontend renders explicit match states and guided selection; Franko/partners confirm the provenance and meaning of seeded compatibility ranges. These capabilities are proposed, not existing endpoints or tables.

Recommended sequence: reconcile decoder/catalog conflicts and commercial placeholders first; audit and normalize the three Prado seed sets next; pilot a genuinely unseeded, independently verified Prado VIN against a known configuration; include RHD, different engines, build-date boundaries and ambiguous/unsupported vehicles as negative controls. Evaluate commercial data suppliers only against this representative sample set. The acceptance criterion is correct part application evidence, not just a plausible make/model label.
