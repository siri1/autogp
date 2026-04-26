import { NextResponse } from 'next/server';
import createPrisma from '@/lib/db';

// SAMPLE_MOVEMENTS is defined inside PartsInventory.tsx - for now use empty array
const SAMPLE_MOVEMENTS: any[] = [];

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_MOVEMENTS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.stockMovement.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_MOVEMENTS);
  } catch {
    return NextResponse.json(SAMPLE_MOVEMENTS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.stockMovement.deleteMany(),
      prisma.stockMovement.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
