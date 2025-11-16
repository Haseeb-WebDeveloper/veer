import { createClient } from '@/lib/supabase/server'
import { syncUserToPrisma } from '@/lib/auth/sync-user'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Sync user to Prisma
      try {
        await syncUserToPrisma(data.user)
      } catch (syncError) {
        console.error('Error syncing user:', syncError)
        // Continue even if sync fails
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/signin?error=auth_failed', request.url))
}

