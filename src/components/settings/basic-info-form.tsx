"use client"

import { useActionState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/actions/settings"
import { useEffect } from "react"

interface BasicInfoFormProps {
  initialData: {
    email?: string
    phone?: string
    businessName?: string
    industry?: string
    businessPhone?: string
    businessEmail?: string
    country?: string
    timezone?: string
  }
  isBusinessForm?: boolean
}

export function BasicInfoForm({ initialData, isBusinessForm = false }: BasicInfoFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  useEffect(() => {
    if (state?.success) {
      // Optionally show success message
      console.log('Profile updated successfully')
    }
  }, [state])

  if (isBusinessForm) {
    return (
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input 
              id="businessName" 
              name="businessName"
              placeholder="Your Business Name" 
              defaultValue={initialData.businessName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input 
              id="industry" 
              name="industry"
              placeholder="e.g., HVAC, Plumbing, Dental" 
              defaultValue={initialData.industry}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input 
              id="businessPhone" 
              name="businessPhone"
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              defaultValue={initialData.businessPhone}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input 
              id="businessEmail" 
              name="businessEmail"
              type="email" 
              placeholder="business@email.com" 
              defaultValue={initialData.businessEmail}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              name="country"
              placeholder="United States" 
              defaultValue={initialData.country}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input 
              id="timezone" 
              name="timezone"
              placeholder="America/New_York" 
              defaultValue={initialData.timezone}
            />
          </div>
        </div>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="your@email.com" 
            defaultValue={initialData.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            name="phone"
            type="tel" 
            placeholder="+1 (555) 000-0000" 
            defaultValue={initialData.phone}
          />
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

