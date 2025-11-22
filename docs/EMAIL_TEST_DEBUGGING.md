# Email Test Debugging Guide

## Overview
This document explains common issues when testing email integrations and how to debug them.

## Common Issues & Solutions

### 1. **OAuth Token Issues**

#### Problem: "Failed to get valid access token"
**Possible Causes:**
- Token not stored correctly during OAuth callback
- Token expired and refresh failed
- Encryption/decryption issues
- Missing refresh token

**How to Check:**
1. Open browser console (F12) when testing
2. Look for debug logs showing token status
3. Check if `hasOAuthToken` and `hasRefreshToken` are true

**Solutions:**
- **Reconnect the integration** - This will get fresh tokens
- **Check ENCRYPTION_KEY** - Make sure it's set in environment variables
- **Verify OAuth scopes** - Gmail needs `gmail.send`, Outlook needs `Mail.Send`

### 2. **Gmail API Issues**

#### Problem: "Failed to send email via Gmail"
**Possible Causes:**
- Missing or incorrect OAuth scopes
- Gmail API not enabled in Google Cloud Console
- Invalid email format
- Token doesn't have send permission

**How to Fix:**
1. **Enable Gmail API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

2. **Check OAuth Scopes:**
   - In `src/lib/oauth/google.ts`, verify scopes include:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/userinfo.email`

3. **Re-authenticate:**
   - Disconnect and reconnect Gmail integration
   - Make sure to grant "Send email" permission

### 3. **Outlook/Microsoft Graph API Issues**

#### Problem: "Failed to send email via Outlook"
**Possible Causes:**
- Missing Mail.Send permission
- Microsoft Graph API not configured
- Tenant restrictions

**How to Fix:**
1. **Check API Permissions:**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to your app registration
   - Under "API permissions", ensure `Mail.Send` is granted

2. **Verify Scopes:**
   - In `src/lib/oauth/microsoft.ts`, verify scopes include:
     - `https://graph.microsoft.com/Mail.Send`
     - `offline_access` (for refresh tokens)

### 4. **SMTP Issues**

#### Problem: "SMTP connection failed"
**Possible Causes:**
- Wrong SMTP host/port
- Incorrect credentials
- Firewall blocking connection
- TLS/SSL configuration wrong
- Some providers require app-specific passwords

**How to Fix:**
1. **Common SMTP Settings:**
   - **Gmail:** smtp.gmail.com, port 587 (TLS) or 465 (SSL)
   - **Outlook:** smtp-mail.outlook.com, port 587
   - **Custom:** Check your email provider's documentation

2. **For Gmail SMTP:**
   - Enable "Less secure app access" OR
   - Use App Password (recommended):
     - Go to Google Account > Security
     - Enable 2-Step Verification
     - Generate App Password
     - Use that password instead of regular password

3. **For Outlook SMTP:**
   - May need to enable SMTP AUTH in account settings
   - Some accounts require app-specific passwords

4. **Check Firewall:**
   - Ensure port 587 or 465 is not blocked
   - Some corporate networks block SMTP

### 5. **Encryption/Decryption Issues**

#### Problem: "Failed to decrypt password/token"
**Possible Causes:**
- ENCRYPTION_KEY not set
- ENCRYPTION_KEY changed after data was encrypted
- Corrupted encrypted data

**How to Fix:**
1. **Check Environment Variable:**
   ```bash
   # In .env.local
   ENCRYPTION_KEY=your-64-character-hex-key
   ```

2. **Generate New Key:**
   ```typescript
   import { generateKey } from '@/lib/encryption/encrypt'
   console.log(generateKey()) // Use this as ENCRYPTION_KEY
   ```

3. **If Key Changed:**
   - You'll need to reconnect all integrations
   - Old encrypted data cannot be decrypted with new key

## Debugging Steps

### Step 1: Check Browser Console
When you click "Send Test Email", open browser console (F12) and look for:
- Debug logs showing each step
- Error messages with details
- Token status information

### Step 2: Check Server Logs
Look at your Next.js server terminal for:
- Console.error messages
- Detailed error stacks
- API response errors

### Step 3: Verify Integration Data
Check if integration exists in database:
```sql
SELECT * FROM integrations 
WHERE user_id = 'your-user-id' 
AND type = 'EMAIL' 
AND provider = 'GMAIL' -- or 'OUTLOOK' or 'CUSTOM'
```

### Step 4: Test OAuth Token Manually
For Gmail/Outlook, you can test the token:
```bash
# Gmail
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://gmail.googleapis.com/gmail/v1/users/me/profile

# Outlook
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://graph.microsoft.com/v1.0/me
```

### Step 5: Test SMTP Manually
Use a tool like `telnet` or `openssl`:
```bash
# Test SMTP connection
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

## Environment Variables Checklist

Make sure these are set:
- `ENCRYPTION_KEY` - 64-character hex string
- `GOOGLE_OAUTH_CLIENT_ID` - For Gmail
- `GOOGLE_OAUTH_CLIENT_SECRET` - For Gmail
- `MICROSOFT_OAUTH_CLIENT_ID` - For Outlook
- `MICROSOFT_OAUTH_CLIENT_SECRET` - For Outlook
- `NEXT_PUBLIC_APP_URL` - Your app URL (for OAuth redirects)

## Next Steps After Debugging

1. **Review the debug logs** in browser console
2. **Identify the failing step** from the debug output
3. **Apply the appropriate fix** from this guide
4. **Re-test** the integration
5. **If still failing**, check:
   - OAuth provider status pages
   - Email provider status
   - Network connectivity
   - Firewall rules

## Getting Help

If issues persist:
1. Copy the complete debug log from browser console
2. Check server logs for additional errors
3. Verify all environment variables are set
4. Ensure OAuth apps are properly configured
5. Check if email provider has any restrictions

