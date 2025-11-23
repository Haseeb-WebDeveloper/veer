'use server'

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { invalidateUserCacheTag } from '@/lib/cache/config'

// Validation schemas
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  businessName: z.string().min(1).optional(),
  industry: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
})

const updateSubscriptionSchema = z.object({
  planType: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'TRIAL']),
})

// Update profile
export async function updateProfile(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get user from Prisma
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      include: { profile: true },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Parse and validate form data
    // formData.get() returns null for empty fields, convert to undefined
    const getValue = (key: string): string | undefined => {
      const value = formData.get(key)
      return value && typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
    }

    const data = {
      email: getValue('email'),
      phone: getValue('phone'),
      businessName: getValue('businessName'),
      industry: getValue('industry'),
      businessPhone: getValue('businessPhone'),
      businessEmail: getValue('businessEmail'),
      country: getValue('country'),
      timezone: getValue('timezone'),
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    )

    // Validate
    const validated = updateProfileSchema.partial().parse(cleanData)

    // Update or create profile
    if (user.profile) {
      await db.profile.update({
        where: { userId: user.id },
        data: {
          businessName: validated.businessName,
          industry: validated.industry,
          phone: validated.businessPhone || validated.phone,
          email: validated.businessEmail || validated.email,
          country: validated.country,
          timezone: validated.timezone,
        },
      })
    } else {
      await db.profile.create({
        data: {
          userId: user.id,
          businessName: validated.businessName || '',
          industry: validated.industry,
          phone: validated.businessPhone || validated.phone,
          email: validated.businessEmail || validated.email,
          country: validated.country || 'US',
          timezone: validated.timezone || 'America/New_York',
        },
      })
    }

    // Update user email if provided
    if (validated.email && validated.email !== user.email) {
      await db.user.update({
        where: { id: user.id },
        data: { email: validated.email },
      })
    }

    // Invalidate user settings cache
    updateTag(invalidateUserCacheTag(user.id, 'settings'))
    
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data', details: error.issues }
    }
    return { error: 'Failed to update profile' }
  }
}

// Update subscription plan
export async function updateSubscription(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      include: { subscription: true },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const planType = formData.get('planType') as string
    
    const validated = updateSubscriptionSchema.parse({ planType })

    // Update or create subscription
    if (user.subscription) {
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          planType: validated.planType,
        },
      })
    } else {
      await db.subscription.create({
        data: {
          userId: user.id,
          planType: validated.planType,
          status: 'ACTIVE',
        },
      })
    }

    // Invalidate user settings cache
    updateTag(invalidateUserCacheTag(user.id, 'settings'))
    
    return { success: true }
  } catch (error) {
    console.error('Error updating subscription:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid plan type', details: error.issues }
    }
    return { error: 'Failed to update subscription' }
  }
}

