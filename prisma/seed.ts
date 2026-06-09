import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { normalizeLevel } from '../lib/normalize'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
})

type LevelName = 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal'
type Range = {
  base: [number, number]
  bonus: [number, number]
  equity: [number, number]
}

const countries = {
  US: {
    currency: 'USD',
    locations: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Austin, TX'],
  },
  India: {
    currency: 'INR',
    locations: ['Bangalore, India', 'Hyderabad, India', 'Mumbai, India', 'Pune, India'],
  },
  UK: {
    currency: 'GBP',
    locations: ['London, UK', 'Manchester, UK', 'Edinburgh, UK'],
  },
  Canada: {
    currency: 'CAD',
    locations: ['Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada'],
  },
  Germany: {
    currency: 'EUR',
    locations: ['Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany'],
  },
  Singapore: {
    currency: 'SGD',
    locations: ['Singapore City, Singapore'],
  },
  Australia: {
    currency: 'AUD',
    locations: ['Sydney, Australia', 'Melbourne, Australia'],
  },
  Netherlands: {
    currency: 'EUR',
    locations: ['Amsterdam, Netherlands'],
  },
  France: {
    currency: 'EUR',
    locations: ['Paris, France'],
  },
  UAE: {
    currency: 'AED',
    locations: ['Dubai, UAE', 'Abu Dhabi, UAE'],
  },
  Japan: {
    currency: 'JPY',
    locations: ['Tokyo, Japan'],
  },
  Brazil: {
    currency: 'BRL',
    locations: ['Sao Paulo, Brazil'],
  },
} as const

type CountryName = keyof typeof countries
type Currency = (typeof countries)[CountryName]['currency']

const compensationBands: Record<Currency, Record<LevelName, Range>> = {
  USD: {
    Junior: { base: [120000, 140000], bonus: [10000, 18000], equity: [25000, 50000] },
    Mid: { base: [145000, 175000], bonus: [18000, 30000], equity: [50000, 85000] },
    Senior: { base: [180000, 220000], bonus: [30000, 50000], equity: [85000, 140000] },
    Staff: { base: [225000, 265000], bonus: [50000, 70000], equity: [140000, 180000] },
    Principal: { base: [270000, 320000], bonus: [70000, 100000], equity: [180000, 220000] },
  },
  INR: {
    Junior: { base: [1200000, 2000000], bonus: [150000, 300000], equity: [0, 300000] },
    Mid: { base: [2200000, 3500000], bonus: [300000, 600000], equity: [300000, 800000] },
    Senior: { base: [3800000, 5500000], bonus: [600000, 1000000], equity: [800000, 1800000] },
    Staff: { base: [5800000, 8000000], bonus: [1000000, 1800000], equity: [1800000, 3000000] },
    Principal: { base: [8500000, 11000000], bonus: [1800000, 3000000], equity: [3000000, 5000000] },
  },
  GBP: {
    Junior: { base: [42000, 55000], bonus: [3000, 7000], equity: [4000, 12000] },
    Mid: { base: [58000, 75000], bonus: [7000, 12000], equity: [12000, 25000] },
    Senior: { base: [78000, 100000], bonus: [12000, 20000], equity: [25000, 45000] },
    Staff: { base: [105000, 130000], bonus: [20000, 32000], equity: [45000, 75000] },
    Principal: { base: [135000, 165000], bonus: [32000, 50000], equity: [75000, 110000] },
  },
  CAD: {
    Junior: { base: [75000, 95000], bonus: [5000, 9000], equity: [8000, 20000] },
    Mid: { base: [98000, 120000], bonus: [9000, 16000], equity: [20000, 40000] },
    Senior: { base: [125000, 155000], bonus: [16000, 28000], equity: [40000, 70000] },
    Staff: { base: [158000, 190000], bonus: [28000, 42000], equity: [70000, 100000] },
    Principal: { base: [195000, 235000], bonus: [42000, 60000], equity: [100000, 130000] },
  },
  EUR: {
    Junior: { base: [45000, 60000], bonus: [3000, 7000], equity: [4000, 12000] },
    Mid: { base: [63000, 80000], bonus: [7000, 12000], equity: [12000, 25000] },
    Senior: { base: [83000, 105000], bonus: [12000, 20000], equity: [25000, 45000] },
    Staff: { base: [108000, 135000], bonus: [20000, 32000], equity: [45000, 75000] },
    Principal: { base: [138000, 168000], bonus: [32000, 50000], equity: [75000, 105000] },
  },
  SGD: {
    Junior: { base: [55000, 72000], bonus: [4000, 8000], equity: [8000, 18000] },
    Mid: { base: [75000, 95000], bonus: [8000, 14000], equity: [18000, 35000] },
    Senior: { base: [98000, 125000], bonus: [14000, 24000], equity: [35000, 65000] },
    Staff: { base: [128000, 158000], bonus: [24000, 38000], equity: [65000, 95000] },
    Principal: { base: [162000, 198000], bonus: [38000, 55000], equity: [95000, 125000] },
  },
  AUD: {
    Junior: { base: [70000, 88000], bonus: [4000, 8000], equity: [8000, 18000] },
    Mid: { base: [90000, 112000], bonus: [8000, 14000], equity: [18000, 35000] },
    Senior: { base: [115000, 142000], bonus: [14000, 24000], equity: [35000, 60000] },
    Staff: { base: [145000, 175000], bonus: [24000, 36000], equity: [60000, 90000] },
    Principal: { base: [178000, 215000], bonus: [36000, 52000], equity: [90000, 120000] },
  },
  AED: {
    Junior: { base: [110000, 140000], bonus: [8000, 15000], equity: [0, 15000] },
    Mid: { base: [145000, 180000], bonus: [15000, 28000], equity: [15000, 40000] },
    Senior: { base: [185000, 225000], bonus: [28000, 44000], equity: [40000, 80000] },
    Staff: { base: [228000, 272000], bonus: [44000, 62000], equity: [80000, 120000] },
    Principal: { base: [275000, 325000], bonus: [62000, 90000], equity: [120000, 160000] },
  },
  JPY: {
    Junior: { base: [4500000, 6000000], bonus: [400000, 800000], equity: [0, 800000] },
    Mid: { base: [6200000, 8000000], bonus: [800000, 1400000], equity: [800000, 2000000] },
    Senior: { base: [8200000, 10500000], bonus: [1400000, 2200000], equity: [2000000, 3800000] },
    Staff: { base: [10800000, 13500000], bonus: [2200000, 3400000], equity: [3800000, 6000000] },
    Principal: { base: [13800000, 17000000], bonus: [3400000, 5000000], equity: [6000000, 8500000] },
  },
  BRL: {
    Junior: { base: [75000, 105000], bonus: [7000, 13000], equity: [0, 18000] },
    Mid: { base: [108000, 140000], bonus: [13000, 22000], equity: [18000, 40000] },
    Senior: { base: [143000, 180000], bonus: [22000, 35000], equity: [40000, 80000] },
    Staff: { base: [183000, 222000], bonus: [35000, 52000], equity: [80000, 120000] },
    Principal: { base: [225000, 275000], bonus: [52000, 75000], equity: [120000, 150000] },
  },
}

