import { NextResponse } from 'next/server';
import { SAMPLE_QUOTATIONS } from '@/lib/quotation-invoice';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_QUOTATIONS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.quotation.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_QUOTATIONS);
  } catch {
    return NextResponse.json(SAMPLE_QUOTATIONS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.quotation.deleteMany(),
      prisma.quotation.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
