"use client"

import { GripVerticalIcon, TrashIcon, CopyIcon, UploadIcon } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FormField } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface FieldItemProps {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  previewMode?: "static" | "interactive"
}

export function FieldItem({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  previewMode = "static",
}: FieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderFieldInput = () => {
    if (previewMode === "static") {
      return renderStaticPreview()
    }

    // Interactive preview
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className="bg-muted/50"
          />
        )
      case "password":
        return (
          <Input
            type="password"
            placeholder={field.placeholder}
            disabled
            className="bg-muted/50"
          />
        )
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            disabled
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-muted/50 px-4 py-3 text-sm"
          />
        )
      case "date":
        return (
          <Input
            type="date"
            disabled
            className="bg-muted/50"
          />
        )
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(field.options) &&
                field.options.map((opt, idx) => (
                  <SelectItem key={idx} value={String(opt)}>
                    {String(opt)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={`${field.id}-preview`} disabled />
            <Label htmlFor={`${field.id}-preview`} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup disabled>
            {Array.isArray(field.options) &&
              field.options.slice(0, 3).map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(opt)} id={`${field.id}-${idx}`} />
                  <Label htmlFor={`${field.id}-${idx}`} className="text-sm font-normal">
                    {String(opt)}
                  </Label>
                </div>
              ))}
          </RadioGroup>
        )
      case "file":
        return (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-input bg-muted/50 p-8">
            <div className="text-center">
              <UploadIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
            </div>
          </div>
        )
      case "slider":
        return (
          <Slider
            defaultValue={[50]}
            min={field.validation?.sliderRules?.min || 0}
            max={field.validation?.sliderRules?.max || 100}
            step={field.validation?.sliderRules?.step || 1}
            disabled
            className="bg-muted/50"
          />
        )
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              disabled
              className="h-10 w-20 cursor-not-allowed rounded border bg-muted/50"
              defaultValue="#3B82F6"
            />
            <span className="text-sm text-muted-foreground">Color picker</span>
          </div>
        )
      case "country":
        return (
          <div className="rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Country selector
          </div>
        )
      case "tag":
        return (
          <Input
            placeholder={field.placeholder || "Add tags..."}
            disabled
            className="bg-muted/50"
          />
        )
      default:
        return (
          <Input
            placeholder={field.placeholder}
            disabled
            className="bg-muted/50"
          />
        )
    }
  }

  const renderStaticPreview = () => {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-sm text-muted-foreground">
        {field.type} field preview
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 bg-card p-4 transition-all",
        isSelected
          ? "border-primary shadow-md"
          : "border-transparent hover:border-muted-foreground/30"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
        >
          <CopyIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Field Content */}
      <div className="ml-6 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.helpText && (
            <span className="text-xs text-muted-foreground">{field.helpText}</span>
          )}
        </div>
        {renderFieldInput()}
      </div>
    </div>
  )
}

