export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function percentile(values: number[], percentileValue: number): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)]
}

export function roleSlug(role: string): string {
  const normalized = role.toLowerCase()
  if (normalized.includes('product')) return 'pm'
  if (normalized.includes('data')) return 'data'
  if (normalized.includes('design')) return 'design'
  return 'swe'
}

export function logoColor(name: string): string {
  const colors: Record<string, string> = {
    Google: '#4285F4',
    Meta: '#0668E1',
    Amazon: '#FF9900',
    Microsoft: '#F25022',
    Apple: '#555555',
    Netflix: '#E50914',
    Uber: '#111111',
    Airbnb: '#FF5A5F',
    Stripe: '#635BFF',
    Flipkart: '#2874F0',
    Infosys: '#007CC3',
    TCS: '#4B2AAD',
    Swiggy: '#FC8019',
    Razorpay: '#0B72E7',
    Zepto: '#8C1DAB',
  }
  return colors[name] ?? '#555555'
}
