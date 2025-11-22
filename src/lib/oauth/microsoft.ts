import { randomBytes } from 'crypto'

/**
 * Microsoft OAuth 2.0 Configuration
 */
export interface MicrosoftOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  tenant?: string // Optional: 'common', 'organizations', 'consumers', or tenant ID
}

/**
 * Get Microsoft OAuth configuration from environment variables
 */
export function getMicrosoftOAuthConfig(): MicrosoftOAuthConfig {
  const clientId = process.env.MICROSOFT_OAUTH_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_OAUTH_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/oauth/callback/microsoft`
  const tenant = process.env.MICROSOFT_OAUTH_TENANT || 'common'

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured. Please set MICROSOFT_OAUTH_CLIENT_ID and MICROSOFT_OAUTH_CLIENT_SECRET')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    tenant,
  }
}

/**
 * Generate OAuth authorization URL for Microsoft
 * @param state State token for CSRF protection (should be stored in session)
 * @returns Authorization URL
 */
export function getMicrosoftAuthUrl(state: string): string {
  const config = getMicrosoftOAuthConfig()
  const scopes = [
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read',
    'offline_access', // Required to get refresh token
  ]

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    response_mode: 'query',
    state,
  })

  const tenant = config.tenant || 'common'
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 * @param code Authorization code from callback
 * @param state State token for verification
 * @returns Access token, refresh token, and user info
 */
export async function exchangeMicrosoftCode(
  code: string,
  state: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  email: string
  name?: string
}> {
  const config = getMicrosoftOAuthConfig()

  const tenant = config.tenant || 'common'

  // Exchange code for tokens
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
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
        scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access',
      }),
    }
  )

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json().catch(() => ({}))
    throw new Error(`Failed to exchange code: ${error.error_description || tokenResponse.statusText}`)
  }

  const tokens = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
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
    email: userInfo.mail || userInfo.userPrincipalName,
    name: userInfo.displayName,
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken Refresh token
 * @returns New access token and expiration
 */
export async function refreshMicrosoftToken(
  refreshToken: string
): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const config = getMicrosoftOAuthConfig()
  const tenant = config.tenant || 'common'

  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access',
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to refresh token: ${error.error_description || response.statusText}`)
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

