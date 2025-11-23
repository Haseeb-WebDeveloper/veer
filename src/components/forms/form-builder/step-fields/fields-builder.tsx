"use client"

import { useState } from "react"
import { FieldsSidebar } from "./fields-sidebar"
import { FormPreview } from "./form-preview"
import { FieldSettingsPanel } from "./field-settings-panel"
import type { FormField } from "@/hooks/use-form-builder"

interface FieldsBuilderProps {
  fields: FormField[]
  selectedFieldId: string | null
  onAddField: (type: any) => void
  onFieldSelect: (fieldId: string) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (fieldId: string) => void
  onReorder: (startIndex: number, endIndex: number) => void
}

export function FieldsBuilder({
  fields,
  selectedFieldId,
  onAddField,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
  onReorder,
}: FieldsBuilderProps) {
  const [previewMode, setPreviewMode] = useState<"static" | "interactive">("interactive")
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 12rem)' }}>
      {/* Main Preview Area */}
      <div className="flex-1 overflow-hidden">
        <FormPreview
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldSelect={onFieldSelect}
          onFieldDelete={onFieldDelete}
          onFieldDuplicate={onFieldDuplicate}
          onReorder={onReorder}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
        />
      </div>

      {/* Right Sidebar - Field Types or Settings */}
      {selectedField ? (
        <FieldSettingsPanel
          field={selectedField}
          onUpdate={(updates) => onFieldUpdate(selectedField.id, updates)}
          onClose={() => onFieldSelect("")}
        />
      ) : (
        <FieldsSidebar onAddField={onAddField} />
      )}
    </div>
  )
}

