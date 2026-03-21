import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { NextResponse }  from 'next/server'

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

const customers = [
  { name: 'João Silva',      email: 'joao.silva@email.ao',    status: 'Active',   revenue: 2450, orders: 12 },
  { name: 'Maria Santos',    email: 'maria.santos@email.ao',  status: 'Active',   revenue: 3890, orders: 18 },
  { name: 'Carlos Mendes',   email: 'carlos.mendes@email.ao', status: 'Pending',  revenue: 1230, orders: 5  },
  { name: 'Ana Rodrigues',   email: 'ana.rodrigues@email.ao', status: 'Active',   revenue: 5670, orders: 24 },
  { name: 'Pedro Ferreira',  email: 'pedro@email.ao',         status: 'Inactive', revenue: 890,  orders: 3  },
  { name: 'Beatriz Costa',   email: 'beatriz@email.ao',       status: 'Active',   revenue: 4120, orders: 15 },
  { name: 'António Lopes',   email: 'antonio@email.ao',       status: 'Active',   revenue: 3450, orders: 14 },
  { name: 'Sofia Gonçalves', email: 'sofia@email.ao',         status: 'Pending',  revenue: 2100, orders: 8  },
]

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  }
  try {
    const prisma = createPrisma()
    for (const customer of customers) {
      await prisma.customer.upsert({
        where:  { email: customer.email },
        update: customer,
        create: customer,
      })
    }
    await prisma.$disconnect()
    return NextResponse.json({ message: 'Seeding done!' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
