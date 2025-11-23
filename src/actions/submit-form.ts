'use server'

import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { updateTag } from 'next/cache'
import { invalidateFormEmbedCache, CACHE_TAGS } from '@/lib/cache/config'

/**
 * Submit a form (public, no auth required)
 */
export async function submitForm(
  formId: string,
  data: Record<string, any>,
  files?: { fieldName: string; file: File }[]
) {
  try {
    // Get form to verify it exists and is active
    const form = await db.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        userId: true,
        isActive: true,
        fields: true,
        embedCode: true,
      },
    })

    if (!form) {
      return { error: 'Form not found' }
    }

    if (!form.isActive) {
      return { error: 'This form is not active' }
    }

    // Get request metadata
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    const referrer = headersList.get('referer') || null

    // Validate required fields
    const fields = (form.fields as any[]) || []
    const requiredFields = fields.filter((f) => f.required)
    const missingFields = requiredFields.filter(
      (field) => !data[field.name] || data[field.name] === ''
    )

    if (missingFields.length > 0) {
      return {
        error: `Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`,
      }
    }

    // Handle file uploads (if any)
    // For now, we'll store file metadata in the submission data
    // File uploads to Cloudinary would be handled here in production
    const submissionData = { ...data }
    if (files && files.length > 0) {
      // Store file references in submission data
      files.forEach((fileData) => {
        submissionData[fileData.fieldName] = {
          fileName: fileData.file.name,
          fileType: fileData.file.type,
          fileSize: fileData.file.size,
          // In production, upload to Cloudinary and store URLs
        }
      })
    }

    // Create submission
    const submission = await db.formSubmission.create({
      data: {
        formId: form.id,
        userId: form.userId, // Owner's user ID
        data: submissionData,
        ipAddress,
        userAgent,
        referrer,
        source: 'WEBSITE', // Could be EMBED, API, etc.
        status: 'NEW',
      },
    })

    // Trigger automations (this would be handled by a job queue in production)
    // For now, we'll just create the submission and automations will be processed separately

    // Invalidate form embed cache and submissions cache
    // Note: We don't invalidate the form structure cache as it hasn't changed
    if (form.embedCode) {
      updateTag(invalidateFormEmbedCache(form.embedCode))
    }
    updateTag(CACHE_TAGS.FORM_SUBMISSIONS(form.id))
    
    return { success: true, submissionId: submission.id }
  } catch (error) {
    console.error('Error submitting form:', error)
    return { error: 'Failed to submit form' }
  }
}