const maxTC: Record<string, number> = {
  USD: 550000, INR: 12000000, GBP: 280000,
  CAD: 380000, EUR: 280000, SGD: 380000,
  AUD: 380000, AED: 500000, JPY: 22000000,
  BRL: 450000,
}

const yoeRanges: Record<LevelName, [number, number]> = {
  Junior: [0, 2],
  Mid: [2, 5],
  Senior: [5, 8],
  Staff: [8, 12],
  Principal: [12, 18],
}

const companies = [
  { name: 'Google', aliases: ['google inc', 'alphabet', 'google llc'], industry: 'Technology', logo: '#4285F4', levels: ['L3', 'L4', 'L5', 'L6', 'L7'] },
  { name: 'Meta', aliases: ['facebook', 'meta platforms'], industry: 'Technology & Social Media', logo: '#0668E1', levels: ['E3', 'E4', 'E5', 'E6', 'E7'] },
  { name: 'Amazon', aliases: ['amazon.com', 'amazon inc', 'aws'], industry: 'E-commerce & Cloud Computing', logo: '#FF9900', levels: ['L4', 'L5', 'L6', 'L7', 'L8'] },
  { name: 'Microsoft', aliases: ['microsoft corp', 'msft'], industry: 'Technology & Enterprise Software', logo: '#F25022', levels: ['59', '60', '62', '63', '65'] },
  { name: 'Apple', aliases: ['apple inc'], industry: 'Consumer Electronics & Tech', logo: '#555555', levels: ['ICT2', 'ICT3', 'ICT4', 'ICT5', 'ICT6'] },
  { name: 'Netflix', aliases: ['netflix inc'], industry: 'Streaming & Entertainment', logo: '#E50914', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Uber', aliases: ['uber technologies'], industry: 'Mobility', logo: '#111111', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Airbnb', aliases: [], industry: 'Travel Marketplace', logo: '#FF5A5F', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Stripe', aliases: [], industry: 'Fintech', logo: '#635BFF', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Flipkart', aliases: [], industry: 'E-commerce', logo: '#2874F0', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Infosys', aliases: [], industry: 'IT Services', logo: '#007CC3', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'TCS', aliases: ['tata consultancy services'], industry: 'IT Services', logo: '#4B2AAD', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Swiggy', aliases: [], industry: 'Consumer Internet', logo: '#FC8019', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Razorpay', aliases: [], industry: 'Fintech', logo: '#0B72E7', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Zepto', aliases: [], industry: 'Quick Commerce', logo: '#8C1DAB', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
]

const countryDistribution: Record<string, Partial<Record<CountryName, number>>> = {
  Google: { US: 8, India: 6, UK: 4, Canada: 3, Germany: 2, Singapore: 2 },
  Meta: { US: 8, India: 6, UK: 4, Canada: 3, Singapore: 2, Australia: 2 },
  Amazon: { US: 8, India: 6, UK: 4, Germany: 3, Japan: 2, Australia: 2 },
  Microsoft: { US: 7, India: 5, UK: 3, Canada: 3, UAE: 2 },
  Apple: { US: 7, India: 4, UK: 4, Singapore: 3, Australia: 2 },
  Netflix: { US: 6, UK: 4, Germany: 3, Netherlands: 2 },
  Uber: { US: 5, India: 4, UK: 3, Brazil: 3 },
  Airbnb: { US: 5, India: 3, France: 4, Germany: 3 },
  Stripe: { US: 5, UK: 5, India: 3, Singapore: 2 },
  Flipkart: { India: 15 },
  Infosys: { India: 8, US: 4, UK: 3 },
  TCS: { India: 8, US: 4, UK: 3 },
  Swiggy: { India: 12 },
  Razorpay: { India: 8, Singapore: 4 },
  Zepto: { India: 12 },
}

const roles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Engineer',
  'Principal Engineer',
  'Engineering Manager',
  'Product Manager',
  'Data Scientist',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'ML Engineer',
  'Mobile Engineer',
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

function random(seed: number) {
  const value = Math.sin(seed * 9999) * 10000
  return value - Math.floor(value)
}

function rangeValue([min, max]: [number, number], seed: number) {
  return Math.round(min + random(seed) * (max - min))
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.floor(random(seed) * items.length) % items.length]
}

