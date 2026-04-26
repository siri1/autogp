import { NextResponse } from 'next/server';
import { SAMPLE_MAINTENANCE_PACKS } from '@/lib/maintenance-packs';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_MAINTENANCE_PACKS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.maintenancePack.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_MAINTENANCE_PACKS);
  } catch {
    return NextResponse.json(SAMPLE_MAINTENANCE_PACKS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.maintenancePack.deleteMany(),
      prisma.maintenancePack.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
