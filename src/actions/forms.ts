'use server'

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { updateTag } from 'next/cache'
import { randomUUID } from 'crypto'
import { 
  invalidateFormsCache, 
  invalidateFormCache, 
  invalidateFormEmbedCache,
  invalidateUserCacheTag,
  CACHE_TAGS 
} from '@/lib/cache/config'
import type { FormWithEmbedCode } from '@/types/form'

/**
 * Create a new form
 */
export async function createForm(formData: FormData) {
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

    const name = formData.get('name') as string
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null

    if (!name || name.trim().length === 0) {
      return { error: 'Form name is required' }
    }

    // Generate unique embed code
    const embedCode = `form_${randomUUID().replace(/-/g, '').slice(0, 16)}`

    // Create form with default fields
    const form = await db.form.create({
      data: {
        userId: user.id,
        name: name.trim(),
        title: title?.trim() || null,
        description: description?.trim() || null,
        fields: [], // Empty fields array - user will configure later
        embedCode,
        isActive: true,
      },
    })

    // Invalidate caches - user sees their own write immediately
    updateTag(invalidateFormsCache())
    updateTag(invalidateUserCacheTag(user.id, 'forms'))
    updateTag(invalidateFormCache(form.id))
    updateTag(invalidateFormEmbedCache(embedCode))

    return { success: true, formId: form.id }
  } catch (error) {
    console.error('Error creating form:', error)
    return { error: 'Failed to create form' }
  }
}

/**
 * Delete one or more forms
 */
export async function deleteForms(formIds: string[]) {
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

    // Get forms before deletion to invalidate their caches
    const formsToDelete = await db.form.findMany({
      where: {
        id: { in: formIds },
        userId: user.id,
      },
      select: { id: true, embedCode: true },
    })

    // Delete forms (only if they belong to the user)
    await db.form.deleteMany({
      where: {
        id: { in: formIds },
        userId: user.id,
      },
    })

    // Invalidate caches
    updateTag(invalidateFormsCache())
    updateTag(invalidateUserCacheTag(user.id, 'forms'))
    formsToDelete.forEach((form: FormWithEmbedCode): void => {
      updateTag(invalidateFormCache(form.id))
      if (form.embedCode) {
        updateTag(invalidateFormEmbedCache(form.embedCode))
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting forms:', error)
    return { error: 'Failed to delete forms' }
  }
}

/**
 * Toggle form active status
 */
export async function toggleFormStatus(formId: string, isActive: boolean) {
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

    // Get form before update to invalidate embed cache
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: user.id,
      },
      select: { embedCode: true },
    })

    // Update form status (only if it belongs to the user)
    await db.form.updateMany({
      where: {
        id: formId,
        userId: user.id,
      },
      data: {
        isActive,
      },
    })

    // Invalidate caches
    updateTag(invalidateFormsCache())
    updateTag(invalidateUserCacheTag(user.id, 'forms'))
    updateTag(invalidateFormCache(formId))
    if (form?.embedCode) {
      updateTag(invalidateFormEmbedCache(form.embedCode))
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form status:', error)
    return { error: 'Failed to update form status' }
  }
}

/**
 * Update form with all builder data
 */
export async function updateFormBuilder(
  formId: string,
  data: {
    name: string
    title?: string
    description?: string
    fields: any[]
    formSettings?: any
    automationConfig?: any
  }
) {
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

    // Get form before update to invalidate embed cache
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: user.id,
      },
      select: { embedCode: true },
    })

    // Update form
    await db.form.updateMany({
      where: {
        id: formId,
        userId: user.id,
      },
      data: {
        name: data.name,
        title: data.title || null,
        description: data.description || null,
        fields: data.fields,
        formSettings: data.formSettings || {},
        automationConfig: data.automationConfig || {},
      },
    })

    // Invalidate caches
    updateTag(invalidateFormsCache())
    updateTag(invalidateUserCacheTag(user.id, 'forms'))
    updateTag(invalidateFormCache(formId))
    if (form?.embedCode) {
      updateTag(invalidateFormEmbedCache(form.embedCode))
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form builder:', error)
    return { error: 'Failed to update form' }
  }
}

/**
 * Save form draft
 */
export async function saveFormDraft(
  formId: string,
  step: number,
  data: any
) {
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

    // Update form with draft data
    await db.form.updateMany({
      where: {
        id: formId,
        userId: user.id,
      },
      data: {
        ...data,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error saving form draft:', error)
    return { error: 'Failed to save draft' }
  }
}

/**
 * Get form embed code (for client components)
 */
export async function getFormEmbedCode(formId: string) {
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
        embedCode: true,
      },
    })

    if (!form) {
      return { error: 'Form not found' }
    }

    return { success: true, embedCode: form.embedCode }
  } catch (error) {
    console.error('Error fetching form embed code:', error)
    return { error: 'Failed to fetch form' }
  }
}

/**
 * Publish form (final step)
 */
export async function publishForm(formId: string) {
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

    // Get form to check if it has fields
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: user.id,
      },
    })

    if (!form) {
      return { error: 'Form not found' }
    }

    const fields = form.fields as any[]
    if (!fields || fields.length === 0) {
      return { error: 'Form must have at least one field' }
    }

    // Update form to active
    await db.form.updateMany({
      where: {
        id: formId,
        userId: user.id,
      },
      data: {
        isActive: true,
      },
    })

    // Get updated form with embedCode
    const updatedForm = await db.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        embedCode: true,
      },
    })

    // Invalidate caches
    updateTag(invalidateFormsCache())
    updateTag(invalidateUserCacheTag(user.id, 'forms'))
    updateTag(invalidateFormCache(formId))
    if (updatedForm?.embedCode) {
      updateTag(invalidateFormEmbedCache(updatedForm.embedCode))
    }
    
    return { success: true, form: updatedForm, embedCode: updatedForm?.embedCode }
  } catch (error) {
    console.error('Error publishing form:', error)
    return { error: 'Failed to publish form' }
  }
}

