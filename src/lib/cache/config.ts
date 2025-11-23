/**
 * Centralized Cache Configuration
 * 
 * This file serves as the single source of truth for all cache-related
 * configuration in the application, following Next.js 16 Cache Components patterns.
 */

import { cacheLife, cacheTag } from 'next/cache'

// ========================================
// CACHE TAGS
// ========================================

/**
 * Cache tags for different resource types
 * Used for granular cache invalidation
 */
export const CACHE_TAGS = {
  // Forms
  FORMS: 'forms',
  FORM: (id: string) => `form-${id}`,
  FORM_EMBED: (embedCode: string) => `form-embed-${embedCode}`,
  
  // User-specific data
  USER_FORMS: (userId: string) => `user-forms-${userId}`,
  USER_SETTINGS: (userId: string) => `user-settings-${userId}`,
  USER_INTEGRATIONS: (userId: string) => `user-integrations-${userId}`,
  
  // Submissions
  SUBMISSIONS: 'submissions',
  FORM_SUBMISSIONS: (formId: string) => `form-submissions-${formId}`,
} as const

// ========================================
// CACHE LIFE PROFILES
// ========================================

/**
 * Cache life profiles for different content types
 * 
 * Profiles:
 * - 'seconds': Very short-lived (30s stale, 1s revalidate)
 * - 'minutes': Frequently updated (5min stale, 1min revalidate)
 * - 'hours': Regularly updated (5min stale, 1hr revalidate) - DEFAULT
 * - 'days': Infrequently updated (5min stale, 1day revalidate)
 * - 'weeks': Rarely updated (5min stale, 1week revalidate)
 * - 'max': Immutable content (5min stale, 30days revalidate)
 */

export const CACHE_PROFILES = {
  // Public form data - can be cached for all users
  PUBLIC_FORM: 'hours' as const,
  
  // User-specific data - needs private cache
  USER_DATA: { stale: 60, revalidate: 300, expire: 3600 }, // 1min stale, 5min revalidate, 1hr expire
  
  // Frequently changing data
  FREQUENT: 'minutes' as const,
  
  // Settings that change rarely
  SETTINGS: { stale: 300, revalidate: 3600, expire: 86400 }, // 5min stale, 1hr revalidate, 1day expire
} as const

// ========================================
// CACHE HELPER FUNCTIONS
// ========================================

/**
 * Apply cache configuration for public form data
 * Use for content that's the same for all users
 * 
 * NOTE: This function must be called at the start of an async function
 * that has 'use cache' directive. The directive must be in the function itself.
 */
export function configurePublicFormCache(embedCode: string) {
  cacheLife(CACHE_PROFILES.PUBLIC_FORM)
  cacheTag(CACHE_TAGS.FORMS, CACHE_TAGS.FORM_EMBED(embedCode))
}

/**
 * Apply cache configuration for user-specific data
 * Use for content that varies per user (requires Suspense wrapper)
 * 
 * NOTE: This function must be called at the start of an async function
 * that has 'use cache: private' directive. The directive must be in the function itself.
 */
export function configureUserDataCache(userId: string, resource: 'forms' | 'settings' | 'integrations') {
  cacheLife(CACHE_PROFILES.USER_DATA)
  
  switch (resource) {
    case 'forms':
      cacheTag(CACHE_TAGS.FORMS, CACHE_TAGS.USER_FORMS(userId))
      break
    case 'settings':
      cacheTag(CACHE_TAGS.USER_SETTINGS(userId))
      break
    case 'integrations':
      cacheTag(CACHE_TAGS.USER_INTEGRATIONS(userId))
      break
  }
}

/**
 * Apply cache configuration for frequently updated data
 * 
 * NOTE: This function must be called at the start of an async function
 * that has 'use cache' directive. The directive must be in the function itself.
 */
export function configureFrequentCache(tags: string[]) {
  cacheLife(CACHE_PROFILES.FREQUENT)
  cacheTag(...tags)
}

/**
 * Apply cache configuration for settings data
 * 
 * NOTE: This function must be called at the start of an async function
 * that has 'use cache: private' directive. The directive must be in the function itself.
 */
export function configureSettingsCache(userId: string) {
  cacheLife(CACHE_PROFILES.SETTINGS)
  cacheTag(CACHE_TAGS.USER_SETTINGS(userId))
}

// ========================================
// CACHE INVALIDATION HELPERS
// ========================================

/**
 * Invalidate all forms cache
 * Use in server actions after form mutations
 */
export function invalidateFormsCache() {
  // This will be called from server actions using updateTag
  // Return the tag for use with updateTag()
  return CACHE_TAGS.FORMS
}

/**
 * Invalidate specific form cache
 */
export function invalidateFormCache(formId: string) {
  return CACHE_TAGS.FORM(formId)
}

/**
 * Invalidate form embed cache
 */
export function invalidateFormEmbedCache(embedCode: string) {
  return CACHE_TAGS.FORM_EMBED(embedCode)
}

/**
 * Invalidate user-specific cache
 * Returns a single tag string when resource is provided, or array when not provided
 */
export function invalidateUserCache(userId: string, resource?: 'forms' | 'settings' | 'integrations'): string | string[] {
  if (resource) {
    switch (resource) {
      case 'forms':
        return CACHE_TAGS.USER_FORMS(userId)
      case 'settings':
        return CACHE_TAGS.USER_SETTINGS(userId)
      case 'integrations':
        return CACHE_TAGS.USER_INTEGRATIONS(userId)
    }
  }
  // Invalidate all user caches
  return [
    CACHE_TAGS.USER_FORMS(userId),
    CACHE_TAGS.USER_SETTINGS(userId),
    CACHE_TAGS.USER_INTEGRATIONS(userId),
  ]
}

/**
 * Invalidate user-specific cache (single tag version for updateTag)
 * Use this when you know you want a single tag string
 */
export function invalidateUserCacheTag(userId: string, resource: 'forms' | 'settings' | 'integrations'): string {
  switch (resource) {
    case 'forms':
      return CACHE_TAGS.USER_FORMS(userId)
    case 'settings':
      return CACHE_TAGS.USER_SETTINGS(userId)
    case 'integrations':
      return CACHE_TAGS.USER_INTEGRATIONS(userId)
  }
}

