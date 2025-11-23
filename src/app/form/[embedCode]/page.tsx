import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getFormByEmbedCode } from "@/lib/forms/get-form-by-embed-code"
import { PublicForm } from "@/components/forms/public-form"

interface PageProps {
  params: Promise<{ embedCode: string }>
}

async function FormData({ embedCode }: { embedCode: string }) {
  const result = await getFormByEmbedCode(embedCode)

  if ("error" in result) {
    if (result.error === "Form not found") {
      notFound()
    }
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{result.error}</p>
        </div>
      </div>
    )
  }

  return <PublicForm form={result} />
}

async function FormContent({ params }: { params: Promise<{ embedCode: string }> }) {
  const { embedCode } = await params
  return <FormData embedCode={embedCode} />
}

export default function FormPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading form...</p>
          </div>
        </div>
      }
    >
      <FormContent params={props.params} />
    </Suspense>
  )
}

