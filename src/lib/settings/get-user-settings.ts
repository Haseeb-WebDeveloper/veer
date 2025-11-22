import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'

// This is NOT a server action - it's a regular async function for Server Components
export async function getUserSettings() {
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

