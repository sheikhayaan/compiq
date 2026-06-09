/* eslint-disable @typescript-eslint/no-explicit-any */
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const globalForPrisma = globalThis as any

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
