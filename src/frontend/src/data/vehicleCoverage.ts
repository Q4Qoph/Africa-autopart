export type CoverageSteering = 'LHD' | 'RHD'

export interface VehicleCoverageRange {
  readonly startYear: number | null
  readonly endYear: number | null
  readonly steering: CoverageSteering | null
}

export interface CoveredModel {
  /** Keep the backend model key separate from its customer-facing label. */
  readonly model: string
  readonly label: string
  readonly ranges: readonly VehicleCoverageRange[]
}

export interface CoveredMake {
  readonly make: string
  readonly label: string
  readonly models: readonly CoveredModel[]
}

export interface VehicleCoverageSnapshot {
  readonly verifiedAt: string
  readonly makes: readonly CoveredMake[]
}

/**
 * Backend-derived release snapshot, not a live inventory or stock guarantee.
 * Source: docs/vehicle-coverage-verification-2026-11-09.md (all 194 pages).
 * Revalidated 2026-11-10 against all 38,757 unique records; see panel docs.
 * Refresh after catalog imports; deduplicate identical make/model/range/steering
 * tuples only. Do not merge different or overlapping compatibility ranges.
 * A lightweight backend coverage endpoint can replace this provider later.
 */
const coverageSnapshot: VehicleCoverageSnapshot = {
  verifiedAt: '2026-11-10T19:25:17Z',
  makes: [
    {
      make: 'TOYOTA',
      label: 'Toyota',
      models: [
        { model: 'FORTUNER', label: 'Fortuner', ranges: [{ startYear: 2016, endYear: 2020, steering: 'LHD' }] },
        { model: 'HILUX', label: 'Hilux', ranges: [{ startYear: 2011, endYear: 2015, steering: 'LHD' }] },
        { model: 'LAND CRUISER', label: 'Land Cruiser 70', ranges: [{ startYear: 2007, endYear: 2026, steering: 'LHD' }] },
        {
          model: 'LAND CRUISER PRADO',
          label: 'Land Cruiser Prado',
          ranges: [
            { startYear: 2017, endYear: 2020, steering: 'LHD' },
            { startYear: 2020, endYear: 2024, steering: 'LHD' },
          ],
        },
        { model: 'VIOS', label: 'Vios', ranges: [{ startYear: 2016, endYear: 2017, steering: 'LHD' }] },
      ],
    },
    {
      make: 'HYUNDAI',
      label: 'Hyundai',
      models: [
        {
          model: 'CRETA',
          label: 'Creta',
          ranges: [
            { startYear: 2018, endYear: 2020, steering: 'LHD' },
            { startYear: 2018, endYear: 2021, steering: 'LHD' },
          ],
        },
        { model: 'SANTA FE', label: 'Santa Fe', ranges: [{ startYear: 2018, endYear: 2020, steering: 'LHD' }] },
      ],
    },
  ],
}

export function getVehicleCoverageSnapshot(): VehicleCoverageSnapshot {
  return coverageSnapshot
}
