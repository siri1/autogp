import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { NextResponse } from 'next/server'

const STATIC_CUSTOMERS = [
  { id: 1, name: 'João Silva',       email: 'joao.silva@email.ao',    status: 'Active',   revenue: 2450, orders: 12 },
  { id: 2, name: 'Maria Santos',     email: 'maria.santos@email.ao',  status: 'Active',   revenue: 3890, orders: 18 },
  { id: 3, name: 'Carlos Mendes',    email: 'carlos.mendes@email.ao', status: 'Pending',  revenue: 1230, orders: 5  },
  { id: 4, name: 'Ana Rodrigues',    email: 'ana.rodrigues@email.ao', status: 'Active',   revenue: 5670, orders: 24 },
  { id: 5, name: 'Pedro Ferreira',   email: 'pedro@email.ao',         status: 'Inactive', revenue: 890,  orders: 3  },
  { id: 6, name: 'Beatriz Costa',    email: 'beatriz@email.ao',       status: 'Active',   revenue: 4120, orders: 15 },
  { id: 7, name: 'António Lopes',    email: 'antonio@email.ao',       status: 'Active',   revenue: 3450, orders: 14 },
  { id: 8, name: 'Sofia Gonçalves',  email: 'sofia@email.ao',         status: 'Pending',  revenue: 2100, orders: 8  },
]

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(STATIC_CUSTOMERS)
  }
  try {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    const prisma = new PrismaClient({ adapter })
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } })
    await prisma.$disconnect()
    return NextResponse.json(customers)
  } catch (err) {
    console.error('DB unavailable, using static data:', err)
    return NextResponse.json(STATIC_CUSTOMERS)
  }
}
