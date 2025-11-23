"use client"

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { EyeIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FieldItem } from "./field-item"
import type { FormField } from "@/types/form"

interface FormPreviewProps {
  fields: FormField[]
  selectedFieldId: string | null
  onFieldSelect: (fieldId: string) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (fieldId: string) => void
  onReorder: (startIndex: number, endIndex: number) => void
  previewMode: "static" | "interactive"
  onPreviewModeChange: (mode: "static" | "interactive") => void
}

export function FormPreview({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldDuplicate,
  onReorder,
  previewMode,
  onPreviewModeChange,
}: FormPreviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Preview Mode Toggle */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <h3 className="text-sm font-semibold">Form Preview</h3>
        <div className="flex gap-1 rounded-lg border bg-background p-1">
          <Button
            size="sm"
            variant={previewMode === "static" ? "default" : "ghost"}
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => onPreviewModeChange("static")}
          >
            <CodeIcon className="h-3.5 w-3.5" />
            Static
          </Button>
          <Button
            size="sm"
            variant={previewMode === "interactive" ? "default" : "ghost"}
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => onPreviewModeChange("interactive")}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Interactive
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {fields.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No fields yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add fields from the sidebar to get started
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mx-auto max-w-2xl space-y-4">
                {fields.map((field) => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => onFieldSelect(field.id)}
                    onDelete={() => onFieldDelete(field.id)}
                    onDuplicate={() => onFieldDuplicate(field.id)}
                    previewMode={previewMode}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

