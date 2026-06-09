import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { normalizeLevel } from '../lib/normalize'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
})

const companies = [
  { name: 'Google', aliases: ['google inc', 'alphabet', 'google llc'], industry: 'Technology', logo: '#4285F4', levels: ['L3', 'L4', 'L5', 'L6', 'L7'] },
  { name: 'Meta', aliases: ['facebook', 'meta platforms'], industry: 'Technology & Social Media', logo: '#0668E1', levels: ['E3', 'E4', 'E5', 'E6', 'E7'] },
  { name: 'Amazon', aliases: ['amazon.com', 'amazon inc', 'aws'], industry: 'E-commerce & Cloud Computing', logo: '#FF9900', levels: ['L4', 'L5', 'L6', 'L7', 'L8'] },
  { name: 'Microsoft', aliases: ['microsoft corp', 'msft'], industry: 'Technology & Enterprise Software', logo: '#F25022', levels: ['59', '60', '62', '63', '65'] },
  { name: 'Apple', aliases: ['apple inc'], industry: 'Consumer Electronics & Tech', logo: '#555555', levels: ['ICT2', 'ICT3', 'ICT4', 'ICT5', 'ICT6'] },
  { name: 'Netflix', aliases: ['netflix inc'], industry: 'Streaming & Entertainment', logo: '#E50914', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Uber', aliases: ['uber technologies'], industry: 'Mobility', logo: '#111111', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Airbnb', aliases: [], industry: 'Travel Marketplace', logo: '#FF5A5F', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Stripe', aliases: [], industry: 'Fintech', logo: '#635BFF', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Flipkart', aliases: [], industry: 'E-commerce', logo: '#2874F0', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Infosys', aliases: [], industry: 'IT Services', logo: '#007CC3', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'TCS', aliases: ['tata consultancy services'], industry: 'IT Services', logo: '#4B2AAD', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Swiggy', aliases: [], industry: 'Consumer Internet', logo: '#FC8019', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Razorpay', aliases: [], industry: 'Fintech', logo: '#0B72E7', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
  { name: 'Zepto', aliases: [], industry: 'Quick Commerce', logo: '#8C1DAB', levels: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'] },
]

const roles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Engineering Manager',
  'Staff Engineer',
  'Principal Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
]

const usLocations = ['Mountain View, CA', 'Menlo Park, CA', 'Seattle, WA', 'New York, NY', 'Austin, TX', 'Redmond, WA']
const indiaLocations = ['Bangalore, India', 'Hyderabad, India', 'Pune, India', 'Gurugram, India', 'Mumbai, India']
const levelComp = {
  Junior: { us: [120000, 145000, 10000, 20000, 30000, 60000], india: [1500000, 2500000, 200000, 400000, 0, 500000], yoe: [1, 3] },
  Mid: { us: [155000, 185000, 20000, 35000, 60000, 100000], india: [2800000, 4000000, 400000, 700000, 500000, 1200000], yoe: [3, 5] },
  Senior: { us: [195000, 230000, 35000, 55000, 120000, 180000], india: [4500000, 6500000, 800000, 1400000, 1200000, 2500000], yoe: [5, 8] },
  Staff: { us: [240000, 280000, 55000, 80000, 180000, 250000], india: [7000000, 10000000, 1500000, 2500000, 2500000, 5000000], yoe: [8, 12] },
  Principal: { us: [290000, 350000, 80000, 120000, 250000, 400000], india: [11000000, 15000000, 2500000, 4000000, 5000000, 10000000], yoe: [12, 18] },
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length]
}

function rangeValue(min: number, max: number, seed: number) {
  return Math.round(min + ((seed * 7919) % (max - min + 1)))
}

async function main() {
  await prisma.salary.deleteMany()
  await prisma.levelMap.deleteMany()
  await prisma.company.deleteMany()

  for (const company of companies) {
    await prisma.company.create({
      data: {
        name: company.name,
        slug: slugify(company.name),
        aliases: company.aliases,
        industry: company.industry,
        logo: company.logo,
      },
    })

    for (const rawLevel of company.levels) {
      const normalized = normalizeLevel(company.name, rawLevel)
      await prisma.levelMap.create({
        data: {
          company: company.name,
          rawLevel,
          normalizedLevel: normalized.normalizedLevel,
          levelOrder: normalized.levelOrder,
        },
      })
    }
  }

  let seed = 1
  const createdCompanies = await prisma.company.findMany({ select: { id: true, name: true } })
  for (const company of createdCompanies) {
    const source = companies.find((item) => item.name === company.name)
    if (!source) continue

    for (const rawLevel of source.levels) {
      const normalized = normalizeLevel(company.name, rawLevel)
      for (let i = 0; i < 3; i += 1) {
        const role = pick(roles, seed + i)
        const isIndia = seed % 3 === 0 || ['Flipkart', 'Infosys', 'TCS', 'Swiggy', 'Razorpay', 'Zepto'].includes(company.name)
        const location = isIndia ? pick(indiaLocations, seed) : pick(usLocations, seed)
        const compBand = levelComp[normalized.normalizedLevel as keyof typeof levelComp]
        const band = isIndia ? compBand.india : compBand.us
        const baseSalary = rangeValue(band[0], band[1], seed)
        const bonus = rangeValue(band[2], band[3], seed + 3)
        const equity = rangeValue(band[4], band[5], seed + 7)
        const yearsExp = rangeValue(compBand.yoe[0], compBand.yoe[1], seed)
        const createdAt = new Date(Date.now() - ((seed * 19) % 180) * 24 * 60 * 60 * 1000)
        const totalComp = baseSalary + bonus + equity
        if (totalComp > 2000000) continue

        await prisma.salary.create({
          data: {
            companyId: company.id,
            role,
            level: rawLevel,
            levelOrder: normalized.levelOrder,
            normalizedLevel: normalized.normalizedLevel,
            location,
            country: isIndia ? 'India' : 'US',
            baseSalary,
            bonus,
            equity,
            totalComp,
            yearsExp,
            currency: isIndia ? 'INR' : 'USD',
            verified: seed % 4 !== 0,
            createdAt,
          },
        })
        seed += 1
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
