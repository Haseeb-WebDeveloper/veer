"use client"

import { FormBuilderState } from "@/hooks/use-form-builder"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MailIcon, BellIcon, DatabaseIcon, WebhookIcon, CalendarIcon } from "lucide-react"

interface StepAutomationProps {
  state: FormBuilderState
  onUpdate: (updates: Partial<FormBuilderState>) => void
}

export function StepAutomation({ state, onUpdate }: StepAutomationProps) {
  const { automations } = state

  const updateAutomation = (key: keyof typeof automations, value: boolean) => {
    onUpdate({
      automations: {
        ...automations,
        [key]: value,
      },
    })
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Automation Setup</h2>
        <p className="text-muted-foreground">
          Configure automated actions when form is submitted
        </p>
      </div>

      <div className="space-y-4">
        {/* Send Thank You Email */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Send Thank You Email</CardTitle>
                  <CardDescription>
                    Automatically send a thank you email to the form submitter
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={automations.sendThankYouEmail}
                onCheckedChange={(checked) =>
                  updateAutomation("sendThankYouEmail", checked)
                }
              />
            </div>
          </CardHeader>
          {automations.sendThankYouEmail && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="thank-you-subject">Email Subject</Label>
                <Input
                  id="thank-you-subject"
                  placeholder="Thank you for your submission"
                  defaultValue={
                    automations.config?.thankYouEmail?.subject ||
                    "Thank you for your submission"
                  }
                  onChange={(e) =>
                    onUpdate({
                      automations: {
                        ...automations,
                        config: {
                          ...automations.config,
                          thankYouEmail: {
                            ...automations.config?.thankYouEmail,
                            subject: e.target.value,
                          },
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thank-you-message">Email Message</Label>
                <Textarea
                  id="thank-you-message"
                  placeholder="Thank you for submitting the form. We'll get back to you soon."
                  rows={4}
                  defaultValue={
                    automations.config?.thankYouEmail?.message ||
                    "Thank you for submitting the form. We'll get back to you soon."
                  }
                  onChange={(e) =>
                    onUpdate({
                      automations: {
                        ...automations,
                        config: {
                          ...automations.config,
                          thankYouEmail: {
                            ...automations.config?.thankYouEmail,
                            message: e.target.value,
                          },
                        },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Send Owner Notification */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Notify Owner</CardTitle>
                  <CardDescription>
                    Send notification when form is submitted
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={automations.sendOwnerNotification}
                onCheckedChange={(checked) =>
                  updateAutomation("sendOwnerNotification", checked)
                }
              />
            </div>
          </CardHeader>
          {automations.sendOwnerNotification && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="owner-notification-type">Notification Type</Label>
                <div className="flex gap-4">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded"
                    />
                    Email
                  </Label>
                  <Label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    SMS
                  </Label>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Add to CRM */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Add to CRM as Lead</CardTitle>
                  <CardDescription>
                    Automatically create a lead in your CRM system
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={automations.addToCRM}
                onCheckedChange={(checked) => updateAutomation("addToCRM", checked)}
              />
            </div>
          </CardHeader>
          {automations.addToCRM && (
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Form submissions will be automatically added as leads in your CRM.
                Make sure your CRM integration is connected in Settings.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Webhook */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WebhookIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Webhook</CardTitle>
                  <CardDescription>
                    Send form data to a custom webhook URL
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={automations.webhook}
                onCheckedChange={(checked) => updateAutomation("webhook", checked)}
              />
            </div>
          </CardHeader>
          {automations.webhook && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="webhook-url">
                  Webhook URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://api.example.com/webhook"
                  defaultValue={automations.config?.webhook?.url || ""}
                  onChange={(e) =>
                    onUpdate({
                      automations: {
                        ...automations,
                        config: {
                          ...automations.config,
                          webhook: {
                            ...automations.config?.webhook,
                            url: e.target.value,
                          },
                        },
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Form data will be sent as JSON POST request to this URL
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Schedule Follow-up */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Schedule Follow-up</CardTitle>
                  <CardDescription>
                    Automatically schedule a follow-up task or reminder
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={automations.scheduleFollowUp}
                onCheckedChange={(checked) =>
                  updateAutomation("scheduleFollowUp", checked)
                }
              />
            </div>
          </CardHeader>
          {automations.scheduleFollowUp && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="follow-up-days">Follow-up After (Days)</Label>
                <Input
                  id="follow-up-days"
                  type="number"
                  min="1"
                  defaultValue={automations.config?.followUp?.days || 7}
                  onChange={(e) =>
                    onUpdate({
                      automations: {
                        ...automations,
                        config: {
                          ...automations.config,
                          followUp: {
                            ...automations.config?.followUp,
                            days: Number(e.target.value),
                          },
                        },
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of days after submission to schedule follow-up
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

