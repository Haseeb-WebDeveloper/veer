'use server'

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encrypt } from '@/lib/encryption/encrypt'
import { getGoogleAuthUrl, generateStateToken as generateGoogleState } from '@/lib/oauth/google'
import { getMicrosoftAuthUrl, generateStateToken as generateMicrosoftState } from '@/lib/oauth/microsoft'
import { cookies } from 'next/headers'
import { 
  EmailProvider,
  IntegrationType as IntegrationTypeConst,
  IntegrationStatus as IntegrationStatusConst 
} from '@/types/intigrations'
import { testEmailIntegration } from '@/actions/test-email'

// Validation schemas
const smtpConfigSchema = z.object({
  host: z.string()
    .min(1, 'SMTP host is required')
    .refine((host) => {
      // Check if host looks like an email address (contains @)
      if (host.includes('@')) {
        return false
      }
      // Check if host is a valid domain format
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      return domainRegex.test(host)
    }, {
      message: 'SMTP host should be a domain name (e.g., smtp.example.com), not an email address. Did you enter your username in the host field?'
    }),
  port: z.coerce.number().int().min(1).max(65535),
  user: z.string().min(1, 'SMTP user is required'),
  password: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('From email must be a valid email address'),
})

const toggleEmailSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'custom']),
  enabled: z.boolean(),
})

// Connect SMTP (custom email provider)
export async function connectEmailSMTP(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const data = {
      host: formData.get('host') as string,
      port: formData.get('port') as string,
      user: formData.get('user') as string,
      password: formData.get('password') as string,
      fromEmail: formData.get('fromEmail') as string,
    }

    const validated = smtpConfigSchema.parse(data)

    // Encrypt the password before storing
    let encryptedPassword: string
    try {
      encryptedPassword = await encrypt(validated.password)
    } catch (error) {
      console.error('Error encrypting password:', error)
      return { error: 'Failed to encrypt password. Please check ENCRYPTION_KEY is set.' }
    }

    // Get user from Prisma
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return { error: 'User not found' }
    }

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

    // Temporarily save to test
    await db.integration.upsert({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: 'CUSTOM',
        },
      },
      create: {
        userId: user.id,
        type: IntegrationTypeConst.EMAIL,
        provider: 'CUSTOM',
        status: IntegrationStatusConst.INACTIVE, // Start inactive
        emailAddress: validated.fromEmail,
        connectedAt: new Date(),
        smtpHost: validated.host,
        smtpPort: validated.port,
        smtpUser: validated.user,
        smtpPassword: encryptedPassword,
        smtpFromEmail: validated.fromEmail,
      },
      update: {
        smtpHost: validated.host,
        smtpPort: validated.port,
        smtpUser: validated.user,
        smtpPassword: encryptedPassword,
        emailAddress: validated.fromEmail,
        smtpFromEmail: validated.fromEmail,
        errorMessage: null,
      },
    })

    // Test SMTP connection
    const testResult = await testEmailIntegration('custom')
    if (testResult.error) {
      return { error: `SMTP test failed: ${testResult.error}` }
    }

    // Test passed - activate
    await db.integration.update({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: 'CUSTOM',
        },
      },
      data: {
        status: IntegrationStatusConst.ACTIVE,
        emailAddress: validated.fromEmail,
        connectedAt: new Date(),
      },
    })

    revalidatePath('/dashboard/integrations')
    return { success: true, message: 'SMTP connected and tested successfully' }
  } catch (error) {
    console.error('Error connecting SMTP:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid SMTP configuration', details: error.issues }
    }
    return { error: 'Failed to connect SMTP' }
  }
}

// Connect OAuth (Gmail/Outlook)
export async function connectEmailOAuth(
  provider: 'gmail' | 'outlook'
): Promise<{ error?: string; success?: boolean; redirectUrl?: string }> {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    // Generate state token for CSRF protection
    const state = provider === 'gmail' ? generateGoogleState() : generateMicrosoftState()
    
    // Store state in cookie (expires in 10 minutes)
    const cookieStore = await cookies()
    cookieStore.set(`oauth_state_${provider === 'gmail' ? 'google' : 'microsoft'}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    // Generate OAuth URL
    const authUrl = provider === 'gmail' 
      ? getGoogleAuthUrl(state)
      : getMicrosoftAuthUrl(state)

    return { 
      success: true,
      redirectUrl: authUrl,
    }
  } catch (error) {
    console.error(`Error connecting ${provider}:`, error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: `Failed to connect ${provider}` }
  }
}

// Toggle email provider (enable/disable)
export async function toggleEmailIntegration(
  provider: EmailProvider,
  enabled: boolean
): Promise<{ error?: string; success?: boolean }> {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const dbProvider = provider.toUpperCase()

    // Find the integration
    const integration = await db.integration.findUnique({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: dbProvider,
        },
      },
    })

    if (!integration) {
      return { error: `Please connect ${provider} first` }
    }

    // If enabling, disable all other email integrations first (only one can be active)
    if (enabled) {
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

      // Activate the selected integration
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
        },
      })
    } else {
      // Disable the provider (but keep it connected - don't clear credentials)
      await db.integration.update({
        where: {
          userId_type_provider: {
            userId: user.id,
            type: IntegrationTypeConst.EMAIL,
            provider: dbProvider,
          },
        },
        data: {
          status: IntegrationStatusConst.INACTIVE,
        },
      })
    }

    revalidatePath('/dashboard/integrations')
    return { success: true }
  } catch (error) {
    console.error('Error toggling email integration:', error)
    return { error: 'Failed to toggle email integration' }
  }
}

// Disconnect email provider
export async function disconnectEmailIntegration(
  provider: EmailProvider
): Promise<{ error?: string; success?: boolean }> {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const dbProvider = provider.toUpperCase()

    // Find and delete the integration
    const integration = await db.integration.findUnique({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: dbProvider,
        },
      },
    })

    if (integration) {
      await db.integration.delete({
        where: {
          userId_type_provider: {
            userId: user.id,
            type: IntegrationTypeConst.EMAIL,
            provider: dbProvider,
          },
        },
      })
    }

    revalidatePath('/dashboard/integrations')
    return { success: true }
  } catch (error) {
    console.error('Error disconnecting email integration:', error)
    return { error: 'Failed to disconnect email integration' }
  }
}

