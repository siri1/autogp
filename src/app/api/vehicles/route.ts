import { NextResponse } from 'next/server';
import { SAMPLE_VEHICLES } from '@/components/VehicleDatabase';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json([]);
  try {
    const prisma = createPrisma();
    const rows = await prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows);
  } catch (e) {
    console.error('Vehicles GET error:', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.vehicle.deleteMany(),
      prisma.vehicle.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
