import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { calculateTotalComp, normalizeCompanyName, normalizeLevel, slugifyCompany } from '@/lib/normalize'
import { prisma } from '@/lib/prisma'

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

const salarySchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  level: z.string().min(1),
  location: z.string().min(1),
  country: z.string().min(1),
  baseSalary: z.number().positive(),
  bonus: z.number().min(0).default(0),
  equity: z.number().min(0).default(0),
  yearsExp: z.number().int().min(0).optional(),
  currency: z.string().min(1).default('USD'),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const company = searchParams.get('company')
    const role = searchParams.get('role')
    const level = searchParams.get('level')
    const country = searchParams.get('country')
    const search = searchParams.get('search')
    const minTC = Number(searchParams.get('minTC') ?? Number.NaN)
    const maxTC = Number(searchParams.get('maxTC') ?? Number.NaN)
    const minYOE = Number(searchParams.get('minYOE') ?? Number.NaN)
    const maxYOE = Number(searchParams.get('maxYOE') ?? Number.NaN)

    const where = {
      ...(company ? { company: { name: { contains: company, mode: 'insensitive' as const } } } : {}),
      ...(role ? { role: { contains: role, mode: 'insensitive' as const } } : {}),
      ...(level ? { normalizedLevel: level } : {}),
      ...(country ? { country: { equals: country, mode: 'insensitive' as const } } : {}),
      ...(search
        ? {
            OR: [
              { role: { contains: search, mode: 'insensitive' as const } },
              { company: { name: { contains: search, mode: 'insensitive' as const } } },
              { level: { contains: search, mode: 'insensitive' as const } },
              { location: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(!Number.isNaN(minTC) || !Number.isNaN(maxTC)
        ? {
            totalComp: {
              ...(!Number.isNaN(minTC) ? { gte: minTC } : {}),
              ...(!Number.isNaN(maxTC) ? { lte: maxTC } : {}),
            },
          }
        : {}),
      ...(!Number.isNaN(minYOE) || !Number.isNaN(maxYOE)
        ? {
            yearsExp: {
              ...(!Number.isNaN(minYOE) ? { gte: minYOE } : {}),
              ...(!Number.isNaN(maxYOE) ? { lte: maxYOE } : {}),
            },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        select: salarySelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salary.count({ where }),
    ])

    return Response.json({
      data: { salaries: data, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) },
      error: null,
    })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = salarySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ data: null, error: parsed.error.message }, { status: 400 })
    }

    const input = parsed.data
    const companyName = normalizeCompanyName(input.companyName)
    const slug = slugifyCompany(companyName)
    const company = await prisma.company.upsert({
      where: { slug },
      create: {
        name: companyName,
        slug,
        aliases: [input.companyName],
        industry: 'Technology',
      },
      update: {},
      select: { id: true },
    })

    const duplicateSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const duplicate = await prisma.salary.findFirst({
      where: {
        companyId: company.id,
        role: input.role,
        level: input.level,
        country: input.country,
        userId: session.user.id,
        createdAt: { gte: duplicateSince },
      },
      select: { id: true },
    })

    if (duplicate) {
      return Response.json({ data: null, error: 'Already submitted recently' }, { status: 409 })
    }

    const normalized = normalizeLevel(companyName, input.level)
    const totalComp = calculateTotalComp(input.baseSalary, input.bonus, input.equity)
    const salary = await prisma.salary.create({
      data: {
        companyId: company.id,
        userId: session.user.id,
        role: input.role,
        level: input.level,
        normalizedLevel: normalized.normalizedLevel,
        levelOrder: normalized.levelOrder,
        location: input.location,
        country: input.country,
        baseSalary: input.baseSalary,
        bonus: input.bonus,
        equity: input.equity,
        totalComp,
        yearsExp: input.yearsExp,
        currency: input.currency,
      },
      select: salarySelect,
    })

    return Response.json({ data: salary, error: null }, { status: 201 })
  } catch {
    return Response.json({ data: null, error: 'Failed to submit salary' }, { status: 500 })
  }
}
