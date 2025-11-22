'use server'

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/get-user'
import { decrypt } from '@/lib/encryption/encrypt'
import { getValidOAuthToken } from '@/lib/integrations/get-oauth-token'
import { EmailProvider, IntegrationType as IntegrationTypeConst } from '@/types/intigrations'
import nodemailer from 'nodemailer'

/**
 * Send a test email using the specified email integration
 */
export async function testEmailIntegration(
  provider: EmailProvider
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const supabaseUser = await getUser()

  if (!supabaseUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const dbProvider = provider.toUpperCase()

    // Find the integration
    const integration = await db.integration.findUnique({
      where: {
        userId_type_provider: {
          userId: user.id,
          type: IntegrationTypeConst.EMAIL,
          provider: dbProvider,
        },
      },
    })

    if (!integration) {
      return { error: `Integration not found. Please connect ${provider} first.` }
    }

    const testEmail: string = supabaseUser.email || integration.emailAddress || ''
    const testSubject = 'Test Email from Veer'
    const testBody = `This is a test email sent from your Veer account to verify that your ${provider} integration is working correctly.

If you received this email, your email configuration is set up successfully!

Sent at: ${new Date().toLocaleString()}`

    // Send email based on provider
    if (provider === 'custom') {
      // SMTP email sending
      if (!integration.smtpHost || !integration.smtpPort || !integration.smtpUser || !integration.smtpPassword) {
        return { error: 'SMTP configuration is incomplete' }
      }

      let smtpPassword: string
      try {
        smtpPassword = await decrypt(integration.smtpPassword)
      } catch (error) {
        console.error('Error decrypting SMTP password:', error)
        return { error: 'Failed to decrypt SMTP password' }
      }

      // Validate SMTP host format
      if (integration.smtpHost.includes('@')) {
        return { 
          error: `Invalid SMTP host: "${integration.smtpHost}". The host should be a domain name (e.g., smtp-relay.brevo.com), not an email address. Please check your SMTP configuration.` 
        }
      }

      // Create transporter with better error handling
      const transporter = nodemailer.createTransport({
        host: integration.smtpHost,
        port: integration.smtpPort,
        secure: integration.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: integration.smtpUser,
          pass: smtpPassword,
        },
        // Add connection timeout
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      })

      // Verify connection first
      try {
        await transporter.verify()
      } catch (error) {
        let errorMessage = 'SMTP connection failed'
        
        if (error instanceof Error) {
          if (error.message.includes('EBADNAME') || error.message.includes('ENOTFOUND') || error.message.includes('EDNS')) {
            errorMessage = `Invalid SMTP host: "${integration.smtpHost}". Check the host is correct and not an email address.`
          } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
            errorMessage = `Cannot connect to SMTP server "${integration.smtpHost}:${integration.smtpPort}". Check host, port, and firewall settings.`
          } else if (error.message.includes('EAUTH') || (error as any).code === 'EAUTH') {
            const isBrevo = integration.smtpHost?.includes('brevo') || integration.smtpHost?.includes('sendinblue')
            errorMessage = isBrevo
              ? 'SMTP authentication failed. Check your Brevo SMTP credentials in Dashboard > SMTP & API > SMTP'
              : 'SMTP authentication failed. Check your username and password are correct.'
          } else {
            errorMessage = `SMTP error: ${error.message}`
          }
        }
        
        return { error: errorMessage }
      }

      // Send test email
      try {
        // Use smtpFromEmail if available, otherwise fallback to emailAddress or testEmail
        const fromEmail = integration.smtpFromEmail || integration.emailAddress || testEmail
        
        // Validate from email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(fromEmail)) {
          return { 
            error: `Invalid "From" email address: "${fromEmail}". Please set a valid email address in SMTP settings.` 
          }
        }

        console.log('Sending Custom SMTP Email...')
        console.log('From: ', fromEmail)
        console.log('To: ', testEmail)
        console.log('Subject: ', testSubject)
        
        const info = await transporter.sendMail({
          from: fromEmail,
          to: testEmail,
          subject: testSubject,
          text: testBody,
          html: `<p>${testBody.replace(/\n/g, '<br>')}</p>`,
        })

        console.log('Email sent successfully:', {
          messageId: info.messageId,
          response: info.response,
        })

        // Log the response for debugging
        console.log('SMTP sendMail response:', {
          messageId: info.messageId,
          response: info.response,
          accepted: info.accepted,
          rejected: info.rejected,
        })

        // Check if email was actually accepted
        if (info.rejected && info.rejected.length > 0) {
          return { 
            error: `Email was rejected by SMTP server: ${info.rejected.join(', ')}` 
          }
        }

        // Some SMTP servers accept but don't send - check response
        if (!info.messageId && !info.response) {
          console.warn('SMTP accepted email but no messageId or response received')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
        return { error: errorMessage }
      }

      return {
        success: true,
        message: `Test email sent successfully to ${testEmail}. Please check your inbox and spam folder.`,
      }
    } else if (provider === 'gmail' || provider === 'outlook') {
      // OAuth email sending
      const accessToken = await getValidOAuthToken(user.id, dbProvider as 'GMAIL' | 'OUTLOOK')

      if (!accessToken) {
        return { error: 'Failed to get valid access token. Please reconnect your account.' }
      }

      if (provider === 'gmail') {
        // Send via Gmail API
        // Get user's email for the From field
        const fromEmail = integration.emailAddress || testEmail
        
        // Gmail API requires proper MIME format
        const emailContent = [
          `From: ${fromEmail}`,
          `To: ${testEmail}`,
          `Subject: ${testSubject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: 7bit',
          '',
          `<html><body><p>${testBody.replace(/\n/g, '<br>')}</p></body></html>`,
        ].join('\r\n')

        // Gmail API requires URL-safe base64 encoding (RFC 4648)
        const encodedEmail = Buffer.from(emailContent)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedEmail,
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          const errorMessage = error.error?.message || response.statusText
          
          if (error.error?.code === 403 && errorMessage.includes('Gmail API has not been used')) {
            const projectId = error.error?.details?.[0]?.metadata?.containerInfo || 'your-project'
            return { 
              error: `Gmail API is not enabled. Enable it here: https://console.cloud.google.com/apis/api/gmail.googleapis.com/overview?project=${projectId}`
            }
          }
          
          return { error: `Failed to send email via Gmail: ${errorMessage}` }
        }

        return {
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
        }
      } else {
        // Send via Microsoft Graph API
        const requestBody = {
          message: {
            subject: testSubject,
            body: {
              contentType: 'HTML',
              content: `<html><body><p>${testBody.replace(/\n/g, '<br>')}</p></body></html>`,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: testEmail,
                },
              },
            ],
          },
        }

        const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          const errorMessage = error.error?.message || response.statusText
          return { error: `Failed to send email via Outlook: ${errorMessage}` }
        }

        return {
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
        }
      }
    } else {
      return { error: `Unsupported provider: ${provider}` }
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to send test email' }
  }
}

