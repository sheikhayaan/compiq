import { prisma } from '@/lib/prisma'
import { median, percentile } from '@/lib/stats'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entries = searchParams.getAll('entries')

    const data = await Promise.all(
      entries.map(async (entry: any) => {
        const [companySlug, role, level] = entry.split(':')
        const salaries = await prisma.salary.findMany({
          where: {
            company: { slug: companySlug },
            role: { equals: role, mode: 'insensitive' },
            level: { equals: level, mode: 'insensitive' },
          },
          select: {
            baseSalary: true,
            bonus: true,
            equity: true,
            totalComp: true,
            yearsExp: true,
            normalizedLevel: true,
            company: { select: { name: true, slug: true } },
          },
        })

        const sample = salaries[0]
        return {
          companySlug,
          companyName: sample?.company.name ?? companySlug,
          role,
          level,
          normalizedLevel: sample?.normalizedLevel ?? null,
          medianBase: median(salaries.map((salary: any) => salary.baseSalary)),
          medianBonus: median(salaries.map((salary: any) => salary.bonus)),
          medianEquity: median(salaries.map((salary: any) => salary.equity)),
          medianTC: median(salaries.map((salary: any) => salary.totalComp)),
          p25TC: percentile(salaries.map((salary: any) => salary.totalComp), 25),
          p75TC: percentile(salaries.map((salary: any) => salary.totalComp), 75),
          count: salaries.length,
          medianYOE: median(salaries.flatMap((salary: any) => salary.yearsExp === null ? [] : [salary.yearsExp])),
        }
      })
    )

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to compare salaries' }, { status: 500 })
  }
}
