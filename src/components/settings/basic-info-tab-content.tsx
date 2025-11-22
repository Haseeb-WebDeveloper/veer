"use client"

import { User, Building2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BasicInfoForm } from "./basic-info-form"
import type { Profile } from "@prisma/client"

interface BasicInfoTabContentProps {
  user: {
    id: string
    email: string
  }
  profile: Profile | null
}

export function BasicInfoTabContent({ user, profile }: BasicInfoTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal information and account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoForm 
            initialData={{
              email: user.email,
              phone: profile?.phone || '',
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Business Information</CardTitle>
          </div>
          <CardDescription>
            Manage your business details and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoForm 
            initialData={{
              businessName: profile?.businessName || '',
              industry: profile?.industry || '',
              businessPhone: profile?.phone || '',
              businessEmail: profile?.email || '',
              country: profile?.country || 'US',
              timezone: profile?.timezone || 'America/New_York',
            }}
            isBusinessForm
          />
        </CardContent>
      </Card>
    </div>
  )
}

