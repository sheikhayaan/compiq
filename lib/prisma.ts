import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
})

export const prisma = global.prisma || new PrismaClient({
  adapter,
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
