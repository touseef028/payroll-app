// app/api/period-close/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM period_close ORDER BY id`;
    return NextResponse.json({ periods: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch periods' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, status } = await request.json();
  try {
    await sql`UPDATE period_close SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ message: 'Period updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update period' }, { status: 500 });
  }
}
