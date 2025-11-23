"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CreateFormContent } from "./create-form-content"

function CreateFormWithSearchParams() {
  const searchParams = useSearchParams()
  const editFormId = searchParams.get("id")
  
  return <CreateFormContent editFormId={editFormId} />
}

export function CreateFormWrapper() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading form builder...</p>
        </div>
      </div>
    }>
      <CreateFormWithSearchParams />
    </Suspense>
  )
}

