import { NextResponse } from 'next/server'
import { getPrisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await getPrisma().$queryRaw`SELECT 1`
    return NextResponse.json({ data: { status: 'ok', database: 'ok', timestamp: new Date().toISOString() } })
  } catch {
    return NextResponse.json({ code: 'HEALTH_DATABASE_UNAVAILABLE', message: '서비스가 준비되지 않았습니다.' }, { status: 503 })
  }
}
