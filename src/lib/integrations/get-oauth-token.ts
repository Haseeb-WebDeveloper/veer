import { db } from '@/lib/db'
import { decrypt } from '@/lib/encryption/encrypt'
import { encrypt } from '@/lib/encryption/encrypt'
import { refreshGoogleToken } from '@/lib/oauth/google'
import { refreshMicrosoftToken } from '@/lib/oauth/microsoft'
import { IntegrationType as IntegrationTypeConst } from '@/types/intigrations'

/**
 * Get valid OAuth access token for an email integration, refreshing if necessary
 * @param userId User ID
 * @param provider Provider name (GMAIL, OUTLOOK)
 * @returns Access token or null if not found or refresh failed
 */
export async function getValidOAuthToken(
  userId: string,
  provider: 'GMAIL' | 'OUTLOOK'
): Promise<string | null> {
  try {
    // Find the integration
    const integration = await db.integration.findUnique({
      where: {
        userId_type_provider: {
          userId,
          type: IntegrationTypeConst.EMAIL,
          provider,
        },
      },
    })

    if (!integration || !integration.emailOauthToken) {
      return null
    }

    // Decrypt token
    let tokenData: {
      accessToken: string
      refreshToken: string
      expiresAt?: string
    }
    try {
      const decrypted = await decrypt(integration.emailOauthToken)
      tokenData = JSON.parse(decrypted)
    } catch (error) {
      console.error('Error decrypting token:', error)
      return null
    }

    // Check if token is expired (with 5 minute buffer)
    const now = new Date()
    const buffer = 5 * 60 * 1000 // 5 minutes

    if (tokenData.expiresAt) {
      const expiresAt = new Date(tokenData.expiresAt)
      if (expiresAt.getTime() - now.getTime() < buffer) {
        // Token is expired or about to expire, refresh it
        return await refreshIntegrationOAuthToken(userId, provider)
      }
    } else if (integration.emailOauthTokenExpiresAt) {
      // Fallback to database expiration time
      const expiresAt = integration.emailOauthTokenExpiresAt
      if (expiresAt.getTime() - now.getTime() < buffer) {
        return await refreshIntegrationOAuthToken(userId, provider)
      }
    }

    return tokenData.accessToken
  } catch (error) {
    console.error('Error getting OAuth token:', error)
    return null
  }
}

/**
 * Refresh OAuth token for an email integration
 * @param userId User ID
 * @param provider Provider name (GMAIL, OUTLOOK)
 * @returns New access token or null if refresh failed
 */
async function refreshIntegrationOAuthToken(
  userId: string,
  provider: 'GMAIL' | 'OUTLOOK'
): Promise<string | null> {
  try {
    const integration = await db.integration.findUnique({
      where: {
        userId_type_provider: {
          userId,
          type: IntegrationTypeConst.EMAIL,
          provider,
        },
      },
    })

    if (!integration || !integration.emailOauthRefreshToken) {
      return null
    }

    // Decrypt refresh token
    let refreshToken: string
    try {
      refreshToken = await decrypt(integration.emailOauthRefreshToken)
    } catch (error) {
      console.error('Error decrypting refresh token:', error)
      return null
    }

    // Refresh the token
    let newAccessToken: string
    let expiresIn: number

    if (provider === 'GMAIL') {
      const result = await refreshGoogleToken(refreshToken)
      newAccessToken = result.accessToken
      expiresIn = result.expiresIn
    } else {
      const result = await refreshMicrosoftToken(refreshToken)
      newAccessToken = result.accessToken
      expiresIn = result.expiresIn
    }

    // Update the stored token
    const expiresAt = new Date(Date.now() + expiresIn * 1000)
    
    // Decrypt existing token to preserve refresh token
    let tokenData: { accessToken: string; refreshToken: string }
    try {
      const decrypted = await decrypt(integration.emailOauthToken!)
      tokenData = JSON.parse(decrypted)
    } catch (error) {
      console.error('Error decrypting existing token:', error)
      return null
    }

    const updatedTokenData = {
      accessToken: newAccessToken,
      refreshToken: tokenData.refreshToken, // Refresh token doesn't change
      expiresAt: expiresAt.toISOString(),
    }

    const encryptedToken = await encrypt(JSON.stringify(updatedTokenData))

    await db.integration.update({
      where: {
        userId_type_provider: {
          userId,
          type: IntegrationTypeConst.EMAIL,
          provider,
        },
      },
      data: {
        emailOauthToken: encryptedToken,
        emailOauthTokenExpiresAt: expiresAt,
      },
    })

    return newAccessToken
  } catch (error) {
    console.error('Error refreshing OAuth token:', error)
    return null
  }
}

