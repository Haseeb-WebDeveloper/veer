import { randomBytes } from 'crypto'

/**
 * Google OAuth 2.0 Configuration
 */
export interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * Get Google OAuth configuration from environment variables
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/oauth/callback/google`

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

/**
 * Generate OAuth authorization URL for Google
 * @param state State token for CSRF protection (should be stored in session)
 * @returns Authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const config = getGoogleOAuthConfig()
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 * @param code Authorization code from callback
 * @param state State token for verification
 * @returns Access token, refresh token, and user info
 */
export async function exchangeGoogleCode(
  code: string,
  state: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  email: string
  name?: string
}> {
  const config = getGoogleOAuthConfig()

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json().catch(() => ({}))
    throw new Error(`Failed to exchange code: ${error.error || tokenResponse.statusText}`)
  }

  const tokens = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user info')
  }

  const userInfo = await userResponse.json()

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    email: userInfo.email,
    name: userInfo.name,
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken Refresh token
 * @returns New access token and expiration
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const config = getGoogleOAuthConfig()

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to refresh token: ${error.error || response.statusText}`)
  }

  const tokens = await response.json()

  return {
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
  }
}

/**
 * Generate a random state token for OAuth
 */
export function generateStateToken(): string {
  return randomBytes(32).toString('hex')
}