function createdWithinSixMonths(seed: number) {
  const daysAgo = Math.floor(random(seed) * 180)
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
}

function buildSalaryPlans() {
  const plans: Array<{ companyName: string; country: CountryName }> = []

  for (const company of companies) {
    const distribution = countryDistribution[company.name]
    for (const [country, count] of Object.entries(distribution)) {
      for (let index = 0; index < count; index += 1) {
        plans.push({ companyName: company.name, country: country as CountryName })
      }
    }
  }

  const targetCount = 360
  let index = 0
  while (plans.length < targetCount) {
    const company = companies[index % companies.length]
    const availableCountries = Object.keys(countryDistribution[company.name]) as CountryName[]
    plans.push({
      companyName: company.name,
      country: availableCountries[index % availableCountries.length],
    })
    index += 1
  }

  return plans
}

async function main() {
  await prisma.salary.deleteMany()
  await prisma.levelMap.deleteMany()
  await prisma.company.deleteMany()

  const companyRows = new Map<string, { id: string; name: string }>()

  for (const company of companies) {
    const created = await prisma.company.create({
      data: {
        name: company.name,
        slug: slugify(company.name),
        aliases: company.aliases,
        industry: company.industry,
        logo: company.logo,
      },
      select: { id: true, name: true },
    })
    companyRows.set(company.name, created)

    for (const rawLevel of company.levels) {
      const normalized = normalizeLevel(company.name, rawLevel)
      await prisma.levelMap.create({
        data: {
          company: company.name,
          rawLevel,
          normalizedLevel: normalized.normalizedLevel,
          levelOrder: normalized.levelOrder,
        },
      })
    }
  }

  const salaryPlans = buildSalaryPlans()
  let seed = 1

  for (const plan of salaryPlans) {
    const company = companies.find((item) => item.name === plan.companyName)
    const companyRow = companyRows.get(plan.companyName)
    if (!company || !companyRow) continue

    const rawLevel = pick(company.levels, seed)
    const normalized = normalizeLevel(company.name, rawLevel)
    const normalizedLevel = normalized.normalizedLevel as LevelName
    const country = countries[plan.country]
    const band = compensationBands[country.currency][normalizedLevel]
    const baseSalary = rangeValue(band.base, seed + 11)
    const bonus = rangeValue(band.bonus, seed + 17)
    const equity = rangeValue(band.equity, seed + 23)
    const totalComp = baseSalary + bonus + equity
    const currency = country.currency

    if (totalComp > (maxTC[currency] || 550000)) {
      seed += 1
      continue
    }

    await prisma.salary.create({
      data: {
        companyId: companyRow.id,
        role: pick(roles, seed + 29),
        level: rawLevel,
        levelOrder: normalized.levelOrder,
        normalizedLevel,
        location: pick(country.locations, seed + 31),
        country: plan.country,
        baseSalary,
        bonus,
        equity,
        totalComp,
        yearsExp: rangeValue(yoeRanges[normalizedLevel], seed + 37),
        currency,
        verified: true,
        createdAt: createdWithinSixMonths(seed + 41),
      },
    })

    seed += 1
  }

  const [salaryCount, companyCount, countryRows] = await Promise.all([
    prisma.salary.count(),
    prisma.company.count(),
    prisma.salary.groupBy({ by: ['country'] }),
  ])

  console.log(`✅ Seeded ${salaryCount} salaries across ${companyCount} companies in ${countryRows.length} countries`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
