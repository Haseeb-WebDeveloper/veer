"use client";

import { useState, useActionState, useEffect } from "react";
import { Send, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  connectEmailSMTP,
  connectEmailOAuth,
  toggleEmailIntegration,
  disconnectEmailIntegration,
} from "@/actions/integrations";
import { updateEmailSMTP } from "@/actions/update-smtp";
import { testEmailIntegration } from "@/actions/test-email";
import Image from "next/image";
import { EmailProvider } from "@/types/intigrations";

interface EmailIntegrationSheetProps {
  provider: EmailProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnected: boolean;
  isEnabled: boolean;
  emailAddress: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpFromEmail?: string | null;
}

const providerConfig = {
  gmail: {
    name: "Gmail",
    description:
      "Connect your Gmail account to send emails through Google's secure email service.",
  },
  outlook: {
    name: "Outlook",
    description:
      "Connect your Outlook account to send emails through Microsoft's email service.",
  },
  custom: {
    name: "Custom",
    description:
      "Configure your custom email provider SMTP credentials to send emails through your email service.",
  },
};

export function EmailIntegrationSheet({
  provider,
  open,
  onOpenChange,
  isConnected,
  isEnabled: initialIsEnabled,
  emailAddress,
  smtpHost,
  smtpPort,
  smtpUser,
  smtpFromEmail,
}: EmailIntegrationSheetProps) {
  const config = providerConfig[provider];
  const [smtpState, smtpAction, smtpPending] = useActionState(
    connectEmailSMTP,
    null
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateEmailSMTP,
    null
  );
  const [isToggling, setIsToggling] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isEditingSMTP, setIsEditingSMTP] = useState(false);

  // Sync isEnabled with prop changes
  useEffect(() => {
    setIsEnabled(initialIsEnabled);
  }, [initialIsEnabled]);

  useEffect(() => {
    if (smtpState?.success) {
      toast.success(smtpState.message || `${config.name} connected successfully`);
      onOpenChange(false);
    } else if (smtpState?.error) {
      toast.error(smtpState.error);
    }
  }, [smtpState, onOpenChange, config.name]);

  useEffect(() => {
    if (updateState?.success) {
      toast.success(updateState.message || "SMTP settings updated successfully");
      setIsEditingSMTP(false);
    } else if (updateState?.error) {
      toast.error(updateState.error);
    }
  }, [updateState]);

  const handleConnectOAuth = async () => {
    try {
      const result = await connectEmailOAuth(provider as "gmail" | "outlook");
      if (result.error) {
        toast.error(result.error);
      } else if (result.redirectUrl) {
        toast.loading("Redirecting to OAuth provider...");
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      toast.error("Failed to connect OAuth provider");
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await disconnectEmailIntegration(provider);
      if (result.success) {
        toast.success(`${config.name} disconnected successfully`);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to disconnect");
      }
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleToggle = async (checked: boolean) => {
    // Optimistic update
    setIsEnabled(checked);
    setIsToggling(true);

    try {
      const result = await toggleEmailIntegration(provider, checked);
      if (result.error) {
        // Revert on error
        setIsEnabled(!checked);
        toast.error(result.error);
      } else if (result.success) {
        toast.success(
          checked
            ? `${config.name} integration enabled`
            : `${config.name} integration disabled`
        );
      }
    } catch (error) {
      // Revert on error
      setIsEnabled(!checked);
      toast.error("Failed to toggle integration");
    } finally {
      setIsToggling(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const result = await testEmailIntegration(provider);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message || "Test email sent successfully!");
      }
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col overflow-hidden p-0"
      >
        <div className="overflow-y-auto flex-1 px-6 pt-8 pb-6">
          <SheetHeader>
            <div className="space-y-3">
              <Image
                src={`/icons/${provider}.svg`}
                alt={config.name}
                width={32}
                height={32}
              />
              <div>
                <SheetTitle>{config.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  {config.description}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? emailAddress
                      ? `Connected as ${emailAddress}`
                      : "Connected"
                    : "Not connected"}
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={!isConnected || isToggling}
              />
            </div>

            {/* Connection Content */}
            {!isConnected ? (
              provider === "custom" ? (
                /* SMTP Configuration Form */
                <form action={smtpAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      name="host"
                      type="text"
                      placeholder="smtp.example.com"
                      defaultValue={smtpHost || ""}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">SMTP Port</Label>
                    <Input
                      id="port"
                      name="port"
                      type="number"
                      placeholder="587"
                      defaultValue={smtpPort?.toString() || "587"}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user">SMTP Username</Label>
                    <Input
                      id="user"
                      name="user"
                      type="text"
                      placeholder="81abe7001"
                      defaultValue={smtpUser || ""}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Your SMTP login username (for authentication)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email Address</Label>
                    <Input
                      id="fromEmail"
                      name="fromEmail"
                      type="email"
                      placeholder="contact@example.com"
                      defaultValue={smtpFromEmail || emailAddress || ""}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The email address that will appear as the sender
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">SMTP Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your SMTP password"
                      required
                    />
                  </div>

                  {smtpState?.error && (
                    <p className="text-sm text-destructive">{smtpState.error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={smtpPending}
                    className="w-full"
                  >
                    {smtpPending ? "Connecting & Testing..." : "Connect SMTP"}
                  </Button>
                </form>
              ) : (
                /* OAuth Connect Button */
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your {config.name} account to start sending emails
                    through our platform.
                  </p>
                  <Button
                    onClick={handleConnectOAuth}
                    className="w-full"
                    size="lg"
                  >
                    Connect with {config.name}
                  </Button>
                </div>
              )
            ) : (
              /* Connected State */
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✓ Successfully connected
                  </p>
                  {emailAddress && (
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      {emailAddress}
                    </p>
                  )}
                </div>

                {provider === "custom" && (
                  <>
                    {!isEditingSMTP ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">SMTP Host:</span>
                          <span className="font-mono">{smtpHost || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">SMTP Port:</span>
                          <span className="font-mono">{smtpPort || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">SMTP Username:</span>
                          <span className="font-mono">{smtpUser || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">From Email:</span>
                          <span className="font-mono">{smtpFromEmail || emailAddress || "N/A"}</span>
                        </div>
                        <Button
                          onClick={() => setIsEditingSMTP(true)}
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit SMTP Settings
                        </Button>
                      </div>
                    ) : (
                      <form action={updateAction} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-host">SMTP Host</Label>
                          <Input
                            id="edit-host"
                            name="host"
                            type="text"
                            placeholder="smtp.example.com"
                            defaultValue={smtpHost || ""}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-port">SMTP Port</Label>
                          <Input
                            id="edit-port"
                            name="port"
                            type="number"
                            placeholder="587"
                            defaultValue={smtpPort?.toString() || "587"}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-user">SMTP Username</Label>
                          <Input
                            id="edit-user"
                            name="user"
                            type="text"
                            placeholder="81abe7001"
                            defaultValue={smtpUser || ""}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Your SMTP login username (for authentication)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-fromEmail">From Email Address</Label>
                          <Input
                            id="edit-fromEmail"
                            name="fromEmail"
                            type="email"
                            placeholder="contact@example.com"
                            defaultValue={smtpFromEmail || emailAddress || ""}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            The email address that will appear as the sender
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-password">SMTP Password</Label>
                          <Input
                            id="edit-password"
                            name="password"
                            type="password"
                            placeholder="Enter your SMTP password"
                            required
                          />
                        </div>

                        {updateState?.error && (
                          <p className="text-sm text-destructive">{updateState.error}</p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditingSMTP(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updatePending}
                            className="flex-1"
                          >
                            {updatePending ? "Updating & Testing..." : "Update"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                <Button
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isTestingEmail ? "Sending test email..." : "Send Test Email"}
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
