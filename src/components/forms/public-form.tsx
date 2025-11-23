"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { submitForm } from "@/actions/submit-form"
import type { FormData } from "@/lib/forms/get-form-by-embed-code"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface PublicFormProps {
  form: FormData
}

export function PublicForm({ form }: PublicFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)

  const theme = form.theme || { primaryColor: "#3B82F6", submitText: "Submit" }
  const formSettings = form.formSettings || {
    redirectBehavior: "message",
    successMessage: form.successMessage || "Thank you! We will be in touch soon.",
    redirectUrl: form.redirectUrl || undefined,
  }
  
  // Use formSettings values if available, otherwise fall back to form-level values
  const finalRedirectUrl = formSettings.redirectUrl || form.redirectUrl || undefined
  const finalSuccessMessage = formSettings.successMessage || form.successMessage || "Thank you! We will be in touch soon."

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await submitForm(form.id, formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        setSubmitted(true)
        toast.success("Form submitted successfully!")

        // Handle redirect or show success message
        if (formSettings.redirectBehavior === "redirect" && finalRedirectUrl) {
          setTimeout(() => {
            window.location.href = finalRedirectUrl
          }, 1500)
        }
      }
    })
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const renderField = (field: any) => {
    const value = formData[field.name] || field.defaultValue || ""

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <Input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPending || submitted}
          />
        )

      case "password":
        return (
          <Input
            type="password"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPending || submitted}
          />
        )

      case "textarea":
        return (
          <Textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPending || submitted}
            rows={4}
            className="resize-none"
          />
        )

      case "date":
        return (
          <Input
            type="date"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            disabled={isPending || submitted}
          />
        )

      case "dropdown":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={isPending || submitted}
            required={field.required}
          >
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(field.options) &&
                field.options.map((opt: string | { label: string; value: string }, idx: number) => {
                  const optionValue = typeof opt === "string" ? opt : opt.value
                  const optionLabel = typeof opt === "string" ? opt : opt.label
                  return (
                    <SelectItem key={idx} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  )
                })}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={isPending || submitted}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        )

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={isPending || submitted}
            required={field.required}
          >
            {Array.isArray(field.options) &&
              field.options.map((opt: string | { label: string; value: string }, idx: number) => {
                const optionValue = typeof opt === "string" ? opt : opt.value
                const optionLabel = typeof opt === "string" ? opt : opt.label
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionValue} id={`${field.name}-${idx}`} />
                    <Label htmlFor={`${field.name}-${idx}`} className="text-sm font-normal">
                      {optionLabel}
                    </Label>
                  </div>
                )
              })}
          </RadioGroup>
        )

      case "file":
        return (
          <Input
            type="file"
            id={field.name}
            name={field.name}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleChange(field.name, file)
              }
            }}
            required={field.required}
            disabled={isPending || submitted}
            accept={field.validation?.fileRules?.allowedTypes?.join(",")}
          />
        )

      case "slider":
        const sliderValue = value || field.validation?.sliderRules?.min || 0
        return (
          <div className="space-y-2">
            <Slider
              value={[sliderValue]}
              onValueChange={(vals) => handleChange(field.name, vals[0])}
              min={field.validation?.sliderRules?.min || 0}
              max={field.validation?.sliderRules?.max || 100}
              step={field.validation?.sliderRules?.step || 1}
              disabled={isPending || submitted}
            />
            <div className="text-sm text-muted-foreground text-center">
              {sliderValue}
            </div>
          </div>
        )

      case "color":
        return (
          <Input
            type="color"
            id={field.name}
            name={field.name}
            value={value || "#3B82F6"}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            disabled={isPending || submitted}
            className="h-12 w-full"
          />
        )

      case "country":
        return (
          <Input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Enter country"}
            required={field.required}
            disabled={isPending || submitted}
          />
        )

      case "tag":
        return (
          <Input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Add tags (comma separated)"}
            required={field.required}
            disabled={isPending || submitted}
          />
        )

      default:
        return (
          <Input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPending || submitted}
          />
        )
    }
  }

  // Sort fields by order
  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order)

  // Check if we're in an iframe
  const isInIframe = typeof window !== "undefined" && window.self !== window.top

  if (submitted && formSettings.redirectBehavior === "message") {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30 p-6", isInIframe ? "min-h-[400px]" : "min-h-screen")}>
        <div className="w-full max-w-md rounded-lg border bg-background p-8 text-center shadow-lg">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Thank You!</h2>
          <p className="text-muted-foreground">
            {finalSuccessMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-muted/30", isInIframe ? "py-6" : "min-h-screen py-12")}>
      <div className="container mx-auto max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8 shadow-lg">
          {/* Form Header */}
          {form.title && (
            <div className="mb-6">
              <h1
                className="text-3xl font-bold"
                style={{ color: theme.primaryColor }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p className="mt-2 text-muted-foreground">{form.description}</p>
              )}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {sortedFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {renderField(field)}
                {field.helpText && (
                  <p className="text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending || submitted}
                className="w-full"
                style={{
                  backgroundColor: theme.primaryColor,
                }}
              >
                {isPending ? "Submitting..." : submitted ? "Submitted" : theme.submitText || "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

