import { PrismaClient } from '@/generated/prisma/client'
import { NextResponse }  from 'next/server'

const prisma = new PrismaClient()

const customers = [
  { name: 'John Doe',       email: 'john@example.com',    status: 'Active',   revenue: 2450, orders: 12 },
  { name: 'Jane Smith',     email: 'jane@example.com',    status: 'Active',   revenue: 3890, orders: 18 },
  { name: 'Bob Johnson',    email: 'bob@example.com',     status: 'Pending',  revenue: 1230, orders: 5  },
  { name: 'Alice Brown',    email: 'alice@example.com',   status: 'Active',   revenue: 5670, orders: 24 },
  { name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive', revenue: 890,  orders: 3  },
  { name: 'Diana Martinez', email: 'diana@example.com',   status: 'Active',   revenue: 4120, orders: 15 },
  { name: 'Ethan Davis',    email: 'ethan@example.com',   status: 'Active',   revenue: 3450, orders: 14 },
  { name: 'Fiona Garcia',   email: 'fiona@example.com',   status: 'Pending',  revenue: 2100, orders: 8  },
]

export async function GET() {
  try {
    for (const customer of customers) {
      await prisma.customer.upsert({
        where:  { email: customer.email },
        update: customer,
        create: customer,
      })
    }
    return NextResponse.json({ message: 'Seeding done!' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}