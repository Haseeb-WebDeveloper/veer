'use server'

import { createClient } from '@/lib/supabase/server'
import { syncUserToPrisma } from '@/lib/auth/sync-user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validation
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectTo = `${baseUrl}/auth/callback?next=/dashboard`

  // Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Sync user to Prisma
    try {
      await syncUserToPrisma(data.user)
    } catch (syncError) {
      console.error('Error syncing user:', syncError)
      // Continue even if sync fails - user is created in Supabase
    }

    // Check if email confirmation is required
    // If user is not confirmed, show success message instead of redirecting
    if (!data.user.email_confirmed_at) {
      revalidatePath('/', 'layout')
      return { success: true, message: 'We have sent you an email please verify.' }
    }

    // If email is already confirmed (shouldn't happen in normal flow), redirect to dashboard
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  return { error: 'Failed to create account' }
}

