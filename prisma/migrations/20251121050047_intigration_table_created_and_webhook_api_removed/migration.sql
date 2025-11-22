/*
  Warnings:

  - The `delay_type` column on the `automation_actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `calendar_connected` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `calendar_connected_at` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `calendar_refresh_token` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email_address` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email_connected` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email_connected_at` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email_oauth_token` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email_provider` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `google_calendar_id` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_host` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_password` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_port` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_user` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `twilio_phone_number` on the `business_settings` table. All the data in the column will be lost.
  - The `trigger_event` column on the `form_automations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `source` column on the `form_submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `api_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_delivery_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook_endpoints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook_logs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `automation_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `form_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('GMAIL', 'OUTLOOK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FormSubmissionSource" AS ENUM ('WEBSITE', 'EMBED', 'API', 'IMPORT');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('ON_SUBMIT', 'ON_STATUS_CHANGE', 'ON_TAG_ADDED', 'ON_FIELD_CHANGE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "DelayType" AS ENUM ('NONE', 'SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'CONDITION');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('EMAIL', 'CALENDAR', 'TWILIO');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "webhook_logs" DROP CONSTRAINT "webhook_logs_endpoint_id_fkey";

-- AlterTable
ALTER TABLE "automation_actions" DROP COLUMN "delay_type",
ADD COLUMN     "delay_type" "DelayType" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "automation_jobs" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "business_settings" DROP COLUMN "calendar_connected",
DROP COLUMN "calendar_connected_at",
DROP COLUMN "calendar_refresh_token",
DROP COLUMN "email_address",
DROP COLUMN "email_connected",
DROP COLUMN "email_connected_at",
DROP COLUMN "email_oauth_token",
DROP COLUMN "email_provider",
DROP COLUMN "google_calendar_id",
DROP COLUMN "smtp_host",
DROP COLUMN "smtp_password",
DROP COLUMN "smtp_port",
DROP COLUMN "smtp_user",
DROP COLUMN "twilio_phone_number";

-- AlterTable
ALTER TABLE "form_attachments" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "form_automations" DROP COLUMN "trigger_event",
ADD COLUMN     "trigger_event" "AutomationTrigger" NOT NULL DEFAULT 'ON_SUBMIT';

-- AlterTable
ALTER TABLE "form_submissions" DROP COLUMN "source",
ADD COLUMN     "source" "FormSubmissionSource";

-- DropTable
DROP TABLE "api_keys";

-- DropTable
DROP TABLE "email_analytics";

-- DropTable
DROP TABLE "email_delivery_logs";

-- DropTable
DROP TABLE "webhook_endpoints";

-- DropTable
DROP TABLE "webhook_logs";

-- DropEnum
DROP TYPE "EmailEvent";

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'INACTIVE',
    "provider" TEXT NOT NULL,
    "connected_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "error_message" TEXT,
    "email_address" TEXT,
    "email_oauth_token" TEXT,
    "email_oauth_refresh_token" TEXT,
    "email_oauth_token_expires_at" TIMESTAMP(3),
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_password" TEXT,
    "google_calendar_id" TEXT,
    "calendar_access_token" TEXT,
    "calendar_refresh_token" TEXT,
    "calendar_token_expires_at" TIMESTAMP(3),
    "twilio_account_sid" TEXT,
    "twilio_auth_token" TEXT,
    "twilio_phone_number" TEXT,
    "config" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_user_id_idx" ON "integrations"("user_id");

-- CreateIndex
CREATE INDEX "integrations_user_id_type_idx" ON "integrations"("user_id", "type");

-- CreateIndex
CREATE INDEX "integrations_user_id_type_status_idx" ON "integrations"("user_id", "type", "status");

-- CreateIndex
CREATE INDEX "integrations_status_idx" ON "integrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_user_id_type_provider_key" ON "integrations"("user_id", "type", "provider");

-- CreateIndex
CREATE INDEX "automation_jobs_user_id_status_scheduled_for_idx" ON "automation_jobs"("user_id", "status", "scheduled_for");

-- CreateIndex
CREATE INDEX "form_attachments_user_id_idx" ON "form_attachments"("user_id");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_attachments" ADD CONSTRAINT "form_attachments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_jobs" ADD CONSTRAINT "automation_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
