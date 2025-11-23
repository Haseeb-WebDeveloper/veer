import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 text-center shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Form Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The form you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

