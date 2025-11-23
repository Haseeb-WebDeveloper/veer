import { Suspense } from "react"
import { getUserForms } from "@/lib/forms/get-user-forms"
import { FormsTable } from "@/components/forms/forms-table"
import { CreateFormDialog } from "@/components/forms/create-form-dialog"
import { Card, CardContent } from "@/components/ui/card"

async function FormsData() {
  const result = await getUserForms()

  if ("error" in result) {
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Create and manage your forms to collect submissions
          </p>
        </div>
        <CreateFormDialog />
      </div>
      <FormsTable data={result.forms} />
    </div>
  )
}

export default function FormsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
              <p className="text-muted-foreground">
                Create and manage your forms to collect submissions
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading forms...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <FormsData />
    </Suspense>
  )
}

