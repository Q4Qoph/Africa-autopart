# VIN resolution fix — 11 November 2026

## Behavior

Homepage VIN submission navigates to `/parts-search?vin=...`. That page owns VIN resolution for both homepage submissions and direct links, using `src/frontend/src/lib/resolveVin.ts`.

The resolver requests the working GET `/api/vehicles/vin/{vin}` and exact GET `/api/vehicles/search?vin={vin}` in parallel. The decoder supplies identity and warnings; exact search supplies catalog rows and counts. Search results containing another VIN are rejected. Decoder identity takes precedence over catalog attributes. Catalog attributes are used as a fallback only from rows carrying the requested VIN.

No VIN fallback searches by make/model or without VIN criteria. The unused POST `/api/vehicles/vin/{vin}/decode` helper has been removed. Keyword and make/model browsing remain separate flows.

The results page distinguishes loading, invalid input, lookup failure with retry, decoded/unidentified vehicle with no catalog match, and exact catalog records. Detailed decoder validation messages are retained internally for status styling but are not displayed in the banner. “Catalog records found” does not claim validated compatibility. Decoder failure does not prevent displaying an independently successful exact VIN catalog lookup, but a decoding-unavailable warning is shown.

An unsupported VIN keeps its decoded identity and zero results, offers Request a Part, and does not display default category or series data. Filters and pagination retain the explicitly requested VIN. Controls cannot broaden a failed or unmatched VIN lookup. Obsolete async VIN resolutions are ignored after navigation/retry.

## Verification

Run the focused Node test suite from the repository root, after installing frontend dependencies:

```bash
node --test tests/frontend/resolveVin.test.mjs
```

The tests use Node's built-in runner and the existing TypeScript compiler; no new dependency or test framework is installed. Eight checks cover unsupported Kia identity/warnings, supported Toyota, decoder outage, catalog outage, unrelated VIN rows, invalid input before requests, unknown identity, and preservation of decoded identity.

Browser checks used the local Vite application against the live API, with four cases:

- Homepage submission and direct URL for `KNAJE55136K135961`: Kia/Sportage 2006, zero catalog parts and Request a Part. Typing/clearing a part filter and selecting All Groups did not load unrelated parts.
- Homepage submission and direct URL for `MHFKB8FS8L0087472`: Toyota/Fortuner with 4,489 records. Page 2, a JACK keyword filter, and clearing the filter retained the VIN in requests.

The browser checks assert no `/decode` request and no vehicle search without the requested VIN. Development StrictMode can issue duplicate initial GET requests; obsolete results are ignored.

`npm run build` passes. Changed-file ESLint has no errors and one pre-existing modal-navigation hook warning. Full-project lint reports 12 unrelated errors and 15 warnings (the catalog client's prior explicit-any error was removed by typing cleaned query values).

The existing `/api/parts/groups` 404 remains outside this fix. Build warnings about bundle size and old Browserslist data remain. Production requires deployment and a repeat of the Kia/Toyota smoke checks; local verification does not change production.

See `vin-mismatch-2026-11-11/README.md` for original incident evidence, and `vin-fix-2026-11-11/` for browser verification evidence.
