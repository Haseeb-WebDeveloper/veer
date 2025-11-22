import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import type { 
  EmailProvider, 
  EmailIntegrationProvider, 
  EmailIntegrationData
} from '@/types/intigrations'
import { 
  IntegrationType as IntegrationTypeConst, 
  IntegrationStatus as IntegrationStatusConst 
} from '@/types/intigrations'

export async function getEmailIntegrations(): Promise<
  EmailIntegrationData | { error: string }
> {
  const supabaseUser = await getUser()
  
  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
      include: {
        integrations: {
          where: {
            type: IntegrationTypeConst.EMAIL,
          },
        },
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const emailIntegrations = user.integrations

    // Map providers
    const providerMap: Record<string, EmailIntegrationProvider> = {
      gmail: {
        provider: 'gmail',
        isConnected: false,
        isEnabled: false,
        emailAddress: null,
        connectedAt: null,
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpFromEmail: null,
      },
      outlook: {
        provider: 'outlook',
        isConnected: false,
        isEnabled: false,
        emailAddress: null,
        connectedAt: null,
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpFromEmail: null,
      },
      custom: {
        provider: 'custom',
        isConnected: false,
        isEnabled: false,
        emailAddress: null,
        connectedAt: null,
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpFromEmail: null,
      },
    }

    // Find active provider
    let activeProvider: EmailProvider | null = null

    // Populate provider data from integrations
    for (const integration of emailIntegrations) {
      const provider = integration.provider.toLowerCase() as EmailProvider
      const isActive = integration.status === IntegrationStatusConst.ACTIVE

      if (providerMap[provider]) {
        providerMap[provider].isConnected = true
        providerMap[provider].isEnabled = isActive
        providerMap[provider].emailAddress = integration.emailAddress
        providerMap[provider].connectedAt = integration.connectedAt

        if (provider === 'custom') {
          providerMap[provider].smtpHost = integration.smtpHost
          providerMap[provider].smtpPort = integration.smtpPort
          providerMap[provider].smtpUser = integration.smtpUser
          providerMap[provider].smtpFromEmail = integration.smtpFromEmail
        }

        if (isActive) {
          activeProvider = provider
        }
      }
    }

    return {
      providers: Object.values(providerMap),
      activeProvider,
    }
  } catch (error) {
    console.error('Error fetching email integrations:', error)
    return { error: 'Failed to fetch email integrations' }
  }
}

