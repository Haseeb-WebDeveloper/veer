"use client"

import { FormBuilderState } from "@/hooks/use-form-builder"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StepConfigurationProps {
  state: FormBuilderState
  onUpdate: (updates: Partial<FormBuilderState>) => void
}

export function StepConfiguration({ state, onUpdate }: StepConfigurationProps) {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Form Configuration</h2>
        <p className="text-muted-foreground">
          Set up the basic information for your form
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the name, title, and description of your form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Form Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Contact Form"
              required
            />
            <p className="text-xs text-muted-foreground">
              Internal name for your reference
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Get in Touch"
            />
            <p className="text-xs text-muted-foreground">
              Display title shown on the form (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={state.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Fill out the form below and we'll get back to you soon."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Optional description shown on the form
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

