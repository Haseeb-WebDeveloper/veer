import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { configureSettingsCache } from '@/lib/cache/config'

/**
 * Get user settings
 * Uses private cache - per-user data (requires Suspense wrapper)
 * This is NOT a server action - it's a regular async function for Server Components
 */
export async function getUserSettings() {
  'use cache: private'
  
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get user from Prisma (by Supabase user ID)
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      include: {
        profile: true,
        businessSettings: true,
        subscription: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }
    
    // Configure cache after we have userId
    configureSettingsCache(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: user.profile,
      businessSettings: user.businessSettings,
      subscription: user.subscription,
    }
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return { error: 'Failed to fetch settings' }
  }
}

