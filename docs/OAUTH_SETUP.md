# OAuth Setup Guide for Email Integrations

This guide will help you set up OAuth for Gmail and Outlook email integrations.

## Prerequisites

- Google Cloud Console account (for Gmail)
- Microsoft Azure account (for Outlook)
- Access to your application's environment variables

## Google OAuth Setup (Gmail)

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: Your application name
     - User support email: Your email
     - Developer contact information: Your email
   - Click **Save and Continue**
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Add test users (for development)
   - Click **Save and Continue**

### Step 2: Configure OAuth Client

1. Application type: Select **Web application**
2. Name: Enter a name (e.g., "Veer Email Integration")
3. Authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
4. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/oauth/callback/google`
   - Production: `https://yourdomain.com/api/auth/oauth/callback/google`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
```

## Microsoft OAuth Setup (Outlook)

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **+ New registration**
4. Fill in the form:
   - Name: Your application name (e.g., "Veer Email Integration")
   - Supported account types: Choose based on your needs:
     - **Accounts in any organizational directory and personal Microsoft accounts** (most common)
     - **Accounts in this organizational directory only** (single tenant)
   - Redirect URI:
     - Platform: **Web**
     - URI: `http://localhost:3000/api/auth/oauth/callback/microsoft` (development)
     - Also add: `https://yourdomain.com/api/auth/oauth/callback/microsoft` (production)
5. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `Mail.Send` - Send mail as the user
   - `User.Read` - Sign in and read user profile
   - `offline_access` - Maintain access to data (for refresh tokens)
6. Click **Add permissions**
7. Click **Grant admin consent** (if you're an admin)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Description: Enter a description (e.g., "Email Integration Secret")
4. Expires: Choose expiration (recommend 24 months)
5. Click **Add**
6. **Important:** Copy the secret value immediately (it won't be shown again)

### Step 4: Get Application (Client) ID

1. In your app registration, go to **Overview**
2. Copy the **Application (client) ID**

### Step 5: Add to Environment Variables

Add these to your `.env.local` file:

```env
MICROSOFT_OAUTH_CLIENT_ID=your-application-id-here
MICROSOFT_OAUTH_CLIENT_SECRET=your-client-secret-here
MICROSOFT_OAUTH_TENANT=common  # Optional: 'common', 'organizations', 'consumers', or tenant ID
```

## Environment Variables Summary

Add all these to your `.env.local` file:

```env
# Encryption (required for all integrations)
ENCRYPTION_KEY=your-64-character-hex-string-here

# Google OAuth (for Gmail)
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (for Outlook)
MICROSOFT_OAUTH_CLIENT_ID=your-microsoft-client-id
MICROSOFT_OAUTH_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_OAUTH_TENANT=common  # Optional

# Application URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production
```

## Generating Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use the helper function in `src/lib/encryption/encrypt.ts`:

```typescript
import { generateKey } from '@/lib/encryption/encrypt'
console.log(generateKey())
```

Copy the output and add it to `ENCRYPTION_KEY` in your `.env.local`.

## Testing OAuth Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/integrations`

3. Click **View integration** on Gmail or Outlook card

4. Click **Connect with Gmail** or **Connect with Outlook**

5. You should be redirected to the OAuth provider

6. After authorization, you'll be redirected back to the integrations page

7. The integration should show as connected

## Troubleshooting

### "Invalid redirect URI" Error

- Ensure the redirect URI in your OAuth provider settings **exactly matches** the callback URL
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- For Google: URI should be: `{NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/google`
- For Microsoft: URI should be: `{NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/microsoft`

### "ENCRYPTION_KEY not set" Error

- Make sure `ENCRYPTION_KEY` is set in your `.env.local` file
- The key must be a 64-character hex string (32 bytes)
- Restart your development server after adding the key

### "OAuth credentials not configured" Error

- Verify all OAuth environment variables are set
- Check for typos in variable names
- Ensure no extra spaces in the values

### Token Refresh Issues

- Make sure `offline_access` scope is included (for refresh tokens)
- For Google: Set `access_type=offline` and `prompt=consent` in the OAuth URL
- For Microsoft: Include `offline_access` in the scope list

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Add production redirect URIs in OAuth provider settings
- [ ] Set `ENCRYPTION_KEY` in your production environment
- [ ] Set all OAuth credentials in production environment variables
- [ ] Test OAuth flow in production
- [ ] Verify HTTPS is enabled (required for OAuth in production)
- [ ] Review OAuth consent screen settings
- [ ] Submit OAuth app for verification (if required by provider)

## Security Notes

- **Never commit** `.env.local` or `.env` files to git
- Keep OAuth client secrets secure
- Rotate secrets periodically
- Use different OAuth apps for development and production
- Monitor OAuth usage in provider dashboards
- Set appropriate token expiration times

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Gmail API Scopes](https://developers.google.com/gmail/api/auth/scopes)
- [Microsoft Graph Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)

