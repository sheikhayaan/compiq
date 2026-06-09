export type DisplayCurrency = 'USD' | 'INR'

export const TO_USD_RATES: Record<string, number> = {
  USD: 1,
  INR: 1 / 83,
  GBP: 1.27,
  EUR: 1.08,
  CAD: 0.74,
  SGD: 0.74,
  AUD: 0.66,
  AED: 0.27,
  JPY: 0.0067,
  BRL: 0.2,
}

export function convertCurrency(amount: number, sourceCurrency: string, displayCurrency: DisplayCurrency): number {
  const usd = amount * (TO_USD_RATES[sourceCurrency] ?? 1)
  return displayCurrency === 'INR' ? usd * 83 : usd
}

export function formatInrAnnual(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  return `₹${(amount / 100000).toFixed(1)}L`
}

export function formatAnnualCurrency(amount: number, currency: string): string {
  if (!amount || amount === 0) return 'N/A'

  switch (currency) {
    case 'INR':
      return formatInrAnnual(amount)
    case 'GBP':
      return `£${Math.round(amount / 1000)}k`
    case 'EUR':
      return `€${Math.round(amount / 1000)}k`
    case 'CAD':
      return `CA$${Math.round(amount / 1000)}k`
    case 'SGD':
      return `S$${Math.round(amount / 1000)}k`
    case 'AUD':
      return `A$${Math.round(amount / 1000)}k`
    case 'AED':
      return `AED ${Math.round(amount / 1000)}k`
    case 'JPY':
      return `¥${(amount / 1000000).toFixed(1)}M`
    case 'BRL':
      return `R$${Math.round(amount / 1000)}k`
    default:
      return `$${Math.round(amount / 1000)}k`
  }
}

export function formatConvertedAnnualCurrency(
  amount: number,
  sourceCurrency: string,
  displayCurrency: DisplayCurrency
): string {
  return formatAnnualCurrency(convertCurrency(amount, sourceCurrency, displayCurrency), displayCurrency)
}
