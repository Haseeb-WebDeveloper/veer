import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeGoogleCode } from '@/lib/oauth/google'
import { exchangeMicrosoftCode } from '@/lib/oauth/microsoft'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { encrypt } from '@/lib/encryption/encrypt'
import { 
  IntegrationType as IntegrationTypeConst,
  IntegrationStatus as IntegrationStatusConst 
} from '@/types/intigrations'
import { testEmailIntegration } from '@/actions/test-email'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || error
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${encodeURIComponent(errorDescription)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=Missing authorization code', request.url)
      )
    }

    // Verify state token (should match the one stored in session/cookie)
    const cookieStore = await cookies()
    const storedState = cookieStore.get(`oauth_state_${provider}`)?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=Invalid state token', request.url)
      )
    }

    // Clear the state cookie
    cookieStore.delete(`oauth_state_${provider}`)

    // Get current user
    const supabaseUser = await getUser()
    if (!supabaseUser) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=Unauthorized', request.url)
      )
    }

    // Exchange code for tokens
    let tokenData: {
      accessToken: string
      refreshToken: string
      expiresIn: number
      email: string
      name?: string
    }

    if (provider === 'google') {
      tokenData = await exchangeGoogleCode(code, state)
    } else if (provider === 'microsoft') {
      tokenData = await exchangeMicrosoftCode(code, state)
    } else {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=Invalid provider', request.url)
      )
    }

    // Get user from Prisma
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=User not found', request.url)
      )
    }

    // Encrypt and store tokens
    const tokenPayload = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
    }

    const encryptedToken = await encrypt(JSON.stringify(tokenPayload))
    const encryptedRefreshToken = await encrypt(tokenData.refreshToken)

    // Determine provider
    const dbProvider = provider === 'google' ? 'GMAIL' : 'OUTLOOK'
    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000)

    // Deactivate all other email integrations
    await db.integration.updateMany({
      where: {
        userId: user.id,
        type: IntegrationTypeConst.EMAIL,
        status: IntegrationStatusConst.ACTIVE,
      },
      data: {
        status: IntegrationStatusConst.INACTIVE,
      },
    })

    // Upsert the OAuth integration (save first, then test)
    await db.integration.upsert({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: dbProvider,
        },
      },
      create: {
        userId: user.id,
        type: IntegrationTypeConst.EMAIL,
        provider: dbProvider,
        status: IntegrationStatusConst.INACTIVE, // Start as inactive
        emailAddress: tokenData.email,
        emailOauthToken: encryptedToken,
        emailOauthRefreshToken: encryptedRefreshToken,
        emailOauthTokenExpiresAt: expiresAt,
        connectedAt: new Date(),
        errorMessage: null,
      },
      update: {
        emailAddress: tokenData.email,
        emailOauthToken: encryptedToken,
        emailOauthRefreshToken: encryptedRefreshToken,
        emailOauthTokenExpiresAt: expiresAt,
        connectedAt: new Date(),
        errorMessage: null,
      },
    })

    // Test the integration before activating
    try {
      const testProvider = provider === 'google' ? 'gmail' : 'outlook'
      const testResult = await testEmailIntegration(testProvider as 'gmail' | 'outlook')
      
      if (testResult.error) {
        // Save error but don't activate
        await db.integration.update({
          where: {
            userId_type_provider: {
              userId: user.id,
              type: IntegrationTypeConst.EMAIL,
              provider: dbProvider,
            },
          },
          data: {
            errorMessage: testResult.error,
            status: IntegrationStatusConst.INACTIVE,
          },
        })
        return NextResponse.redirect(
          new URL(`/dashboard/integrations?error=${encodeURIComponent(`Connection successful but test failed: ${testResult.error}`)}`, request.url)
        )
      }

      // Test passed - activate the integration
      await db.integration.update({
        where: {
          userId_type_provider: {
            userId: user.id,
            type: IntegrationTypeConst.EMAIL,
            provider: dbProvider,
          },
        },
        data: {
          status: IntegrationStatusConst.ACTIVE,
          errorMessage: null,
        },
      })
    } catch (testError) {
      // If test fails, still save but mark as inactive
      await db.integration.update({
        where: {
          userId_type_provider: {
            userId: user.id,
            type: IntegrationTypeConst.EMAIL,
            provider: dbProvider,
          },
        },
        data: {
          errorMessage: testError instanceof Error ? testError.message : 'Test failed',
          status: IntegrationStatusConst.INACTIVE,
        },
      })
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${encodeURIComponent('Connection successful but test failed')}`, request.url)
      )
    }

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=connected', request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed'
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}

