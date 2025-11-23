"use client"

import {
  TypeIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  HashIcon,
  FileTextIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckSquareIcon,
  RadioIcon,
  UploadIcon,
  SlidersIcon,
  PaletteIcon,
  GlobeIcon,
  TagIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FieldType } from "@/hooks/use-form-builder"

interface FieldTypeOption {
  type: FieldType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const FIELD_TYPES: FieldTypeOption[] = [
  {
    type: "text",
    label: "Text",
    icon: TypeIcon,
    description: "Single line text input",
  },
  {
    type: "email",
    label: "Email",
    icon: MailIcon,
    description: "Email address input",
  },
  {
    type: "password",
    label: "Password",
    icon: LockIcon,
    description: "Password input with validation",
  },
  {
    type: "phone",
    label: "Phone",
    icon: PhoneIcon,
    description: "Phone number input",
  },
  {
    type: "number",
    label: "Number",
    icon: HashIcon,
    description: "Numeric input",
  },
  {
    type: "textarea",
    label: "Textarea",
    icon: FileTextIcon,
    description: "Multi-line text input",
  },
  {
    type: "date",
    label: "Date",
    icon: CalendarIcon,
    description: "Date picker",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDownIcon,
    description: "Select from options",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquareIcon,
    description: "Single or multiple checkboxes",
  },
  {
    type: "radio",
    label: "Radio",
    icon: RadioIcon,
    description: "Radio button group",
  },
  {
    type: "file",
    label: "File Upload",
    icon: UploadIcon,
    description: "File upload input",
  },
  {
    type: "slider",
    label: "Slider",
    icon: SlidersIcon,
    description: "Range slider input",
  },
  {
    type: "color",
    label: "Color Picker",
    icon: PaletteIcon,
    description: "Color selection",
  },
  {
    type: "country",
    label: "Country",
    icon: GlobeIcon,
    description: "Country selector",
  },
  {
    type: "tag",
    label: "Tag",
    icon: TagIcon,
    description: "Tag input field",
  },
]

interface FieldsSidebarProps {
  onAddField: (type: FieldType) => void
}

export function FieldsSidebar({ onAddField }: FieldsSidebarProps) {
  return (
    <div className="h-full w-64 border-l bg-muted/30 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Field Types</h3>
        <p className="text-xs text-muted-foreground">
          Click to add to form
        </p>
      </div>

      <div className="space-y-1">
        {FIELD_TYPES.map((fieldType) => {
          const Icon = fieldType.icon
          return (
            <Button
              key={fieldType.type}
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 h-auto py-3 px-3",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onAddField(fieldType.type)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{fieldType.label}</span>
                <span className="text-xs text-muted-foreground">
                  {fieldType.description}
                </span>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

