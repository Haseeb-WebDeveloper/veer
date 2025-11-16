# Supabase Authentication Setup

This project uses Supabase for authentication with email/password and OAuth (Google) support.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following variables:

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key (public)
- `NEXT_PUBLIC_APP_URL` - Your application URL (for OAuth redirects)
- `DATABASE_URL` - PostgreSQL connection string (if using Prisma)
- `DIRECT_URL` - Direct PostgreSQL connection string (if using Prisma)

### Optional Variables

- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (server-only)
- `SUPABASE_WEBHOOK_SECRET` - Secret for webhook verification (if using webhook approach)

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Database Sync Setup

There are two approaches to sync Supabase auth users to your Prisma User table:

### Option 1: Database Trigger (Recommended)

1. Run the SQL migration in `prisma/migrations/sync_supabase_auth.sql`
2. This creates a trigger that automatically syncs users when they sign up

To apply:
```bash
# Connect to your Supabase database and run the SQL
# Or use Supabase SQL Editor in the dashboard
```

### Option 2: Webhook (Alternative)

1. Set up the webhook endpoint at `/api/webhooks/supabase`
2. Go to Supabase Dashboard > Database > Webhooks
3. Create a webhook for `auth.users` table
4. Set the webhook URL to: `https://yourdomain.com/api/webhooks/supabase`
5. Set the secret in `SUPABASE_WEBHOOK_SECRET`

## OAuth Setup (Google)

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Routes

- `/signup` - Sign up page
- `/signin` - Sign in page
- `/auth/callback` - OAuth callback handler

## Usage

### Sign Up
Users can sign up with:
- Email and password
- Google OAuth

### Sign In
Users can sign in with:
- Email and password
- Google OAuth

## Server Actions

- `signUp(formData)` - Email/password signup
- `signIn(formData)` - Email/password signin
- `signInWithOAuth(provider)` - OAuth signin (Google/Apple)

## Auth Utilities

- `getUser()` - Get current authenticated user
- `syncUserToPrisma(user)` - Sync Supabase user to Prisma User table

## Middleware

The middleware (`src/middleware.ts`) automatically:
- Refreshes user sessions
- Redirects unauthenticated users to `/signin` (except for public routes)

## Notes

- Apple OAuth is included as a placeholder but requires Apple Developer account setup
- Password must be at least 8 characters
- Users are automatically synced to Prisma User table on signup
- All auth operations use Server Actions (Next.js 16 pattern)

