# Published VIN API tests — 2026-11-12

Read-only live backend tests. No browser/UI verification or application changes.

Completed UTC: 2026-11-12T12:45:00.035811+00:00

Each VIN tested with GET `/api/vehicles/vin/{vin}?page=1&pageSize=1`, GET `/api/vehicles/search?vin={vin}&page=1&pageSize=1`, and a separate configuration query. Full request URLs and responses are in `evidence.json`. Configuration queries use externally supplied configuration attributes, not decoder-derived fitment. They omit market/transmission, so their counts are catalog availability evidence, not compatibility certification.

All 24 requests returned HTTP 200. Every exact VIN search returned zero. All NHTSA objects returned success=false.

| Vehicle | VIN | Decoder make/model | Decoder year | VIN endpoint count | Exact count | Configuration count |
|---|---|---|---|---:|---:|---:|
| Toyota Fortuner | `MHFKB8FS0L0087305` | Unknown / Unknown | 2020 | 0 | 0 | 8978 |
| Toyota Hilux | `AHTFK22G203063209` | Toyota / Unknown | Unknown | 0 | 0 | 3271 |
| Toyota Land Cruiser 70 | `JTEEB71J607033166` | Toyota / Land Cruiser | Unknown | 0 | 0 | 3744 |
| Toyota Prado 3.0 | `JTEBH3FJ20K208013` | Toyota / Land Cruiser | Unknown | 0 | 0 | 4423 |
| Toyota Prado 3.0 | `JTEBH3FJXKK204701` | Toyota / Unknown | 2019 | 21572 | 0 | 4423 |
| Toyota Prado 2.8 | `JTEBR3FJ3R5029536` | Toyota / Unknown | 2024 | 8049 | 0 | 4305 |
| Toyota Vios GCC | `MHFB29F38H2002270` | Unknown / Unknown | 2017 | 0 | 0 | 2309 |
| Toyota Vios General | `MR2B29F35J1088895` | Unknown / Unknown | 2018 | 0 | 0 | 2309 |

## Findings

- Prado JTEBH3FJXKK204701: matchedInCatalog=true, 21,572 rows, first returned row is a Fortuner part. This is not a confirmed Prado fitment result.
- Prado JTEBR3FJ3R5029536: matchedInCatalog=true, 8,049 rows, while the separately filtered Prado 2.8 configuration has 4,305 rows. The broader response is not proof of specific fitment.
- Prado JTEBH3FJ20K208013: partial decoder says Land Cruiser, 2000cc gasoline; published catalog describes Prado 3.0 diesel.
- The final Vios (MR2B29F35J1088895) is a General-market negative/control case. The returned configuration rows are GCC and should not be presented as confirmed fitment.
- Decoder year and production date can differ legitimately. Do not equate a difference with a proven decoding error.
- Counts are catalog rows, potentially duplicated across source vehicles, not unique saleable parts.

No source code changes were made.
