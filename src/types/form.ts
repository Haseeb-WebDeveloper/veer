/**
 * Form-related TypeScript types
 * Centralized location for all form type definitions
 */

// ========================================
// Field Types
// ========================================

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "phone"
  | "number"
  | "textarea"
  | "date"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "file"
  | "slider"
  | "color"
  | "country"
  | "tag"

export type FieldValidation = {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  passwordRules?: {
    minLength: number
    requireUppercase: boolean
    requireNumber: boolean
    requireSpecial: boolean
  }
  fileRules?: {
    maxSize: number
    allowedTypes: string[]
  }
  sliderRules?: {
    min: number
    max: number
    step: number
  }
}

export type FormField = {
  id: string
  type: FieldType | string // Allow string for backward compatibility
  name: string
  label: string
  placeholder?: string
  required: boolean
  order: number
  validation?: FieldValidation | any // Allow any for backward compatibility
  options?: string[] | { label: string; value: string }[]
  defaultValue?: any
  helpText?: string
  conditional?: {
    field: string
    operator: string
    value: any
  } | any // Allow any for backward compatibility
}

// ========================================
// Form Data Types
// ========================================

/**
 * Full form data with fields, theme, and settings
 * Used for public form display
 */
export type FormData = {
  id: string
  name: string
  title: string | null
  description: string | null
  fields: FormField[]
  theme: {
    primaryColor?: string
    submitText?: string
  }
  formSettings: {
    redirectBehavior?: 'redirect' | 'message'
    redirectUrl?: string
    successMessage?: string
  } | null
  redirectUrl: string | null
  successMessage: string
  isActive: boolean
}

/**
 * Form list item (simplified form data for tables/lists)
 * Used for user's forms list
 */
export type FormListItem = {
  id: string
  name: string
  title: string | null
  description: string | null
  isActive: boolean
  embedCode: string | null
  submissionsCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * User forms data response
 */
export type UserFormsData = {
  forms: FormListItem[]
}

// ========================================
// Form Builder Types
// ========================================

/**
 * Form builder state (for form creation/editing wizard)
 */
export type FormBuilderState = {
  // Step 1: Configuration
  name: string
  title: string
  description: string

  // Step 2: Fields
  fields: FormField[]

  // Step 3: Submission Settings
  redirectBehavior: "redirect" | "message"
  redirectUrl?: string
  successMessage: string

  // Step 4: Automation Config
  automations: {
    sendThankYouEmail: boolean
    sendOwnerNotification: boolean
    addToCRM: boolean
    webhook: boolean
    scheduleFollowUp: boolean
    config?: Record<string, any>
  }

  // Step 5: Share/Embed (handled separately)
}

// ========================================
// Form Query Result Types
// ========================================

/**
 * Type for Prisma form query with id and embedCode
 */
export type FormWithEmbedCode = {
  id: string
  embedCode: string | null
}

