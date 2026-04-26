import { NextResponse } from 'next/server';
import { SAMPLE_APPOINTMENTS } from '@/components/AppointmentBooking';
import createPrisma from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json([]);
  try {
    const prisma = createPrisma();
    const rows = await prisma.appointment.findMany({ orderBy: { id: 'asc' } });
    await prisma.$disconnect();
    return NextResponse.json(rows);
  } catch (e) {
    console.error('Appointments GET error:', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });
  try {
    const items = await req.json();
    console.log('Saving appointments:', JSON.stringify(items[0], null, 2));
    const prisma = createPrisma();
    await prisma.$transaction([
      prisma.appointment.deleteMany(),
      prisma.appointment.createMany({ data: items }),
    ]);
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error('Appointment POST error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
