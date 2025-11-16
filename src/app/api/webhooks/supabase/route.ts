// Alternative webhook approach for syncing Supabase auth users to Prisma
// This can be used instead of database triggers if preferred
// 
// To set up:
// 1. Go to Supabase Dashboard > Database > Webhooks
// 2. Create webhook for auth.users table
// 3. Set URL to: https://yourdomain.com/api/webhooks/supabase
// 4. Set secret in environment variables: SUPABASE_WEBHOOK_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-supabase-webhook-secret')
    if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const { type, table, record } = payload

    // Only process auth.users table
    if (table !== 'users' || type !== 'INSERT') {
      return NextResponse.json({ ok: true })
    }

    // Sync user to Prisma
    await db.user.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        email: record.email || '',
      },
      update: {
        email: record.email || '',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

