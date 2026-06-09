export type LevelTier = 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface SalaryEntry {
  id: string
  company: string
  companySlug: string
  role: string
  roleSlug: string
  level: string
  levelTier: LevelTier
  location: string
  country: string
  base: number
  bonus: number
  equity: number
  totalComp: number
  yoe: number
  currency: string
  date: string
}

export interface CompanyLevel {
  code: string
  name: string
  tier: LevelTier
  typicalYoe: number
  medianTC: number
}

export interface Company {
  id: string
  name: string
  slug: string
  industry: string
  logo?: string | null
  logoBg: string
  salariesReported: number
  medianTC: number
  medianBase: number
  topLevelTC: number
  dominantCurrency?: string
  levels: CompanyLevel[]
}

export interface CompanyProfile extends Company {
  salaries: SalaryEntry[]
  groupedSalaries: LevelSummary[]
}

export interface LevelSummary {
  level: string
  normalizedLevel: LevelTier
  count: number
  medianBase: number
  medianBonus: number
  medianEquity: number
  medianTC: number
}

export interface ComparisonEntry {
  companySlug: string
  companyName: string
  role: string
  level: string
  normalizedLevel: LevelTier | null
  medianBase: number | null
  medianBonus: number | null
  medianEquity: number | null
  medianTC: number | null
  p25TC: number | null
  p75TC: number | null
  count: number
  medianYOE: number | null
  currency?: string
  location?: string | null
  country?: string | null
  market?: string | null
}

export interface LevelMap {
  id: string
  company: string
  rawLevel: string
  normalizedLevel: LevelTier
  levelOrder: number
}

export interface FilterState {
  companies: string[]
  roles: string[]
  levelTier: string
  locations: string[]
  yoe: number
  totalComp: number
}

export interface StatsData {
  totalSalaries: number
  totalCompanies: number
  medianSWETC: number
  topTenPercentTC: number
  mostSearchedCompany: string | null
  trendingRole: string | null
}

export interface SalariesResult {
  data: SalaryEntry[]
  total: number
  page: number
  totalPages: number
}

export interface SalaryFilters {
  search?: string
  company?: string
  role?: string
  level?: string
  country?: string
  minTC?: number
  maxTC?: number
  minYOE?: number
  maxYOE?: number
  page?: number
  limit?: number
}

export interface SubmitSalaryInput {
  companyName: string
  role: string
  level: string
  location: string
  country: string
  baseSalary: number
  bonus?: number
  equity?: number
  yearsExp?: number
  currency?: string
}
