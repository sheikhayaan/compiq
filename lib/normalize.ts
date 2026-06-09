export type NormalizedLevel = {
  normalizedLevel: string
  levelOrder: number
}

const companyAliases: Record<string, string> = {
  'google inc': 'Google',
  alphabet: 'Google',
  'google llc': 'Google',
  'meta platforms': 'Meta',
  facebook: 'Meta',
  'amazon com': 'Amazon',
  'amazon inc': 'Amazon',
  aws: 'Amazon',
  'microsoft corp': 'Microsoft',
  msft: 'Microsoft',
  'apple inc': 'Apple',
  'netflix inc': 'Netflix',
  'uber technologies': 'Uber',
  'tata consultancy services': 'TCS',
}

const canonicalCompanies = new Set([
  'Google',
  'Meta',
  'Amazon',
  'Microsoft',
  'Apple',
  'Netflix',
  'Uber',
  'Airbnb',
  'Stripe',
  'Flipkart',
  'Infosys',
  'TCS',
  'Swiggy',
  'Razorpay',
  'Zepto',
])

const levelMaps: Record<string, Record<string, NormalizedLevel>> = {
  Google: {
    L3: { normalizedLevel: 'Junior', levelOrder: 3 },
    L4: { normalizedLevel: 'Mid', levelOrder: 4 },
    L5: { normalizedLevel: 'Senior', levelOrder: 5 },
    L6: { normalizedLevel: 'Staff', levelOrder: 6 },
    L7: { normalizedLevel: 'Principal', levelOrder: 7 },
  },
  Meta: {
    E3: { normalizedLevel: 'Junior', levelOrder: 3 },
    E4: { normalizedLevel: 'Mid', levelOrder: 4 },
    E5: { normalizedLevel: 'Senior', levelOrder: 5 },
    E6: { normalizedLevel: 'Staff', levelOrder: 6 },
    E7: { normalizedLevel: 'Principal', levelOrder: 7 },
  },
  Amazon: {
    L4: { normalizedLevel: 'Junior', levelOrder: 3 },
    L5: { normalizedLevel: 'Mid', levelOrder: 4 },
    L6: { normalizedLevel: 'Senior', levelOrder: 5 },
    L7: { normalizedLevel: 'Staff', levelOrder: 6 },
    L8: { normalizedLevel: 'Principal', levelOrder: 7 },
  },
  Microsoft: {
    '59': { normalizedLevel: 'Junior', levelOrder: 3 },
    '60': { normalizedLevel: 'Mid', levelOrder: 4 },
    '62': { normalizedLevel: 'Senior', levelOrder: 5 },
    '63': { normalizedLevel: 'Staff', levelOrder: 6 },
    '65': { normalizedLevel: 'Principal', levelOrder: 7 },
  },
  Apple: {
    ICT2: { normalizedLevel: 'Junior', levelOrder: 3 },
    ICT3: { normalizedLevel: 'Mid', levelOrder: 4 },
    ICT4: { normalizedLevel: 'Senior', levelOrder: 5 },
    ICT5: { normalizedLevel: 'Staff', levelOrder: 6 },
    ICT6: { normalizedLevel: 'Principal', levelOrder: 7 },
  },
}

const defaultLevels: Record<string, NormalizedLevel> = {
  JUNIOR: { normalizedLevel: 'Junior', levelOrder: 3 },
  MID: { normalizedLevel: 'Mid', levelOrder: 4 },
  SENIOR: { normalizedLevel: 'Senior', levelOrder: 5 },
  STAFF: { normalizedLevel: 'Staff', levelOrder: 6 },
  PRINCIPAL: { normalizedLevel: 'Principal', levelOrder: 7 },
}

export function normalizeCompanyName(input: string): string {
  const cleaned = input.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
  const aliased = companyAliases[cleaned]
  if (aliased) return aliased

  const titleCased = cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return canonicalCompanies.has(titleCased) ? titleCased : titleCased
}

export function normalizeLevel(companyName: string, rawLevel: string): NormalizedLevel {
  const company = normalizeCompanyName(companyName)
  const raw = rawLevel.trim().toUpperCase()
  const companyMap = levelMaps[company]
  if (companyMap?.[raw]) return companyMap[raw]
  if (defaultLevels[raw]) return defaultLevels[raw]

  const matchedDefault = Object.values(defaultLevels).find(
    (level) => level.normalizedLevel.toUpperCase() === raw
  )

  return matchedDefault ?? { normalizedLevel: 'Mid', levelOrder: 4 }
}

export function calculateTotalComp(baseSalary?: number, bonus?: number, equity?: number): number {
  const safe = (value?: number) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0)
  return safe(baseSalary) + safe(bonus) + safe(equity)
}

export function slugifyCompany(name: string): string {
  return normalizeCompanyName(name).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}
