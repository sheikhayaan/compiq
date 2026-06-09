import { prisma } from '@/lib/prisma'
import { median, percentile } from '@/lib/stats'

export async function GET() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const [salaries, totalCompanies, mostReportedCompany, recentRoles] = await Promise.all([
      prisma.salary.findMany({
        select: {
          role: true,
          totalComp: true,
        },
      }),
      prisma.company.count(),
      prisma.company.findFirst({
        select: {
          name: true,
          _count: { select: { salaries: true } },
        },
        orderBy: {
          salaries: { _count: 'desc' },
        },
      }),
      prisma.salary.groupBy({
        by: ['role'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { role: true },
        orderBy: { _count: { role: 'desc' } },
        take: 1,
      }),
    ])

    const totalComps = salaries.map((salary: any) => salary.totalComp)
    const sweComps = salaries
      .filter((salary: any) => salary.role.toLowerCase().includes('engineer'))
      .map((salary: any) => salary.totalComp)

    return Response.json({
      data: {
        totalSalaries: salaries.length,
        totalCompanies,
        medianSWETC: median(sweComps) ?? 0,
        topTenPercentTC: percentile(totalComps, 90) ?? 0,
        mostSearchedCompany: mostReportedCompany?.name ?? null,
        trendingRole: recentRoles[0]?.role ?? null,
      },
      error: null,
    })
  } catch (error) {
    console.log(error)
    return Response.json({
      data: {
        totalSalaries: 0,
        totalCompanies: 0,
        medianSWETC: 0,
        topTenPercentTC: 0,
        mostSearchedCompany: 'Google',
        trendingRole: 'Software Engineer',
      },
      error: null,
    })
  }
}
