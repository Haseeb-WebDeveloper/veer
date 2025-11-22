"use client"

import { useState, useActionState } from "react"
import { CreditCard } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { updateSubscription } from "@/actions/settings"
import { useEffect } from "react"
import type { PlanType } from "@prisma/client"

interface PlansBillingTabContentProps {
  currentPlan: PlanType
}

export function PlansBillingTabContent({ currentPlan }: PlansBillingTabContentProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.toLowerCase())
  const [state, formAction, isPending] = useActionState(updateSubscription, null)

  useEffect(() => {
    if (state?.success) {
      console.log('Subscription updated successfully')
    }
  }, [state])

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value)
  }

  return (
    <div className="space-y-6">
      {/* Plans & Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Plans & Billing</CardTitle>
          </div>
          <CardDescription>
            Manage your subscription plan and billing details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction}>
            <RadioGroup 
              value={selectedPlan} 
              onValueChange={handlePlanChange} 
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="starter" id="starter" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="starter" className="cursor-pointer font-semibold text-base">
                    Starter Plan - $197/month
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Voice or Forms - Up to 500 calls/month, 100 form submissions/month
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="professional" id="professional" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="professional" className="cursor-pointer font-semibold text-base">
                    Professional Plan - $347/month
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Voice + Forms + Calendar - Up to 2000 calls/month, 500 form submissions/month
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="enterprise" id="enterprise" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="enterprise" className="cursor-pointer font-semibold text-base">
                    Enterprise Plan - $597/month
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Everything + Custom - Unlimited calls, unlimited form submissions
                  </p>
                </div>
              </div>
            </RadioGroup>
            <input type="hidden" name="planType" value={selectedPlan.toUpperCase()} />
            {state?.error && (
              <p className="text-sm text-destructive mt-4">{state.error}</p>
            )}
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isPending || selectedPlan === currentPlan.toLowerCase()}>
                {isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Card Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Card Details</CardTitle>
          </div>
          <CardDescription>
            Update your card details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on card</Label>
            <Input id="cardName" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9876 5432" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expDate">Exp Date</Label>
              <Input id="expDate" placeholder="05/27" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" type="password" placeholder="***" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input id="billingAddress" placeholder="123 Main Street, City, State, ZIP" />
          </div>
          <div className="flex justify-end">
            <Button>Update Card</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

