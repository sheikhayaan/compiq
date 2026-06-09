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
            baseSalary: true,
            totalComp: true,
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

    const data = companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      logo: company.logo,
      _count: { salaries: company._count.salaries },
      salariesReported: company._count.salaries,
      medianTC: median(company.salaries.map((salary: any) => salary.totalComp)) ?? 0,
      medianBase: median(company.salaries.map((salary: any) => salary.baseSalary)) ?? 0,
      topLevelTC: Math.max(0, ...company.salaries.map((salary: any) => salary.totalComp)),
    }))

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch companies' }, { status: 500 })
  }
}
