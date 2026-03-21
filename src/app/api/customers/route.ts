import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { NextResponse } from 'next/server'

const STATIC_CUSTOMERS = [
  { id: 1, name: 'John Doe',       email: 'john@example.com',    status: 'Active',   revenue: 2450, orders: 12, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Jane Smith',     email: 'jane@example.com',    status: 'Active',   revenue: 3890, orders: 18, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Bob Johnson',    email: 'bob@example.com',     status: 'Pending',  revenue: 1230, orders: 5,  createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Alice Brown',    email: 'alice@example.com',   status: 'Active',   revenue: 5670, orders: 24, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive', revenue: 890,  orders: 3,  createdAt: new Date(), updatedAt: new Date() },
  { id: 6, name: 'Diana Martinez', email: 'diana@example.com',   status: 'Active',   revenue: 4120, orders: 15, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, name: 'Ethan Davis',    email: 'ethan@example.com',   status: 'Active',   revenue: 3450, orders: 14, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, name: 'Fiona Garcia',   email: 'fiona@example.com',   status: 'Pending',  revenue: 2100, orders: 8,  createdAt: new Date(), updatedAt: new Date() },
]

export async function GET() {
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
