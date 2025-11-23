"use client"

import { useState, useCallback, useEffect } from "react"

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
  type: FieldType
  name: string
  label: string
  placeholder?: string
  required: boolean
  order: number
  validation?: FieldValidation
  options?: string[] | { label: string; value: string }[]
  defaultValue?: any
  helpText?: string
  conditional?: {
    field: string
    operator: string
    value: any
  }
}

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

const DEFAULT_STATE: FormBuilderState = {
  name: "",
  title: "",
  description: "",
  fields: [],
  redirectBehavior: "message",
  successMessage: "Thank you! We will be in touch soon.",
  automations: {
    sendThankYouEmail: false,
    sendOwnerNotification: false,
    addToCRM: false,
    webhook: false,
    scheduleFollowUp: false,
  },
}

export function useFormBuilder(initialFormId?: string) {
  const [state, setState] = useState<FormBuilderState>(DEFAULT_STATE)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`form-builder-${initialFormId || "new"}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState(parsed.state || DEFAULT_STATE)
        setCurrentStep(parsed.step || 1)
      } catch (e) {
        console.error("Failed to load form builder state", e)
      }
    }
  }, [initialFormId])

  // Auto-save to localStorage
  useEffect(() => {
    if (state.name || state.fields.length > 0) {
      localStorage.setItem(
        `form-builder-${initialFormId || "new"}`,
        JSON.stringify({ state, step: currentStep })
      )
    }
  }, [state, currentStep, initialFormId])

  const updateState = useCallback(
    (updates: Partial<FormBuilderState>) => {
      setState((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  const addField = useCallback((type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: `field_${type}_${Date.now()}`,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: `Enter ${type}`,
      required: false,
      order: state.fields.length,
    }

    // Set default options for certain field types
    if (type === "dropdown" || type === "radio") {
      newField.options = ["Option 1", "Option 2", "Option 3"]
    }

    if (type === "slider") {
      newField.validation = {
        sliderRules: {
          min: 0,
          max: 100,
          step: 1,
        },
      }
    }

    setState((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }))

    setSelectedFieldId(newField.id)
  }, [state.fields.length])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setState((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }))
  }, [])

  const deleteField = useCallback((fieldId: string) => {
    setState((prev) => ({
      ...prev,
      fields: prev.fields
        .filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index })),
    }))
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null)
    }
  }, [selectedFieldId])

  const duplicateField = useCallback((fieldId: string) => {
    const field = state.fields.find((f) => f.id === fieldId)
    if (!field) return

    const newField: FormField = {
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`,
      order: state.fields.length,
    }

    setState((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }))

    setSelectedFieldId(newField.id)
  }, [state.fields])

  const reorderFields = useCallback((startIndex: number, endIndex: number) => {
    setState((prev) => {
      const newFields = Array.from(prev.fields)
      const [removed] = newFields.splice(startIndex, 1)
      newFields.splice(endIndex, 0, removed)

      // Update order property
      return {
        ...prev,
        fields: newFields.map((field, index) => ({ ...field, order: index })),
      }
    })
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step)
    }
  }, [])

  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return state.name.trim().length > 0
        case 2:
          return state.fields.length > 0
        case 3:
          if (state.redirectBehavior === "redirect") {
            return !!state.redirectUrl && state.redirectUrl.trim().length > 0
          }
          return state.successMessage.trim().length > 0
        case 4:
          return true // Automations are optional
        case 5:
          return true // Share/embed is always valid
        default:
          return false
      }
    },
    [state]
  )

  const reset = useCallback(() => {
    setState(DEFAULT_STATE)
    setCurrentStep(1)
    setSelectedFieldId(null)
    if (initialFormId) {
      localStorage.removeItem(`form-builder-${initialFormId}`)
    }
    localStorage.removeItem("form-builder-new")
  }, [initialFormId])

  return {
    state,
    currentStep,
    selectedFieldId,
    updateState,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    setSelectedFieldId,
    nextStep,
    previousStep,
    goToStep,
    validateStep,
    reset,
  }
}

