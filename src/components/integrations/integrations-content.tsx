"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Zap } from "lucide-react"
import { toast } from "sonner"
import { EmailIntegrationCard } from "./email-integration-card"
import { EmailIntegrationSheet } from "./email-integration-sheet"
import type { 
  EmailIntegrationData, 
  EmailProvider,
  IntegrationsContentProps 
} from "@/types/intigrations"

export function IntegrationsContent({ emailData }: IntegrationsContentProps) {
  const [openSheet, setOpenSheet] = useState<EmailProvider | null>(null)
  const searchParams = useSearchParams()

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'connected') {
      toast.success('Email integration connected successfully!')
    } else if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [searchParams])

  // Get provider status from the new data structure
  const getProviderStatus = (provider: EmailProvider) => {
    const providerData = emailData.providers.find(p => p.provider === provider)
    
    return {
      isConnected: providerData?.isConnected ?? false,
      isEnabled: providerData?.isEnabled ?? false,
      emailAddress: providerData?.emailAddress ?? null,
    }
  }

  const gmailStatus = getProviderStatus('gmail')
  const outlookStatus = getProviderStatus('outlook')
  const customStatus = getProviderStatus('custom')
  
  // Get SMTP data for custom provider
  const customProviderData = emailData.providers.find(p => p.provider === 'custom')

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Integrations & Workflows</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Integrate your applications using our comprehensive directory.
          </p>
        </div>
      </div>

      {/* Email Integrations Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Email Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EmailIntegrationCard
              provider="gmail"
              isConnected={gmailStatus.isConnected}
              isEnabled={gmailStatus.isEnabled}
              emailAddress={gmailStatus.emailAddress}
              onView={() => setOpenSheet('gmail')}
              onToggle={(enabled) => {
                // Toggle will be handled by the card component
                setOpenSheet('gmail')
              }}
            />
            {/* <EmailIntegrationCard
              provider="outlook"
              isConnected={outlookStatus.isConnected}
              isEnabled={outlookStatus.isEnabled}
              emailAddress={outlookStatus.emailAddress}
              onView={() => setOpenSheet('outlook')}
              onToggle={(enabled) => {
                setOpenSheet('outlook')
              }}
            /> */}
            <EmailIntegrationCard
              provider="custom"
              isConnected={customStatus.isConnected}
              isEnabled={customStatus.isEnabled}
              emailAddress={customStatus.emailAddress}
              onView={() => setOpenSheet('custom')}
              onToggle={(enabled) => {
                setOpenSheet('custom')
              }}
            />
          </div>
        </div>
      </div>

      {/* Sheets for each provider */}
      <EmailIntegrationSheet
        provider="gmail"
        open={openSheet === 'gmail'}
        onOpenChange={(open) => setOpenSheet(open ? 'gmail' : null)}
        isConnected={gmailStatus.isConnected}
        isEnabled={gmailStatus.isEnabled}
        emailAddress={gmailStatus.emailAddress}
      />
      <EmailIntegrationSheet
        provider="outlook"
        open={openSheet === 'outlook'}
        onOpenChange={(open) => setOpenSheet(open ? 'outlook' : null)}
        isConnected={outlookStatus.isConnected}
        isEnabled={outlookStatus.isEnabled}
        emailAddress={outlookStatus.emailAddress}
      />
      <EmailIntegrationSheet
        provider="custom"
        open={openSheet === 'custom'}
        onOpenChange={(open) => setOpenSheet(open ? 'custom' : null)}
        isConnected={customStatus.isConnected}
        isEnabled={customStatus.isEnabled}
        emailAddress={customStatus.emailAddress}
        smtpHost={customProviderData?.smtpHost ?? null}
        smtpPort={customProviderData?.smtpPort ?? null}
        smtpUser={customProviderData?.smtpUser ?? null}
        smtpFromEmail={customProviderData?.smtpFromEmail ?? null}
      />
    </div>
  )
}

