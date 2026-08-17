import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool }

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')
  const pool = new Pool({ connectionString, max: 5 })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  globalForPrisma.pool = pool
  globalForPrisma.prisma = prisma
  return prisma
}
