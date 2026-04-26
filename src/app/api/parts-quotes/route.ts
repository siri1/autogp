import { NextResponse } from 'next/server';
import createPrisma from '@/lib/db';

const SAMPLE_PARTS_QUOTES: any[] = [];

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_PARTS_QUOTES);
  try {
    const prisma = createPrisma();
    const rows = await prisma.partsQuote.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_PARTS_QUOTES);
  } catch {
    return NextResponse.json(SAMPLE_PARTS_QUOTES);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.partsQuote.deleteMany(),
      prisma.partsQuote.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
