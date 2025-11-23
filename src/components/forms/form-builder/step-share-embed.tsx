"use client"

import { useState } from "react"
import { CopyIcon, CheckIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface StepShareEmbedProps {
  formId?: string
  embedCode?: string
}

export function StepShareEmbed({ formId, embedCode }: StepShareEmbedProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const formUrl = embedCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/form/${embedCode}`
    : ""
  const iframeCode = embedCode
    ? `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`
    : ""

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Share & Embed</h2>
        <p className="text-muted-foreground">
          Share your form link or embed it on your website
        </p>
      </div>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="share">Share Link</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Link</CardTitle>
              <CardDescription>
                Share this link with others to access your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-url">Form URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="form-url"
                    value={formUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => formUrl && handleCopy(formUrl, "url")}
                  >
                    {copied === "url" ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  {formUrl && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(formUrl, "_blank")}
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {!formUrl && (
                <p className="text-sm text-muted-foreground">
                  Form will be available after publishing
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy and paste this code into your website HTML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-code">iFrame Code</Label>
                <div className="space-y-2">
                  <textarea
                    id="embed-code"
                    value={iframeCode || "Form embed code will be available after publishing"}
                    readOnly
                    className="min-h-[120px] w-full rounded-lg border bg-muted/50 p-3 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => iframeCode && handleCopy(iframeCode, "embed")}
                    disabled={!iframeCode}
                    className="w-full"
                  >
                    {copied === "embed" ? (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy Embed Code
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {iframeCode && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <iframe
                      src={formUrl}
                      width="100%"
                      height="400"
                      className="rounded border"
                      title="Form Preview"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

