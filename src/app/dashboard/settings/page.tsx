import { getUserSettings } from "@/lib/settings/get-user-settings"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { Card, CardContent } from "@/components/ui/card"

export default async function SettingsPage() {
  const result = await getUserSettings()
  
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

  return (
    <SettingsTabs 
      user={result.user}
      profile={result.profile}
      subscription={result.subscription}
    />
  )
}

