import type {
  ApiResponse,
  Company,
  CompanyProfile,
  ComparisonEntry,
  LevelMap,
  SalariesResult,
  SalaryEntry,
  SalaryFilters,
  StatsData,
  SubmitSalaryInput,
} from '@/types'
import { logoColor, roleSlug } from '@/lib/stats'

type RawSalary = {
  id: string
  role: string
  level: string
  normalizedLevel: SalaryEntry['levelTier']
  location: string
  country: string
  baseSalary: number
  bonus: number
  equity: number
  totalComp: number
  yearsExp: number | null
  currency: string
  createdAt: string
  company: { name: string; slug: string }
}

type RawCompany = {
  id: string
  name: string
  slug: string
  industry: string | null
  logo: string | null
  salariesReported: number
  medianTC: number
  medianBase: number
  topLevelTC?: number
  levels?: Company['levels']
}

function toSalaryEntry(salary: RawSalary): SalaryEntry {
  return {
    id: salary.id,
    company: salary.company.name,
    companySlug: salary.company.slug,
    role: salary.role,
    roleSlug: roleSlug(salary.role),
    level: salary.level,
    levelTier: salary.normalizedLevel,
    location: salary.location,
    country: salary.country,
    base: salary.baseSalary,
    bonus: salary.bonus,
    equity: salary.equity,
    totalComp: salary.totalComp,
    yoe: salary.yearsExp ?? 0,
    currency: salary.currency,
    date: salary.createdAt,
  }
}

function toCompany(company: RawCompany): Company {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    industry: company.industry ?? 'Technology',
    logo: company.logo,
    logoBg: company.logo ?? logoColor(company.name),
    salariesReported: company.salariesReported,
    medianTC: company.medianTC,
    medianBase: company.medianBase,
    topLevelTC: company.topLevelTC ?? company.medianTC,
    levels: company.levels ?? [],
  }
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init)
    const payload = (await response.json()) as ApiResponse<T>
    if (!response.ok || payload.error) return null
    return payload.data
  } catch {
    return null
  }
}

export async function getSalaries(filters: SalaryFilters = {}): Promise<SalariesResult | null> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const result = await getJson<{
    salaries?: RawSalary[]
    data?: RawSalary[]
    total: number
    page: number
    totalPages: number
  }>(`/api/salaries?${params.toString()}`)

  if (!result) return null
  const salaries = result.salaries ?? result.data ?? []
  return {
    data: salaries.map(toSalaryEntry),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }
}

export async function getCompanies(): Promise<Company[] | null> {
  const companies = await getJson<RawCompany[]>('/api/companies')
  return companies?.map(toCompany) ?? null
}

export async function getCompany(slug: string): Promise<CompanyProfile | null> {
  const company = await getJson<RawCompany & {
    salaries: RawSalary[]
    groupedSalaries: CompanyProfile['groupedSalaries']
  }>(`/api/companies/${slug}`)
  if (!company) return null
  return {
    ...toCompany(company),
    salaries: company.salaries.map(toSalaryEntry),
    groupedSalaries: company.groupedSalaries,
  }
}

export async function compareSalaries(entries: string[]): Promise<ComparisonEntry[] | null> {
  const params = new URLSearchParams()
  entries.forEach((entry) => params.append('entries', entry))
  return getJson<ComparisonEntry[]>(`/api/compare?${params.toString()}`)
}

export async function getLevels(company?: string): Promise<LevelMap[] | null> {
  const params = new URLSearchParams()
  if (company) params.set('company', company)
  return getJson<LevelMap[]>(`/api/levels?${params.toString()}`)
}

export async function getStats(): Promise<StatsData | null> {
  return getJson<StatsData>('/api/stats')
}

export async function submitSalary(data: SubmitSalaryInput): Promise<SalaryEntry | null> {
  const salary = await getJson<RawSalary>('/api/salaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return salary ? toSalaryEntry(salary) : null
}
