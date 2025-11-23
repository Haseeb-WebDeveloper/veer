"use client"

import type { FormBuilderState } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StepSubmissionProps {
  state: FormBuilderState
  onUpdate: (updates: Partial<FormBuilderState>) => void
}

export function StepSubmission({ state, onUpdate }: StepSubmissionProps) {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Submission Settings</h2>
        <p className="text-muted-foreground">
          Configure what happens after form submission
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>After Submission</CardTitle>
          <CardDescription>
            Choose how to handle successful form submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={state.redirectBehavior}
            onValueChange={(value: "redirect" | "message") =>
              onUpdate({ redirectBehavior: value })
            }
          >
            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <RadioGroupItem value="message" id="message" />
              <Label htmlFor="message" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Show Success Message</div>
                  <div className="text-sm text-muted-foreground">
                    Display a message to the user after submission
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <RadioGroupItem value="redirect" id="redirect" />
              <Label htmlFor="redirect" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Redirect to URL</div>
                  <div className="text-sm text-muted-foreground">
                    Redirect user to another page after submission
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {state.redirectBehavior === "message" && (
            <div className="space-y-2">
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea
                id="success-message"
                value={state.successMessage}
                onChange={(e) => onUpdate({ successMessage: e.target.value })}
                placeholder="Thank you! We will be in touch soon."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed to users after they submit the form
              </p>
            </div>
          )}

          {state.redirectBehavior === "redirect" && (
            <div className="space-y-2">
              <Label htmlFor="redirect-url">
                Redirect URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="redirect-url"
                type="url"
                value={state.redirectUrl || ""}
                onChange={(e) => onUpdate({ redirectUrl: e.target.value })}
                placeholder="https://example.com/thank-you"
                required
              />
              <p className="text-xs text-muted-foreground">
                Users will be redirected to this URL after successful submission
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

