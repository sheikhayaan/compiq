import { prisma } from '@/lib/prisma'
import { median } from '@/lib/stats'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const companies = await prisma.company.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        logo: true,
        salaries: {
          select: {
            level: true,
            baseSalary: true,
            totalComp: true,
            currency: true,
          },
        },
        _count: {
          select: { salaries: true },
        },
      },
      orderBy: {
        salaries: {
          _count: 'desc',
        },
      },
    })

    const levelMaps = await prisma.levelMap.findMany({
      orderBy: [{ company: 'asc' }, { levelOrder: 'asc' }],
    })

    const data = companies.map((company: any) => {
      const currencyCounts = company.salaries.reduce((acc: any, salary: any) => {
        acc[salary.currency] = (acc[salary.currency] || 0) + 1
        return acc
      }, {})
      const dominantCurrency = Object.entries(currencyCounts)
        .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'USD'
      const filteredSalaries = company.salaries.filter((salary: any) => salary.currency === dominantCurrency)
      const companyLevels = levelMaps
        .filter((level: any) => level.company === company.name)
        .map((level: any) => {
          const levelSalaries = filteredSalaries.filter((salary: any) => salary.level === level.rawLevel)
          return {
            code: level.rawLevel,
            name: `${level.normalizedLevel} ${company.name}`,
            tier: level.normalizedLevel,
            typicalYoe:
              level.normalizedLevel === 'Junior' ? 1 :
              level.normalizedLevel === 'Mid' ? 3 :
              level.normalizedLevel === 'Senior' ? 6 :
              level.normalizedLevel === 'Staff' ? 9 : 12,
            medianTC: median(levelSalaries.map((salary: any) => salary.totalComp)) ?? 0,
          }
        })

      return {
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
        levels: companyLevels,
      }
    })

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch companies' }, { status: 500 })
  }
}
