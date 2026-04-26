import { NextResponse } from 'next/server';
import createPrisma from '@/lib/db';

// SAMPLE_SUPPLIERS is defined inside PartsInventory.tsx - for now use empty array
const SAMPLE_SUPPLIERS: any[] = [];

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_SUPPLIERS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.supplier.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_SUPPLIERS);
  } catch {
    return NextResponse.json(SAMPLE_SUPPLIERS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.supplier.deleteMany(),
      prisma.supplier.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
