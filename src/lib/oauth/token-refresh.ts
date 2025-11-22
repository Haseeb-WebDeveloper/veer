import { decrypt } from '@/lib/encryption/encrypt'
import { refreshGoogleToken } from './google'
import { refreshMicrosoftToken } from './microsoft'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/encryption/encrypt'

/**
 * Refresh OAuth token for a user's email integration
 * @param userId User ID
 * @returns New access token or null if refresh failed
 */
export async function refreshEmailOAuthToken(userId: string): Promise<string | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { businessSettings: true },
    })

    if (!user?.businessSettings?.emailOauthToken) {
      return null
    }

    const provider = user.businessSettings.emailProvider
    if (provider !== 'gmail' && provider !== 'outlook') {
      return null
    }

    // Decrypt the stored token (contains both access and refresh tokens)
    let tokenData: { accessToken: string; refreshToken: string }
    try {
      const decrypted = await decrypt(user.businessSettings.emailOauthToken)
      tokenData = JSON.parse(decrypted)
    } catch (error) {
      console.error('Error decrypting token:', error)
      return null
    }

    // Refresh the token
    let newAccessToken: string
    let expiresIn: number

    if (provider === 'gmail') {
      const result = await refreshGoogleToken(tokenData.refreshToken)
      newAccessToken = result.accessToken
      expiresIn = result.expiresIn
    } else {
      const result = await refreshMicrosoftToken(tokenData.refreshToken)
      newAccessToken = result.accessToken
      expiresIn = result.expiresIn
    }

    // Update the stored token with new access token
    const updatedTokenData = {
      accessToken: newAccessToken,
      refreshToken: tokenData.refreshToken, // Refresh token doesn't change
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    }

    const encryptedToken = await encrypt(JSON.stringify(updatedTokenData))

    await db.businessSettings.update({
      where: { userId },
      data: {
        emailOauthToken: encryptedToken,
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
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { businessSettings: true },
    })

    if (!user?.businessSettings?.emailOauthToken) {
      return null
    }

    // Decrypt token
    let tokenData: { accessToken: string; refreshToken: string; expiresAt?: string }
    try {
      const decrypted = await decrypt(user.businessSettings.emailOauthToken)
      tokenData = JSON.parse(decrypted)
    } catch (error) {
      console.error('Error decrypting token:', error)
      return null
    }

    // Check if token is expired (with 5 minute buffer)
    if (tokenData.expiresAt) {
      const expiresAt = new Date(tokenData.expiresAt)
      const now = new Date()
      const buffer = 5 * 60 * 1000 // 5 minutes

      if (expiresAt.getTime() - now.getTime() < buffer) {
        // Token is expired or about to expire, refresh it
        return await refreshEmailOAuthToken(userId)
      }
    }

    return tokenData.accessToken
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

