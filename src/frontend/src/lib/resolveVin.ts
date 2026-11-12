import type { PaginatedResponse, CatalogPartItem, VehicleVinResponse } from '@/types/catalog'

export const isVin = (value: string) => /^[A-HJ-NPR-Z0-9]{17}$/.test(value)

interface VinClient {
  getVehicleByVin: (vin: string, page: number, pageSize: number) => Promise<VehicleVinResponse>
  searchVehicles: (params: { vin: string; page: number; pageSize: number }) => Promise<PaginatedResponse<CatalogPartItem>>
}

export async function resolveVin(value: string, client: VinClient, pageSize = 48) {
  const vin = value.trim().toUpperCase()
  if (!isVin(vin)) throw new Error('Enter a 17-character VIN without I, O or Q.')

  const [decode, search] = await Promise.allSettled([
    client.getVehicleByVin(vin, 1, pageSize),
    client.searchVehicles({ vin, page: 1, pageSize }),
  ])
  if (search.status === 'rejected') throw new Error('Catalog lookup failed. Please retry.')
  const catalog = search.value
  // A VIN lookup must never display rows belonging to a different vehicle.
  if (catalog.items.some(part => part.vin?.trim().toUpperCase() !== vin)) {
    throw new Error('The catalog returned inconsistent VIN results. Please retry.')
  }
  const vehicle = decode.status === 'fulfilled' ? decode.value : undefined
  const decoded = vehicle?.decoded
  const first = catalog.items[0]
  const decodedYear = decoded?.modelYear ? String(decoded.modelYear) : null
  const ambiguousYear = !!decoded?.alternateModelYear && decoded.alternateModelYear !== decoded.modelYear
  const supportedYear = !ambiguousYear || decoded?.nhtsa?.modelYear === decodedYear
    ? decodedYear || decoded?.nhtsa?.modelYear : null
  const warnings = [...new Set([
    ...(decoded?.errors || []),
    ...(decoded?.isValidFormat === false ? ['The decoder could not validate this VIN format.'] : []),
    ...(decoded?.checkDigitValid === false && !decoded.errors?.length ? ['VIN check-digit validation warning.'] : []),
    ...(decoded?.nhtsa?.success === false && decoded.nhtsa.errorText ? [decoded.nhtsa.errorText] : []),
    ...(decode.status === 'rejected' ? ['Vehicle decoding is unavailable.'] : []),
  ])]
  return {
    catalog,
    matched: catalog.totalCount > 0,
    warnings,
    meta: {
      vin,
      make: first?.make || first?.oem || decoded?.make || decoded?.nhtsa?.make || null,
      model: first?.model || decoded?.model || decoded?.nhtsa?.model || vehicle?.model || null,
      modelYear: first?.modelYear || vehicle?.modelYear || supportedYear || null,
      manufacturer: decoded?.nhtsa?.manufacturer,
      series: vehicle?.series || first?.vehicleSeries || first?.series,
      fuel: first?.fuel,
      transmission: first?.transmission,
      displacementCC: first?.displacementCC,
      engineFamily: first?.engineFamily,
      engineType: first?.engineType,
      steering: first?.steering,
      body: first?.body,
      marketSpec: first?.marketSpec,
    },
  }
}
