import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'

/**
 * Get form by ID (for authenticated users)
 */
export async function getFormById(formId: string) {
  const supabaseUser = await getUser()

  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get user from Prisma
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      select: { id: true },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Get form (only if it belongs to the user)
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: user.id,
      },
      select: {
        id: true,
        embedCode: true,
        name: true,
        title: true,
        description: true,
        fields: true,
        theme: true,
        formSettings: true,
        automationConfig: true,
        isActive: true,
      },
    })

    if (!form) {
      return { error: 'Form not found' }
    }

    return {
      id: form.id,
      embedCode: form.embedCode,
      name: form.name,
      title: form.title,
      description: form.description,
      fields: (form.fields as any[]) || [],
      theme: (form.theme as any) || {},
      formSettings: (form.formSettings as any) || null,
      automationConfig: (form.automationConfig as any) || null,
      isActive: form.isActive,
    }
  } catch (error) {
    console.error('Error fetching form:', error)
    return { error: 'Failed to fetch form' }
  }
}

