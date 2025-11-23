import { decrypt } from '@/lib/encryption/encrypt'
import { refreshGoogleToken } from './google'
import { refreshMicrosoftToken } from './microsoft'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/encryption/encrypt'
import { 
  IntegrationType as IntegrationTypeConst,
  IntegrationStatus as IntegrationStatusConst 
} from '@/types/intigrations'

/**
 * Refresh OAuth token for a user's email integration
 * @param userId User ID
 * @returns New access token or null if refresh failed
 */
export async function refreshEmailOAuthToken(userId: string): Promise<string | null> {
  try {
    // Find the first active email integration (GMAIL or OUTLOOK)
    const integration = await db.integration.findFirst({
      where: {
        userId,
        type: IntegrationTypeConst.EMAIL,
        provider: { in: ['GMAIL', 'OUTLOOK'] },
        status: IntegrationStatusConst.ACTIVE,
      },
    })

    if (!integration || !integration.emailOauthToken || !integration.emailOauthRefreshToken) {
      return null
    }

    const provider = integration.provider as 'GMAIL' | 'OUTLOOK'

    // Decrypt the refresh token
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

    // Update the stored token with new access token
    const expiresAt = new Date(Date.now() + expiresIn * 1000)
    
    // Decrypt existing token to preserve refresh token
    let tokenData: { accessToken: string; refreshToken: string }
    try {
      const decrypted = await decrypt(integration.emailOauthToken)
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
      where: { id: integration.id },
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

/**
 * Get valid access token, refreshing if necessary
 * @param userId User ID
 * @returns Access token or null
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  try {
    // Find the first active email integration (GMAIL or OUTLOOK)
    const integration = await db.integration.findFirst({
      where: {
        userId,
        type: IntegrationTypeConst.EMAIL,
        provider: { in: ['GMAIL', 'OUTLOOK'] },
        status: IntegrationStatusConst.ACTIVE,
      },
    })

    if (!integration || !integration.emailOauthToken) {
      return null
    }

    // Decrypt token
    let tokenData: { accessToken: string; refreshToken: string; expiresAt?: string }
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
        return await refreshEmailOAuthToken(userId)
      }
    } else if (integration.emailOauthTokenExpiresAt) {
      // Fallback to database expiration time
      const expiresAt = integration.emailOauthTokenExpiresAt
      if (expiresAt.getTime() - now.getTime() < buffer) {
        return await refreshEmailOAuthToken(userId)
      }
    }

    return tokenData.accessToken
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

