export function formatCheckoutPrice(price?: number | null): string | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0.01) return null
  return `$${price.toFixed(2)}`
}

export function parseCheckoutPrice(price: string): number {
  return /^\$?\d+(?:\.\d{1,2})?$/.test(price) ? Number(price.replace(/^\$/, '')) : NaN
}
