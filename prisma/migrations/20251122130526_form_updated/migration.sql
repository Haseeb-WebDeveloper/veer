-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "automation_config" JSONB DEFAULT '{}',
ADD COLUMN     "form_settings" JSONB DEFAULT '{}';
