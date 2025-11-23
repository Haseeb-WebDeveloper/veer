"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { useFormBuilder } from "@/hooks/use-form-builder"
import { FormWizard } from "@/components/forms/form-builder/form-wizard"
import { StepConfiguration } from "@/components/forms/form-builder/step-configuration"
import { FieldsBuilder } from "@/components/forms/form-builder/step-fields/fields-builder"
import { StepSubmission } from "@/components/forms/form-builder/step-submission"
import { StepAutomation } from "@/components/forms/form-builder/step-automation"
import { StepShareEmbed } from "@/components/forms/form-builder/step-share-embed"
import { updateFormBuilder, publishForm, getFormEmbedCode, createForm } from "@/actions/forms"

interface CreateFormContentProps {
  editFormId: string | null
}

export function CreateFormContent({ editFormId }: CreateFormContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formId, setFormId] = useState<string | null>(editFormId)
  const [embedCode, setEmbedCode] = useState<string | null>(null)
  
  const {
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
  } = useFormBuilder(formId || undefined)

  // Create form on mount if needed (only if not editing)
  useEffect(() => {
    if (!formId && !editFormId) {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("name", "Untitled Form")
        const result = await createForm(formData)
        if (result.error) {
          toast.error(result.error)
        } else if (result.formId) {
          setFormId(result.formId)
          // Fetch embedCode
          const embedResult = await getFormEmbedCode(result.formId)
          if (embedResult.error) {
            toast.error(embedResult.error)
          } else if (embedResult.embedCode) {
            setEmbedCode(embedResult.embedCode)
          }
        }
      })
    } else if (editFormId) {
      setFormId(editFormId)
      // Fetch embedCode for editing
      startTransition(async () => {
        const embedResult = await getFormEmbedCode(editFormId)
        if (embedResult.error) {
          toast.error(embedResult.error)
        } else if (embedResult.embedCode) {
          setEmbedCode(embedResult.embedCode)
        }
      })
    }
  }, [formId, editFormId])

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 5) {
        handleFinish()
      } else {
        // Save current step data
        if (formId) {
          saveCurrentStep()
        }
        nextStep()
      }
    } else {
      toast.error("Please complete all required fields")
    }
  }

  const handlePrevious = () => {
    previousStep()
  }

  const saveCurrentStep = () => {
    if (!formId) return

    startTransition(async () => {
      const result = await updateFormBuilder(formId, {
        name: state.name,
        title: state.title,
        description: state.description,
        fields: state.fields,
        formSettings: {
          redirectBehavior: state.redirectBehavior,
          redirectUrl: state.redirectUrl,
          successMessage: state.successMessage,
        },
        automationConfig: state.automations,
      })

      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  const handleFinish = () => {
    if (!formId) {
      toast.error("Form not created yet")
      return
    }

    if (!validateStep(5)) {
      toast.error("Please complete all required fields")
      return
    }

    startTransition(async () => {
      // Final save
      const updateResult = await updateFormBuilder(formId, {
        name: state.name,
        title: state.title,
        description: state.description,
        fields: state.fields,
        formSettings: {
          redirectBehavior: state.redirectBehavior,
          redirectUrl: state.redirectUrl,
          successMessage: state.successMessage,
        },
        automationConfig: state.automations,
      })

      if (updateResult.error) {
        toast.error(updateResult.error)
        return
      }

      // Publish
      const publishResult = await publishForm(formId)
      if (publishResult.error) {
        toast.error(publishResult.error)
      } else {
        if (publishResult.embedCode) {
          setEmbedCode(publishResult.embedCode)
        }
        toast.success("Form published successfully!")
        // Stay on step 5 to show share/embed options
        // User can navigate away manually
      }
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepConfiguration
            state={state}
            onUpdate={updateState}
          />
        )
      case 2:
        return (
          <FieldsBuilder
            fields={state.fields}
            selectedFieldId={selectedFieldId}
            onAddField={addField}
            onFieldSelect={setSelectedFieldId}
            onFieldUpdate={updateField}
            onFieldDelete={deleteField}
            onFieldDuplicate={duplicateField}
            onReorder={reorderFields}
          />
        )
      case 3:
        return (
          <StepSubmission
            state={state}
            onUpdate={updateState}
          />
        )
      case 4:
        return (
          <StepAutomation
            state={state}
            onUpdate={updateState}
          />
        )
      case 5:
        return (
          <StepShareEmbed
            formId={formId || undefined}
            embedCode={embedCode || undefined}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <FormWizard
        currentStep={currentStep}
        onStepChange={goToStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={validateStep(currentStep)}
        canGoPrevious={currentStep > 1}
        onFinish={handleFinish}
        isLastStep={currentStep === 5}
      >
        <div className="h-full">{renderStep()}</div>
      </FormWizard>
    </div>
  )
}

