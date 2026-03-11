import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/vibecoding_starter?schema=public"
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DATABASE_URL

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
  var __pgPool: Pool | undefined
}

const createPrismaClient = () => {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: DATABASE_URL,
    })
  }

  return new PrismaClient({
    adapter: new PrismaPg(global.__pgPool),
  })
}

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient()
  }
  prisma = global.__prisma
}

export { prisma }
