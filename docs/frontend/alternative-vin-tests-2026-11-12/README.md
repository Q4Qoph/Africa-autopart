# Alternative VIN decoder and catalog tests — 12 November 2026

Live API tests only. The user is independently testing localhost UI. No application code or production data changed.

Test window: 2026-11-12T12:05:45.952405+00:00 to 2026-11-12T12:06:03.097685+00:00. Additional Santa Fe controls are timestamped in their evidence file.

Each supplied VIN was tested as supplied using GET /api/vehicles/vin/{vin}, exact GET /api/vehicles/search?vin=..., and a separate configuration search based on the user-provided expected configuration. All 36 requests returned HTTP 200. Three seeded positive controls also returned HTTP 200 and their expected counts.

## Decoder responses

| Test VIN | Supplied vehicle | Returned make/model | Returned year / alternate | Exact VIN records | Claimed configuration records |
| --- | --- | --- | --- | ---: | ---: |
| `JTEEB71J907020704` | Toyota Land Cruiser 70 | Toyota / Land Cruiser | unknown | 0 | 3744 |
| `JTEEB71JX07041318` | Toyota Land Cruiser 70 | Toyota / Land Cruiser | unknown | 0 | 3744 |
| `JTEBH3FJ20K216810` | Toyota Prado 3.0 | Toyota / Land Cruiser | unknown | 0 | 4423 |
| `JTEBH3FJ20K206276` | Toyota Prado 3.0 | Toyota / Land Cruiser | unknown | 0 | 4423 |
| `JTEBR3FJ50K270518` | Toyota Prado 2.8 | Toyota / Land Cruiser | unknown | 0 | 4305 |
| `JTEBR3FJ70K270620` | Toyota Prado 2.8 | Toyota / Land Cruiser | unknown | 0 | 4305 |
| `MHFKB8FS1L0087491` | Toyota Fortuner | unknown / unknown | 2020 / 1990 | 0 | 8978 |
| `AHTFK226203081823` | Toyota Hilux | Toyota / unknown | unknown | 0 | 3271 |
| `MHFB29F36H2016927` | Toyota Vios | unknown / unknown | 2017 / 1987 | 0 | 2309 |
| `MALC281C4LM594545` | Hyundai Creta General | unknown / unknown | 1990 / 2020 | 0 | 2270 |
| `MALC281C9LM591356` | Hyundai Creta Middle East | unknown / unknown | 1990 / 2020 | 0 | 2279 |
| `KMHS281D0LU290963` | Hyundai Santa Fe | Hyundai / unknown | 1990 / 2020 | 0 | 2751 |

All 12 returned isValidFormat true. NHTSA success was false for all 12; several still provided useful partial make/model information. Configuration-search results are matches for manually supplied filters, not proof that the VIN decodes to that configuration. The first six VINs were described by the user as published real vehicles; customs/fleet provenance and exact specifications were not independently verified because no source documents/links were provided.

## Important response discrepancies

- Both 3.0 Prado cases return generic Land Cruiser, gasoline and 2000 cc, contradicting the supplied 3.0 diesel/1KD expectation. Both 2.8 Prado cases identify generic Land Cruiser without engine capacity/fuel details. All six Toyota JTE examples have unresolved decoded model year.
- Fortuner returns year 2020 with alternate 1990 and no make/model, rather than the supplied MY 2019. The field values should not be silently treated as verified production specifications.
- Creta examples return year 1990 with alternate 2020 and no make/model. Santa Fe returns Hyundai, no model, year 1990 and alternate 2020; its NHTSA modelYear also says 1990 despite success false.

## Santa Fe catalog fallback confirmed separately

For KMHS281D0LU290963, the VIN endpoint reports matchedInCatalog true and parts.totalCount 7300. The first page consists of CRETA rows, beginning with source VIN MALC281CBLM594521. A separate make=HYUNDAI search also returns 7300, while exact VIN search returns zero. This is consistent with a make-level fallback; backend source is needed to establish its internal mechanism. It is not evidence of a validated Santa Fe application match. The other 11 VIN responses report matchedInCatalog false with zero embedded parts.

The current frontend uses dedicated exact search rather than trusting this embedded match flag. It should offer guided catalog confirmation for these VINs. Its existing ambiguous-year heuristic may still display Santa Fe 1990 because both year fields agree; failed/ambiguous decoder year precedence deserves a follow-up correction, not an automatic replacement with the user-supplied 2020. No frontend modification was made during this test.

## Supplied synthetic test-data corrections

Using the conventional weighted VIN check-digit calculation, ten supplied VINs match and two do not:

| VIN | Supplied position 9 | Calculated position 9 |
| --- | --- | --- |
| `AHTFK226203081823` | 2 | 3 |
| `MALC281C4LM594545` | 4 | 5 |

These are checksum observations, not a claim that every global manufacturer must follow the same VIN/year convention or that a checksum proves a real vehicle exists. Replacing a check digit would create a different test identifier, not verify the stated configuration.

The Hilux sample has prefix AHTFK226, whereas the catalog seed has AHTFK22G. Its eighth character differs (6 versus G), so the exact-prefix-preservation claim is false for that sample.

Both Creta samples have the same proposed classification key: prefix MALC281C, position 10 L, position 11 M. They are assigned different expected General/Middle East catalogs. That key alone therefore cannot distinguish those two claimed catalogs. Serial-specific/OEM information or user confirmation is required.

## Positive controls

| Seed VIN | Exact records |
| --- | ---: |
| `MHFKB8FS8L0087472` | 4489 |
| `JTEBH3FJ20K223806` | 4423 |
| `MALC281CBLM594521` | 2270 |

## Localhost comparison guide

1. Enter the original supplied VIN and compare the displayed identity with the decoder table.
2. Expect no exact VIN catalog for all 12. Do not interpret the Santa Fe embedded 7300 count as an exact match.
3. Choose the expected make/model, compatibility year, LHD and relevant verified configuration explicitly to compare the configuration counts above. Preserve the customer VIN separately from reference VINs.
4. Confirm Prado catalog selection manually; generic Land Cruiser decoding cannot choose Land Cruiser 70 versus Prado.
5. Capture any frontend discrepancy separately. This report does not claim a browser test of these 12 real/synthetic inputs.

Raw responses, all request URLs, checksum comparisons and seed-prefix comparisons are in evidence.json. The repeated Santa Fe response and Hyundai/exact controls are in santa-fe-confirmation.json.
