// Email Provider Types
export type EmailProvider = "gmail" | "outlook" | "custom";

// Integration Types and Statuses
// (These will be available from @prisma/client after running `prisma generate`)
export const IntegrationType = {
  EMAIL: 'EMAIL',
  CALENDAR: 'CALENDAR',
  TWILIO: 'TWILIO',
} as const;

export type IntegrationType = typeof IntegrationType[keyof typeof IntegrationType];

export const IntegrationStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ERROR: 'ERROR',
  EXPIRED: 'EXPIRED',
} as const;

export type IntegrationStatus = typeof IntegrationStatus[keyof typeof IntegrationStatus];

// Email Integration Types
export interface EmailIntegrationProvider {
  provider: EmailProvider;
  isConnected: boolean;
  isEnabled: boolean;
  emailAddress: string | null;
  connectedAt: Date | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromEmail: string | null;
  // Note: smtpPassword is not returned for security
}

export interface EmailIntegrationData {
  providers: EmailIntegrationProvider[];
  activeProvider: EmailProvider | null;
}

// Component Props Types
export interface IntegrationsContentProps {
  emailData: EmailIntegrationData;
}
