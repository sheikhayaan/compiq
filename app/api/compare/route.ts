import { prisma } from '@/lib/prisma'
import { median, percentile } from '@/lib/stats'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entries = searchParams.getAll('entries')

    const data = await Promise.all(
      entries.map(async (entry: any) => {
        const [companySlug, role, level] = entry.split(':')
        const company = await prisma.company.findUnique({
          where: { slug: companySlug },
          select: {
            name: true,
            slug: true,
          },
        })

        const salarySelect = {
          baseSalary: true,
          bonus: true,
          equity: true,
          totalComp: true,
          yearsExp: true,
          currency: true,
          location: true,
          country: true,
          normalizedLevel: true,
          company: { select: { name: true, slug: true } },
        }

        let salaries = await prisma.salary.findMany({
          where: {
            company: { slug: companySlug },
            role: { equals: role, mode: 'insensitive' },
            level: { equals: level, mode: 'insensitive' },
          },
          select: salarySelect,
        })

        if (salaries.length === 0) {
          salaries = await prisma.salary.findMany({
            where: {
              company: { slug: companySlug },
              level: { equals: level, mode: 'insensitive' },
            },
            select: salarySelect,
          })
        }

        const currencyCounts = salaries.reduce((acc: any, salary: any) => {
          acc[salary.currency] = (acc[salary.currency] || 0) + 1
          return acc
        }, {})
        const currency = Object.entries(currencyCounts)
          .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'USD'
        const filteredSalaries = salaries.filter((salary: any) => salary.currency === currency)
        const topValue = (items: string[]) => {
          const counts = items.reduce((acc: any, item: string) => {
            if (!item) return acc
            acc[item] = (acc[item] || 0) + 1
            return acc
          }, {})
          return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null
        }
        const location = topValue(filteredSalaries.map((salary: any) => salary.location))
        const country = topValue(filteredSalaries.map((salary: any) => salary.country))
        const sample = salaries[0]
        return {
          companySlug,
          companyName: sample?.company.name ?? company?.name ?? companySlug,
          role,
          level,
          normalizedLevel: sample?.normalizedLevel ?? null,
          medianBase: median(filteredSalaries.map((salary: any) => salary.baseSalary)),
          medianBonus: median(filteredSalaries.map((salary: any) => salary.bonus)),
          medianEquity: median(filteredSalaries.map((salary: any) => salary.equity)),
          medianTC: median(filteredSalaries.map((salary: any) => salary.totalComp)),
          p25TC: percentile(filteredSalaries.map((salary: any) => salary.totalComp), 25),
          p75TC: percentile(filteredSalaries.map((salary: any) => salary.totalComp), 75),
          count: filteredSalaries.length,
          medianYOE: median(filteredSalaries.flatMap((salary: any) => salary.yearsExp === null ? [] : [salary.yearsExp])),
          currency,
          location,
          country,
          market: currency === 'INR' ? 'India local market' : 'Global / United States market',
        }
      })
    )

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to compare salaries' }, { status: 500 })
  }
}
