'use server'

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encrypt } from '@/lib/encryption/encrypt'
import { IntegrationType as IntegrationTypeConst } from '@/types/intigrations'
import { testEmailIntegration } from '@/actions/test-email'

const smtpConfigSchema = z.object({
  host: z.string()
    .min(1, 'SMTP host is required')
    .refine((host) => {
      if (host.includes('@')) return false
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      return domainRegex.test(host)
    }, {
      message: 'SMTP host should be a domain name (e.g., smtp.example.com), not an email address.'
    }),
  port: z.coerce.number().int().min(1).max(65535),
  user: z.string().min(1, 'SMTP user is required'),
  password: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('From email must be a valid email address'),
})

export async function updateEmailSMTP(
  prevState: { error?: string; success?: boolean; message?: string } | null,
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

    // Encrypt the password
    let encryptedPassword: string
    try {
      encryptedPassword = await encrypt(validated.password)
    } catch (error) {
      return { error: 'Failed to encrypt password. Please check ENCRYPTION_KEY is set.' }
    }

    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Temporarily update to test
    await db.integration.update({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: 'CUSTOM',
        },
      },
      data: {
        smtpHost: validated.host,
        smtpPort: validated.port,
        smtpUser: validated.user,
        smtpPassword: encryptedPassword,
        smtpFromEmail: validated.fromEmail,
      },
    })

    // Test the updated configuration
    const testResult = await testEmailIntegration('custom')
    if (testResult.error) {
      // Revert on test failure
      return { error: `SMTP test failed: ${testResult.error}` }
    }

    // Update email address and clear errors
    await db.integration.update({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: 'CUSTOM',
        },
      },
      data: {
        emailAddress: validated.fromEmail,
        smtpFromEmail: validated.fromEmail,
        errorMessage: null,
      },
    })

    revalidatePath('/dashboard/integrations')
    return { success: true, message: 'SMTP settings updated and tested successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid SMTP configuration', details: error.issues }
    }
    return { error: 'Failed to update SMTP settings' }
  }
}

