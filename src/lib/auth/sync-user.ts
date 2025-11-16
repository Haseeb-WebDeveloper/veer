import { db } from '@/lib/db'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export async function syncUserToPrisma(supabaseUser: SupabaseUser) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { id: supabaseUser.id },
    })

    if (existingUser) {
      // Update email if it changed
      if (existingUser.email !== supabaseUser.email) {
        await db.user.update({
          where: { id: supabaseUser.id },
          data: { email: supabaseUser.email ?? '' },
        })
      }
      return existingUser
    }

    // Create new user
    const newUser = await db.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
      },
    })

    return newUser
  } catch (error) {
    console.error('Error syncing user to Prisma:', error)
    throw error
  }
}

