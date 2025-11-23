import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { configureUserDataCache } from '@/lib/cache/config'

export type FormData = {
  id: string
  name: string
  title: string | null
  description: string | null
  isActive: boolean
  embedCode: string | null
  submissionsCount: number
  createdAt: Date
  updatedAt: Date
}

export type UserFormsData = {
  forms: FormData[]
}

/**
 * Get all forms for the current user
 * Uses private cache - per-user data (requires Suspense wrapper)
 * This is NOT a server action - it's a regular async function for Server Components
 */
export async function getUserForms(): Promise<
  UserFormsData | { error: string }
> {
  'use cache: private'
  
  const supabaseUser = await getUser()

  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get user from Prisma (by Supabase user email)
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      select: { id: true },
    })

    if (!user) {
      return { error: 'User not found' }
    }
    
    // Configure cache after we have userId
    configureUserDataCache(user.id, 'forms')

    // Get all forms for the user with submission count
    const forms = await db.form.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        isActive: true,
        embedCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform to match FormData type
    const formsData: FormData[] = forms.map((form) => ({
      id: form.id,
      name: form.name,
      title: form.title,
      description: form.description,
      isActive: form.isActive,
      embedCode: form.embedCode,
      submissionsCount: form._count.submissions,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }))

    return { forms: formsData }
  } catch (error) {
    console.error('Error fetching user forms:', error)
    return { error: 'Failed to fetch forms' }
  }
}

