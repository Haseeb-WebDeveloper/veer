'use server'

import { createClient } from '@/lib/supabase/server'

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    // Return the URL for client-side redirect
    return { url: data.url }
  }

  return { error: 'Failed to initiate OAuth sign in' }
}

