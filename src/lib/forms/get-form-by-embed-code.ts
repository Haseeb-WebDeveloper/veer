import { db } from '@/lib/db'
import { configurePublicFormCache } from '@/lib/cache/config'
import type { FormData, FormField } from '@/types/form'

/**
 * Get form by embed code (public access, no auth required)
 * Uses public cache - same for all users
 */
export async function getFormByEmbedCode(
  embedCode: string
): Promise<FormData | { error: string }> {
  'use cache'
  configurePublicFormCache(embedCode)
  
  try {
    const form = await db.form.findUnique({
      where: { embedCode },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        fields: true,
        theme: true,
        formSettings: true,
        redirectUrl: true,
        successMessage: true,
        isActive: true,
      },
    })

    if (!form) {
      return { error: 'Form not found' }
    }

    if (!form.isActive) {
      return { error: 'This form is not active' }
    }

    return {
      id: form.id,
      name: form.name,
      title: form.title,
      description: form.description,
      fields: (form.fields as any[]) || [],
      theme: (form.theme as any) || { primaryColor: '#3B82F6', submitText: 'Submit' },
      formSettings: (form.formSettings as any) || null,
      redirectUrl: form.redirectUrl || null,
      successMessage: form.successMessage || 'Thank you! We will be in touch soon.',
      isActive: form.isActive,
    }
  } catch (error) {
    console.error('Error fetching form by embed code:', error)
    return { error: 'Failed to fetch form' }
  }
}

