# Vehicle coverage verification — 9 November 2026

Deliverable: [one-page vehicle coverage PDF](product/Africa%20Autopart%20Vehicle%20Coverage%20-%202026-11-09.pdf).

## Evidence and scope

- Reviewed Reports 1 and 2, the catalog integration plan, the architecture review, and the voice-note requirements. The documented RAR VINs and old report examples provided comparison cases.
- Data source: `https://africaautopart-api.frankotieno254.workers.dev`; live UI: `https://www.autopartafrica.com/`.
- Read-only full catalog collection: 2026-11-09T20:44:51.436202+00:00 to 2026-11-09T20:45:44.764349+00:00.
- Fetched all **194 pages**, requesting **200 records per page**. Every page reported the same total. Reconciled **38,757 rows / 38,757 unique IDs**.
- Enumerated make/model lists: **2 makes, 7 models**. Grouped all rows using make, model, series, model year, steering, compatibility years, fuel, engine, transmission, body and market: **10 configurations, 11 VINs**.
- All 38,757 records have `steering=LHD`; no RHD or missing steering values occurred in the snapshot.
- Counts are catalog rows, not distinct part numbers or stock units. Two Fortuner VINs share one configuration and each contributes 4,489 rows.

## Verified configuration list

| Make / model | Series code | Compatibility range | Observed model year | Steering | Rows | Example VIN |
| --- | --- | --- | --- | --- | ---: | --- |
| HYUNDAI CRETA | IGENPA018 | 2018–2021 | 2020 | LHD | 2,270 | MALC281CBLM594521 |
| HYUNDAI CRETA | IMESPA018 | 2018–2020 | 2020 | LHD | 2,279 | MALC281C7LM591338 |
| HYUNDAI SANTA FE | KMESPS118 | 2018–2020 | 2020 | LHD | 2,751 | KMHS281D9LU290945 |
| TOYOTA FORTUNER | GUN155L-SDTSHV | 2016–2020 | 2019 | LHD | 8,978 | MHFKB8FS3L0087475 |
| TOYOTA HILUX | LAN25L-PRMDEN | 2011–2015 | 2013 | LHD | 3,271 | AHTFK22G003081805 |
| TOYOTA LAND CRUISER PRADO | J150 | 2017–2020 | 2020 | LHD | 4,427 | JTEBH3FJ205104748 |
| TOYOTA LAND CRUISER PRADO | J150 | 2020–2024 | 2023 | LHD | 4,305 | JTEBR3FJX0K300676 |
| TOYOTA LAND CRUISER PRADO | KDJ150L-GKAEY | 2017–2020 | 2019 | LHD | 4,423 | JTEBH3FJ20K223806 |
| TOYOTA LAND CRUISER | HZJ76L-RKMRS | 2007–2026 | 2019 | LHD | 3,744 | JTEEB71J31F007215 |
| TOYOTA VIOS | NSP15# | 2016–2017 | 2017 | LHD | 2,309 | MHFB29F34H2016909 |

Compatibility ranges are API metadata, not proof of matching parts for every year in the interval. The PDF includes observed model years and fitment descriptions to keep that distinction visible.

## Functional checks

**24/24 API checks passed:** 11 exact VIN searches, 10 configuration searches combining make/model/series/model-year/LHD, and 3 negative controls (RHD, Nissan Note and Haval Chitu). Each positive sample matched its expected fields; all negative controls returned zero rows.

**20/20 live browser checks passed:**

- All 7 make/model parts pages displayed 48 loaded part cards.
- The actual home search form displayed results for `AHTFK22G003081805` and `CRETA`.
- All 11 VIN search URLs displayed 48 part cards with the requested VIN and expected model.
- No unhandled JavaScript exceptions were recorded during those checks.
- The existing category-list request `/api/parts/groups` returned 404; the page fallback still allowed part results. This report does not represent that route as fixed.

## Relationship to earlier reports and recent seeds

The seven model totals still reconcile to the October report total of 38,757. The full scan identifies a second Creta market specification and three Prado configurations (2019/2020 3.0L and 2023 2.8L). These additional detail rows are not evidence that they were imported after Report 2.

The published production snapshot includes all currently exposed records. There is no supplied import-batch manifest or backend source in this checkout, so seed completeness relative to unpublished source material remains unverified. The four data-bearing archive VINs are among the 11 current catalog VINs.

## Artifact checks

- PDF is one A4 landscape page; extracted text was checked for all 10 configurations, counts and VINs.
- Rendered page reviewed for legibility and clipping; example VINs link to production search pages.
- Application source and project dependencies were not changed.
