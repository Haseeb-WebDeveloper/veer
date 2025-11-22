import { Suspense } from "react"
import { getEmailIntegrations } from "@/lib/integrations/get-email-integrations"
import { IntegrationsContent } from "@/components/integrations/integrations-content"
import { Card, CardContent } from "@/components/ui/card"

async function IntegrationsData() {
  const result = await getEmailIntegrations()
  
  if ('error' in result) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <IntegrationsContent emailData={result} />
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 flex-col gap-6 p-6">Loading...</div>}>
      <IntegrationsData />
    </Suspense>
  )
}

