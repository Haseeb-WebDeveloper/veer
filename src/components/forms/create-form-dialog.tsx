"use client"

import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateFormDialog() {
  const router = useRouter()

  const handleCreate = () => {
    router.push("/dashboard/forms/create")
  }

  return (
    <Button onClick={handleCreate}>
      <PlusIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
      Create Form
    </Button>
  )
}

