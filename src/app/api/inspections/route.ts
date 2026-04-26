import { NextResponse } from 'next/server';
import { SAMPLE_INSPECTIONS } from '@/lib/vehicle-inspection';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_INSPECTIONS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.vehicleInspection.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_INSPECTIONS);
  } catch {
    return NextResponse.json(SAMPLE_INSPECTIONS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.vehicleInspection.deleteMany(),
      prisma.vehicleInspection.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
