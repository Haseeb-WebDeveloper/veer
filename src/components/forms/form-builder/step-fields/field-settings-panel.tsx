"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { FormField, FieldType } from "@/types/form"

interface FieldSettingsPanelProps {
  field: FormField | null
  onUpdate: (updates: Partial<FormField>) => void
  onClose: () => void
}

export function FieldSettingsPanel({
  field,
  onUpdate,
  onClose,
}: FieldSettingsPanelProps) {
  if (!field) {
    return (
      <div className="h-full w-80 border-l bg-muted/30 p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Select a field to edit settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-80 overflow-y-auto border-l bg-muted/30">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <h3 className="text-sm font-semibold">Field Settings</h3>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Field label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Field Name</Label>
              <Input
                id="name"
                value={field.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="field_name"
              />
              <p className="text-xs text-muted-foreground">
                Used for form submission data
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText">Help Text</Label>
              <Input
                id="helpText"
                value={field.helpText || ""}
                onChange={(e) => onUpdate({ helpText: e.target.value })}
                placeholder="Additional help text"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="required">Required</Label>
              <Switch
                id="required"
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Type-Specific Settings */}
        {renderTypeSpecificSettings(field, onUpdate)}

        {/* Validation Settings */}
        {renderValidationSettings(field, onUpdate)}
      </div>
    </div>
  )
}

function renderTypeSpecificSettings(
  field: FormField,
  onUpdate: (updates: Partial<FormField>) => void
) {
  switch (field.type) {
    case "dropdown":
    case "radio":
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              value={
                Array.isArray(field.options)
                  ? field.options.join("\n")
                  : ""
              }
              onChange={(e) => {
                const options = e.target.value
                  .split("\n")
                  .filter((opt) => opt.trim().length > 0)
                onUpdate({ options })
              }}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Enter one option per line
            </p>
          </CardContent>
        </Card>
      )

    case "slider":
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Slider Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slider-min">Min Value</Label>
                <Input
                  id="slider-min"
                  type="number"
                  value={field.validation?.sliderRules?.min || 0}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        sliderRules: {
                          ...field.validation?.sliderRules,
                          min: Number(e.target.value),
                          max: field.validation?.sliderRules?.max || 100,
                          step: field.validation?.sliderRules?.step || 1,
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slider-max">Max Value</Label>
                <Input
                  id="slider-max"
                  type="number"
                  value={field.validation?.sliderRules?.max || 100}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        sliderRules: {
                          ...field.validation?.sliderRules,
                          min: field.validation?.sliderRules?.min || 0,
                          max: Number(e.target.value),
                          step: field.validation?.sliderRules?.step || 1,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slider-step">Step</Label>
              <Input
                id="slider-step"
                type="number"
                value={field.validation?.sliderRules?.step || 1}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      sliderRules: {
                        ...field.validation?.sliderRules,
                        min: field.validation?.sliderRules?.min || 0,
                        max: field.validation?.sliderRules?.max || 100,
                        step: Number(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      )

    case "file":
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">File Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-max-size">Max Size (MB)</Label>
              <Input
                id="file-max-size"
                type="number"
                value={
                  field.validation?.fileRules?.maxSize
                    ? field.validation.fileRules.maxSize / (1024 * 1024)
                    : 5
                }
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      fileRules: {
                        ...field.validation?.fileRules,
                        maxSize: Number(e.target.value) * 1024 * 1024,
                        allowedTypes:
                          field.validation?.fileRules?.allowedTypes || [],
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-types">Allowed Types</Label>
              <Input
                id="file-types"
                placeholder="image/jpeg, application/pdf"
                value={field.validation?.fileRules?.allowedTypes?.join(", ") || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      fileRules: {
                        ...field.validation?.fileRules,
                        maxSize: field.validation?.fileRules?.maxSize || 5242880,
                        allowedTypes: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t.length > 0),
                      },
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated MIME types
              </p>
            </div>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}

function renderValidationSettings(
  field: FormField,
  onUpdate: (updates: Partial<FormField>) => void
) {
  const showLengthValidation =
    field.type === "text" ||
    field.type === "email" ||
    field.type === "phone" ||
    field.type === "textarea"

  const showNumberValidation = field.type === "number"

  const showPasswordValidation = field.type === "password"

  if (!showLengthValidation && !showNumberValidation && !showPasswordValidation) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showLengthValidation && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-length">Min Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={field.validation?.minLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        minLength: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-length">Max Length</Label>
                <Input
                  id="max-length"
                  type="number"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        maxLength: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>
          </>
        )}

        {showNumberValidation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-value">Min Value</Label>
              <Input
                id="min-value"
                type="number"
                value={field.validation?.min || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-value">Max Value</Label>
              <Input
                id="max-value"
                type="number"
                value={field.validation?.max || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {showPasswordValidation && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="password-min-length">Min Length</Label>
              <Input
                id="password-min-length"
                type="number"
                value={
                  field.validation?.passwordRules?.minLength || 8
                }
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      passwordRules: {
                        ...field.validation?.passwordRules,
                        minLength: Number(e.target.value) || 8,
                        requireUppercase:
                          field.validation?.passwordRules?.requireUppercase ||
                          false,
                        requireNumber:
                          field.validation?.passwordRules?.requireNumber ||
                          false,
                        requireSpecial:
                          field.validation?.passwordRules?.requireSpecial ||
                          false,
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-uppercase">Require Uppercase</Label>
                <Switch
                  id="require-uppercase"
                  checked={
                    field.validation?.passwordRules?.requireUppercase || false
                  }
                  onCheckedChange={(checked) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        passwordRules: {
                          ...field.validation?.passwordRules,
                          minLength:
                            field.validation?.passwordRules?.minLength || 8,
                          requireUppercase: checked,
                          requireNumber:
                            field.validation?.passwordRules?.requireNumber ||
                            false,
                          requireSpecial:
                            field.validation?.passwordRules?.requireSpecial ||
                            false,
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-number">Require Number</Label>
                <Switch
                  id="require-number"
                  checked={
                    field.validation?.passwordRules?.requireNumber || false
                  }
                  onCheckedChange={(checked) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        passwordRules: {
                          ...field.validation?.passwordRules,
                          minLength:
                            field.validation?.passwordRules?.minLength || 8,
                          requireUppercase:
                            field.validation?.passwordRules?.requireUppercase ||
                            false,
                          requireNumber: checked,
                          requireSpecial:
                            field.validation?.passwordRules?.requireSpecial ||
                            false,
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-special">Require Special Char</Label>
                <Switch
                  id="require-special"
                  checked={
                    field.validation?.passwordRules?.requireSpecial || false
                  }
                  onCheckedChange={(checked) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        passwordRules: {
                          ...field.validation?.passwordRules,
                          minLength:
                            field.validation?.passwordRules?.minLength || 8,
                          requireUppercase:
                            field.validation?.passwordRules?.requireUppercase ||
                            false,
                          requireNumber:
                            field.validation?.passwordRules?.requireNumber ||
                            false,
                          requireSpecial: checked,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

