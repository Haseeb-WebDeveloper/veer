# Cache Configuration Guide

This directory contains the centralized cache configuration for the application, following Next.js 16 Cache Components patterns.

## Overview

The cache system is designed to:
- **Maximize performance** through strategic caching
- **Ensure data freshness** with proper invalidation
- **Provide a single source of truth** for all cache-related configuration
- **Follow Next.js 16 best practices** for Cache Components

## File Structure

- `config.ts` - Centralized cache configuration (tags, profiles, helpers)
- `README.md` - This documentation

## Cache Types

### 1. Public Cache (`'use cache'`)
Used for content that's the same for all users:
- **Public form data** (`getFormByEmbedCode`)
- Cache life: `'hours'` (5min stale, 1hr revalidate)
- Included in static prerender
- Included in runtime prefetch

### 2. Private Cache (`'use cache: private'`)
Used for per-user content that can be prefetched:
- **User forms** (`getUserForms`)
- **User settings** (`getUserSettings`)
- **User integrations** (`getEmailIntegrations`)
- Cache life: `{ stale: 60, revalidate: 300, expire: 3600 }`
- **MUST be wrapped in Suspense** (build error if not)
- Excluded from static prerender
- Included in runtime prefetch (stale >= 30s)

## Cache Tags

Tags are used for granular cache invalidation:

```typescript
CACHE_TAGS.FORMS                    // All forms
CACHE_TAGS.FORM(id)                 // Specific form
CACHE_TAGS.FORM_EMBED(embedCode)    // Form by embed code
CACHE_TAGS.USER_FORMS(userId)       // User's forms
CACHE_TAGS.USER_SETTINGS(userId)    // User's settings
CACHE_TAGS.USER_INTEGRATIONS(userId) // User's integrations
```

## Usage Examples

### Data Fetching Functions

```typescript
// Public cache (same for all users)
export async function getFormByEmbedCode(embedCode: string) {
  'use cache'
  configurePublicFormCache(embedCode)
  // ... fetch data
}

// Private cache (per-user, requires Suspense)
export async function getUserForms() {
  'use cache: private'
  const user = await getUser()
  configureUserDataCache(user.id, 'forms')
  // ... fetch data
}
```

### Server Actions (Cache Invalidation)

```typescript
'use server'
import { updateTag } from 'next/cache'
import { invalidateFormsCache, invalidateFormCache } from '@/lib/cache/config'

export async function createForm(formData: FormData) {
  // ... create form
  
  // Invalidate caches - user sees their own write immediately
  updateTag(invalidateFormsCache())
  updateTag(invalidateFormCache(form.id))
  
  return { success: true }
}
```

## Cache Invalidation Strategy

### When to Use `updateTag()`
- **Server Actions only** (not Route Handlers)
- **Immediate cache expiry** - user sees their changes right away
- **Read-your-own-writes** semantics
- No profile parameter needed

### When to Use `revalidateTag()`
- **Route Handlers** or anywhere outside Server Actions
- **Background revalidation** - stale-while-revalidate pattern
- Requires profile parameter: `'max'`, `'hours'`, `'minutes'`, etc.

## Pages and Their Cache Strategy

| Page | Cache Type | Reason |
|------|-----------|--------|
| `/form/[embedCode]` | Public | Same form for all users |
| `/dashboard/forms` | Private | Per-user forms list |
| `/dashboard/settings` | Private | Per-user settings |
| `/dashboard/integrations` | Private | Per-user integrations |
| `/` (Home) | None | Static content |
| `/dashboard` | None | Simple welcome message |

## Best Practices

1. **Always use cache helpers** from `@/lib/cache/config` instead of inline cache directives
2. **Wrap private cache components in Suspense** - required by Next.js 16
3. **Invalidate caches after mutations** - use `updateTag()` in Server Actions
4. **Use specific tags** - invalidate only what changed, not everything
5. **Test cache behavior** - verify that invalidation works correctly

## Troubleshooting

### Error: "Uncached data was accessed outside of <Suspense>"
- **Solution**: Wrap the component accessing dynamic data in Suspense
- **Example**: User-specific data fetching functions need Suspense boundaries

### Cache not invalidating after mutation
- **Check**: Are you using `updateTag()` in Server Actions?
- **Check**: Are you using the correct cache tags?
- **Check**: Is the cache directive present in the data fetching function?

### Build error: "Route segment config not compatible"
- **Solution**: Remove `export const revalidate`, `export const dynamic`, etc.
- **Use**: Cache Components directives instead (`'use cache'`, `cacheLife()`, etc.)

## Migration Notes

This cache system replaces:
- ❌ `export const revalidate = 60`
- ❌ `export const dynamic = 'force-static'`
- ❌ `revalidatePath()` (in Server Actions)
- ✅ `'use cache'` with `cacheLife()` and `cacheTag()`
- ✅ `updateTag()` in Server Actions

