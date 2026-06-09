import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { median } from '@/lib/stats'

const companySelect = {
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
} satisfies Prisma.CompanySelect

type CompanyWithCount = Prisma.CompanyGetPayload<{
  select: typeof companySelect
}>
type CompanySalaryItem = CompanyWithCount['salaries'][number]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const companies = await prisma.company.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
      select: companySelect,
      orderBy: {
        salaries: {
          _count: 'desc',
        },
      },
    })

    const data = companies.map((company: CompanyWithCount) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      logo: company.logo,
      _count: { salaries: company._count.salaries },
      salariesReported: company._count.salaries,
      medianTC: median(company.salaries.map((salary: CompanySalaryItem) => salary.totalComp)) ?? 0,
      medianBase: median(company.salaries.map((salary: CompanySalaryItem) => salary.baseSalary)) ?? 0,
      topLevelTC: Math.max(0, ...company.salaries.map((salary: CompanySalaryItem) => salary.totalComp)),
    }))

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch companies' }, { status: 500 })
  }
}
