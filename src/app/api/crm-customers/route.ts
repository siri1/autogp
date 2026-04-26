import { NextResponse } from 'next/server';
import { SAMPLE_CRM_CUSTOMERS } from '@/lib/crm-data';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_CRM_CUSTOMERS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.cRMCustomer.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_CRM_CUSTOMERS);
  } catch {
    return NextResponse.json(SAMPLE_CRM_CUSTOMERS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.cRMCustomer.deleteMany(),
      prisma.cRMCustomer.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
