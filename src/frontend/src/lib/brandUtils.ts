const BRAND_SLUG_MAP: Record<string, string> = {
  mercedes: 'mercedes-benz',
  'mercedes-benz': 'mercedes-benz',
  'mercedes benz': 'mercedes-benz',
  vw: 'volkswagen',
  'land rover': 'land-rover',
  'land-rover': 'land-rover',
}

const PNG_BRANDS = new Set(['bmw', 'lexus', 'volkswagen'])

/**
 * Returns the public image URL for a given brand name, handling naming aliases
 * (e.g., Mercedes -> mercedes-benz) and correct file extensions (.png vs .webp).
 */
export function getBrandLogoPath(brand: string): string {
  if (!brand) return ''
  const clean = brand.toLowerCase().trim().replace(/[\s_]+/g, '-')
  const slug = BRAND_SLUG_MAP[clean] || clean
  const ext = PNG_BRANDS.has(slug) ? '.png' : '.webp'
  return `/images/brands/${slug}${ext}`
}
