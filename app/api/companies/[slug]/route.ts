import { prisma } from '@/lib/prisma'
import { median } from '@/lib/stats'

const salarySelect = {
  id: true,
  role: true,
  level: true,
  normalizedLevel: true,
  location: true,
  country: true,
  baseSalary: true,
  bonus: true,
  equity: true,
  totalComp: true,
  yearsExp: true,
  currency: true,
  createdAt: true,
  company: {
    select: {
      name: true,
      slug: true,
    },
  },
}

export async function GET(_request: Request, context: RouteContext<'/api/companies/[slug]'>) {
  try {
    const { slug } = await context.params
    const company = await prisma.company.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        logo: true,
        salaries: {
          select: salarySelect,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { salaries: true },
        },
      },
    })

    if (!company) {
      return Response.json({ data: null, error: 'Company not found' }, { status: 404 })
    }

    const currencyCounts = company.salaries.reduce(
      (acc: any, s: any) => {
        acc[s.currency] = (acc[s.currency] || 0) + 1
        return acc
      }, {}
    )
    const dominantCurrency = Object.entries(currencyCounts)
      .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'USD'
    const filteredSalaries = company.salaries.filter(
      (s: any) => s.currency === dominantCurrency
    )

    const grouped = new Map<string, any[]>()
    filteredSalaries.forEach((salary: any) => {
      const existing = grouped.get(salary.level) ?? []
      existing.push(salary)
      grouped.set(salary.level, existing)
    })

    const groupedSalaries = Array.from(grouped.entries()).map(([level, salaries]: any) => ({
      level,
      normalizedLevel: salaries[0]?.normalizedLevel ?? 'Mid',
      count: salaries.length,
      medianBase: median(salaries.map((salary: any) => salary.baseSalary)) ?? 0,
      medianBonus: median(salaries.map((salary: any) => salary.bonus)) ?? 0,
      medianEquity: median(salaries.map((salary: any) => salary.equity)) ?? 0,
      medianTC: median(salaries.map((salary: any) => salary.totalComp)) ?? 0,
    }))

    const levels = groupedSalaries
      .map((level: any) => ({
        code: level.level,
        name: `${level.normalizedLevel} ${company.name}`,
        tier: level.normalizedLevel,
        typicalYoe:
          level.normalizedLevel === 'Junior' ? 1 :
          level.normalizedLevel === 'Mid' ? 3 :
          level.normalizedLevel === 'Senior' ? 6 :
          level.normalizedLevel === 'Staff' ? 9 : 12,
        medianTC: level.medianTC,
      }))
      .sort((a: any, b: any) => a.typicalYoe - b.typicalYoe)

    const data = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      logo: company.logo,
      _count: { salaries: company._count.salaries },
      salariesReported: company._count.salaries,
      medianTC: median(filteredSalaries.map((salary: any) => salary.totalComp)) ?? 0,
      medianBase: median(filteredSalaries.map((salary: any) => salary.baseSalary)) ?? 0,
      topLevelTC: Math.max(0, ...filteredSalaries.map((salary: any) => salary.totalComp)),
      dominantCurrency,
      levels,
      salaries: filteredSalaries,
      groupedSalaries,
    }

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch company' }, { status: 500 })
  }
}
