import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    const data = await prisma.levelMap.findMany({
      where: company ? { company: { equals: company, mode: 'insensitive' } } : {},
      select: {
        id: true,
        company: true,
        rawLevel: true,
        normalizedLevel: true,
        levelOrder: true,
      },
      orderBy: [{ company: 'asc' }, { levelOrder: 'asc' }],
    })

    return Response.json({ data, error: null })
  } catch {
    return Response.json({ data: null, error: 'Failed to fetch levels' }, { status: 500 })
  }
}
