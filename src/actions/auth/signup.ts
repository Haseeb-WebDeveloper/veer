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

  // Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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

    revalidatePath('/', 'layout')
    redirect('/')
  }

  return { error: 'Failed to create account' }
}

