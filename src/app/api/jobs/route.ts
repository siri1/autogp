import { NextResponse } from 'next/server';
import { SAMPLE_JOBS } from '@/lib/quotation-invoice';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(SAMPLE_JOBS);
  try {
    const prisma = createPrisma();
    const rows = await prisma.job.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows.length ? rows : SAMPLE_JOBS);
  } catch {
    return NextResponse.json(SAMPLE_JOBS);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.job.deleteMany(),
      prisma.job.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
