"use client";

import { useState } from "react";
import { Mail, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleEmailIntegration } from "@/actions/integrations";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { EmailProvider } from "@/types/intigrations";

interface EmailIntegrationCardProps {
  provider: EmailProvider;
  isConnected: boolean;
  isEnabled: boolean;
  emailAddress: string | null;
  onView: () => void;
  onToggle: (enabled: boolean) => void;
}

const providerConfig = {
  gmail: {
    name: "Gmail",
    description:
      "Connect your Gmail account to send emails through Google's secure email service.",
    icon: "/icons/gmail.svg",
  },
  outlook: {
    name: "Outlook",
    description:
      "Connect your Outlook account to send emails through Microsoft's email service.",
    icon: "/icons/outlook.svg",
  },
  custom: {
    name: "Custom",
    description:
      "Configure your custom email provider SMTP credentials to send emails through your email service.",
    icon: "/icons/custom.svg",
  },
};

export function EmailIntegrationCard({
  provider,
  isConnected,
  isEnabled,
  emailAddress,
  onView,
  onToggle,
}: EmailIntegrationCardProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (!isConnected) {
      // If not connected, open the sheet to connect first
      onToggle(checked);
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleEmailIntegration(provider, checked);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(
          checked
            ? `${config.name} integration enabled`
            : `${config.name} integration disabled`
        );
      }
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast.error("Failed to toggle integration");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Header with icon and menu */}
        <div className="flex items-start justify-between mb-4">
          <Image
            src={Icon as string}
            alt={config.name}
            width={32}
            height={32}
          />
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={!isConnected || isToggling}
          />
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">{config.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {config.description}
          </p>
        </div>

        {/* Account Info */}
        <div className="mb-4">
          {isConnected ? (
            <p className="text-sm text-muted-foreground">
              {emailAddress ? `Connected as ${emailAddress}` : "1 Account"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="default"
            onClick={onView}
            className="flex-1"
          >
            View integration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
