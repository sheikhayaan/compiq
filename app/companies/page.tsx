'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Company = {
  id: string
  name: string
  slug: string
  industry?: string | null
  logo?: string | null
  salariesReported?: number
  medianTC?: number
  medianBase?: number
  topLevelTC?: number
  dominantCurrency?: string
  _count?: {
    salaries?: number
  }
}

type Stats = {
  totalCompanies: number
  totalSalaries: number
  mostSearchedCompany: string | null
  medianSWETC: number
}

type SortBy = 'reports' | 'tc' | 'alpha'

const categories = ['All', 'FAANG', 'Startup', 'MNC', 'India']

const logoColors: Record<string, string> = {
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

function getCategory(name: string): string[] {
  const groups: string[] = []
  if (['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft'].includes(name)) groups.push('FAANG')
  if (['Flipkart', 'Infosys', 'TCS', 'Swiggy', 'Razorpay', 'Zepto'].includes(name)) groups.push('India')
  if (['Stripe', 'Airbnb', 'Uber', 'Razorpay', 'Swiggy', 'Zepto'].includes(name)) groups.push('Startup')
  if (['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Infosys', 'TCS'].includes(name)) groups.push('MNC')
  return groups
}

function reportCount(company: Company): number {
  return company.salariesReported ?? company._count?.salaries ?? 0
}

function formatTC(value: number, currency: string): string {
  if (!value) return 'N/A'
  if (currency === 'INR' || value < 10000) {
    const lakhs = value / 100000
    return `₹${lakhs.toFixed(0)}L`
  }
  const k = value / 1000
  return `$${k.toFixed(0)}k`
}

function formatStatTC(value: number): string {
  if (!value) return 'N/A'
  return `$${(value / 1000).toFixed(0)}k`
}

function currencyForCompany(company: Company): string {
  return company.dominantCurrency || (['Flipkart', 'Infosys', 'TCS', 'Swiggy', 'Razorpay', 'Zepto'].includes(company.name) ? 'INR' : 'USD')
}

const toUsdRates: Record<string, number> = {
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

function formatDisplayTC(value: number, sourceCurrency: string, displayCurrency: 'USD' | 'INR'): string {
  if (!value) return 'N/A'
  const usd = value * (toUsdRates[sourceCurrency] ?? 1)
  const converted = displayCurrency === 'INR' ? usd * 83 : usd
  if (displayCurrency === 'INR') return `₹${(converted / 10000000).toFixed(2)}L`
  return `$${Math.round(converted / 1000)}k`
}

function SkeletonCard() {
  return (
    <div className="h-[292px] rounded-2xl border border-[rgba(30,30,46,1)] bg-slate-800/50 p-6 animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-700/70" />
        <div className="w-24 h-6 rounded-full bg-slate-700/70" />
      </div>
      <div className="w-40 h-7 rounded bg-slate-700/70 mb-3" />
      <div className="w-32 h-4 rounded bg-slate-700/60 mb-8" />
      <div className="h-px bg-slate-700/60 mb-6" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-12 rounded bg-slate-700/60" />
        <div className="h-12 rounded bg-slate-700/60" />
        <div className="h-12 rounded bg-slate-700/60" />
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortBy>('reports')
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'INR'>('USD')

  useEffect(() => {
    Promise.all([
      fetch('/api/companies').then((response) => response.json()),
      fetch('/api/stats').then((response) => response.json()),
    ])
      .then(([companiesData, statsData]: [{ data?: Company[] }, { data?: Stats }]) => {
        setCompanies(companiesData.data || [])
        setStats(statsData.data || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return companies
      .filter((company: any) => company.name.toLowerCase().includes(search.toLowerCase()))
      .filter((company: any) => {
        if (category === 'All') return true
        return getCategory(company.name).includes(category)
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'reports') return reportCount(b) - reportCount(a)
        if (sortBy === 'tc') return (b.medianTC || 0) - (a.medianTC || 0)
        if (sortBy === 'alpha') return a.name.localeCompare(b.name)
        return 0
      })
  }, [category, companies, search, sortBy])

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F1F5F9]">
      <section className="relative overflow-hidden border-b border-[rgba(30,30,46,1)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              Company Intelligence
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#64748B]">
              Explore compensation data across top technology companies worldwide
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <div className="relative max-w-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search companies..."
                className="w-full rounded-2xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.8)] py-4 pl-12 pr-4 text-sm text-white outline-none transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item: any) => {
                const active = category === item
                return (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-[#6366f1] bg-[#6366f1] text-white'
                        : 'border-[rgba(30,30,46,1)] bg-transparent text-[#64748B] hover:border-[#6366f1]/60 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Companies', value: stats?.totalCompanies.toLocaleString() ?? '0' },
            { label: 'Total Salary Reports', value: stats?.totalSalaries.toLocaleString() ?? '0' },
            { label: 'Most Reported Company', value: stats?.mostSearchedCompany ?? 'N/A' },
            { label: 'Median SWE TC', value: formatDisplayTC(stats?.medianSWETC ?? 0, 'USD', displayCurrency) },
          ].map((item: any) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.8)] p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Companies</h2>
            <p className="text-sm text-[#64748B]">{filtered.length} companies found</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.8)] p-1 sm:w-44">
              {(['USD', 'INR'] as const).map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setDisplayCurrency(currency)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    displayCurrency === currency ? 'bg-[#6366f1] text-white' : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="w-full rounded-xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.8)] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1] sm:w-56"
            >
              <option value="reports">Most Reports</option>
              <option value="tc">Highest Median TC</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_: any, index: any) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.45)] text-center">
            <div className="mb-4 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 p-4 text-[#6366f1]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">No companies found</h3>
            <p className="mt-2 text-sm text-[#64748B]">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((company: any) => {
              const currency = currencyForCompany(company)
              const reports = reportCount(company)
              return (
                <article
                  key={company.id}
                  className="group rounded-2xl border border-[rgba(30,30,46,1)] bg-[rgba(17,17,24,0.8)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f1]/80 hover:shadow-2xl hover:shadow-[#6366f1]/15 hover:animate-border-glow"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg"
                      style={{ backgroundColor: company.logo || logoColors[company.name] || '#6366f1' }}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <span className="rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                      {company.industry || 'Technology'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white">{company.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{reports.toLocaleString()} salary reports</p>

                  <div className="my-6 h-px bg-[rgba(30,30,46,1)]" />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Median TC</p>
                      <p className="mt-1 text-sm font-black text-white">{formatDisplayTC(company.medianTC || 0, currency, displayCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Median Base</p>
                      <p className="mt-1 text-sm font-black text-white">{formatDisplayTC(company.medianBase || 0, currency, displayCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Top Level</p>
                      <p className="mt-1 text-sm font-black text-white">{formatDisplayTC(company.topLevelTC || company.medianTC || 0, currency, displayCurrency)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/company/${company.slug}`)}
                    className="mt-6 w-full rounded-xl border border-[rgba(30,30,46,1)] bg-[#6366f1]/10 px-4 py-3 text-sm font-bold text-white transition hover:border-[#6366f1] hover:bg-[#6366f1]"
                  >
                    View Details →
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
