# Kia VIN displayed as Toyota — production investigation

Verified 11 November 2026 against https://www.autopartafrica.com/ and https://africaautopart-api.frankotieno254.workers.dev. No application code changed.

## Finding

A frontend fallback converts a failed VIN lookup into an unfiltered catalog search, then combines the requested Kia VIN with the first Toyota catalog row. This reproduces the reported screenshot. These tests do not support a conclusion that the backend seeded this Kia VIN as Toyota.

## Live results

| Check | Result |
| --- | --- |
| GET `/api/vehicles/vin/KNAJE55136K135961?page=1&pageSize=48` | 200; Kia, NHTSA model Sportage, year 2006; `matchedInCatalog: false`; zero parts |
| GET `/api/vehicles/search?vin=KNAJE55136K135961&page=1&pageSize=48` | 200; zero parts |
| GET `/api/vehicles/search?model=Sportage&make=Kia&page=1&pageSize=48` | 200; zero parts |
| POST `/api/vehicles/vin/KNAJE55136K135961/decode` | 404 |
| GET `/api/vehicles/search?page=1&pageSize=48` | 200; 38,757 parts; first row Toyota Fortuner 2019, VIN `MHFKB8FS8L0087472` |
| Supported Toyota VIN search `MHFKB8FS8L0087472` | 200; 4,489 matching parts |
| Homepage Kia VIN submission in live Chromium | Incorrect green Toyota Fortuner banner and 38,757 catalog parts reproduced |
| Direct `/parts-search?vin=KNAJE55136K135961` in live Chromium | Same defect reproduced |
| Direct supported Toyota VIN in live Chromium | Correct Toyota catalog with 4,489 parts |

The decoder reports `isValidFormat: true` but `checkDigitValid: false`, NHTSA `success: false`, and validation warnings. Kia/Sportage is decoded metadata with warnings, not a fully validated identity or proof of parts compatibility. The backend itself mentions possible non-North-American VIN format as an explanation for the check-digit warning.

## Root cause in source

1. `src/frontend/src/pages/HomePage.tsx` obtains Kia/Sportage metadata, finds no exact VIN or make/model results, and navigates to results with an empty list.
2. `src/frontend/src/pages/parts/PartsSearchPage.tsx:475` treats the empty initial list as requiring another lookup.
3. At lines 550–564, no VIN match triggers `decodeVinFallback`. That helper calls the failing POST endpoint.
4. `src/frontend/src/api/catalogApi.ts:219` catches the failure and returns an object containing null make/model and `isValid: false`. The caller does not check that validity/error result.
5. The results page passes undefined make/model to `searchVehicles`; the client removes empty parameters. The resulting request has only pagination and returns the whole catalog.
6. At lines 570–587, the results page keeps the entered Kia VIN but fills make/model/series from the first unrelated Toyota part.
7. At lines 1058–1097, banner styling and success wording depend on populated make/model rather than verified VIN matching. It says “decoded as TOYOTA FORTUNER” despite `isVinMatched` being false.

The fallback existed before the latest homepage coverage feature; the latest commit is not the origin of these lines. Direct URL reproduction also confirms this is not limited to the new homepage panel.

A separate `/api/parts/groups` 404 occurred in each browser case. It is an additional integration issue, not the cause of the identity substitution.

## Recommended correction, pending implementation

- Never issue an unfiltered search from a VIN resolution failure. Stop when fallback decoding fails or yields no usable criteria.
- Preserve decoder identity separately from catalog metadata. Never identify a VIN from the first unrelated part.
- Distinguish exact catalog match, decode-only with no parts, decode warning, and service failure in UI states. Do not label suggestions as VIN-matched components.
- Reuse the existing successful VIN decode response; align any alternative endpoint with the backend's supported contract.
- Keep VIN scope through filters and pagination; review duplicated resolution paths in HomePage and PartsSearchPage.
- Add regression coverage for this Kia VIN via homepage and direct URL, a supported Toyota VIN, invalid/unknown VINs, decoder 404/network failure, and filtering/pagination after no match.

Expected outcome here: show Kia/Sportage (2006) with the decoder warning and no catalog match; offer the existing part-request flow. Do not show Toyota identity or count the entire catalog as matching.

## Why previous verification missed it

The previous coverage audit exercised supported VINs in the browser and negative catalog cases against the API. It did not exercise this decoded-but-unsupported VIN through the complete frontend fallback. API-only zero-result tests could not detect the later unfiltered browser request. Future verification must include negative end-to-end cases.

## Evidence

- `api-evidence.json`: six live requests and responses, with long item arrays reduced to first item and returned count.
- `browser-evidence.json`: three live browser cases, page text, request/response summaries, and timestamps.
- `reproduced-homepage.png`: production reproduction screenshot.

Only documentation and investigation evidence were added. No fix, commit, push, or deployment was performed.
